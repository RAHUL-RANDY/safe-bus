"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bus, RouteStop, Alert, GeoLocation } from "@/types";
import { ROUTE_STOPS, ROUTE_COORDINATES } from "@/lib/route-data";
import { Navigation, MapPin, Eye, Compass, Layers, ShieldAlert, Camera, Video } from "lucide-react";
import CameraModal from "@/components/common/CameraModal";

interface InteractiveMapProps {
  buses: Bus[];
  activeBusId?: string;
  alerts?: Alert[];
  showRoutePolyline?: boolean;
  showStops?: boolean;
  height?: string;
  onBusSelect?: (bus: Bus) => void;
  focusLocation?: GeoLocation | null;
}

export default function InteractiveMap({
  buses,
  activeBusId = "BUS-42A",
  alerts = [],
  showRoutePolyline = true,
  showStops = true,
  height = "100%",
  onBusSelect,
  focusLocation,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkersRef = useRef<Map<string, any>>(new Map());
  const alertMarkersRef = useRef<Map<string, any>>(new Map());
  const polylineLayerRef = useRef<any>(null);
  const stopMarkersLayerRef = useRef<any>(null);

  const [followBus, setFollowBus] = useState<boolean>(true);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      const initialCenter = buses[0]?.currentLocation || { lat: 12.9176, lng: 77.6238 };

      const map = L.map(mapContainerRef.current, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Ultra-sleek CartoDB Dark Matter tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Draw Route Polyline & Stops
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    async function drawRoute() {
      const L = (await import("leaflet")).default;

      // Clear existing polyline
      if (polylineLayerRef.current) {
        map.removeLayer(polylineLayerRef.current);
      }
      if (stopMarkersLayerRef.current) {
        map.removeLayer(stopMarkersLayerRef.current);
      }

      if (showRoutePolyline) {
        const latLngs: L.LatLngTuple[] = ROUTE_COORDINATES.map((c) => [c.lat, c.lng] as [number, number]);
        // Background glow
        const glowLine = L.polyline(latLngs, {
          color: "#06B6D4",
          weight: 7,
          opacity: 0.35,
          lineCap: "round",
          lineJoin: "round",
        });
        // Foreground line
        const coreLine = L.polyline(latLngs, {
          color: "#38BDF8",
          weight: 3.5,
          opacity: 0.9,
          dashArray: "8, 6",
        });

        const featureGroup = L.featureGroup([glowLine, coreLine]).addTo(map);
        polylineLayerRef.current = featureGroup;
      }

      if (showStops) {
        const stopMarkers: any[] = [];
        ROUTE_STOPS.forEach((stop, index) => {
          const isFirst = index === 0;
          const isLast = index === ROUTE_STOPS.length - 1;

          const stopHtml = `
            <div class="relative flex items-center justify-center group cursor-pointer">
              <div class="w-4 h-4 rounded-full ${
                isFirst
                  ? "bg-emerald-400 border-2 border-white shadow-[0_0_10px_#10B981]"
                  : isLast
                  ? "bg-amber-400 border-2 border-white shadow-[0_0_10px_#F59E0B]"
                  : "bg-slate-900 border-2 border-cyan-400 shadow-[0_0_8px_#06B6D4]"
              }"></div>
            </div>
          `;

          const stopIcon = L.divIcon({
            html: stopHtml,
            className: "custom-stop-icon",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          const marker = L.marker([stop.location.lat, stop.location.lng], {
            icon: stopIcon,
          }).bindPopup(`
            <div class="p-1">
              <div class="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-0.5">Stop ${index + 1}</div>
              <div class="text-sm font-semibold text-slate-100">${stop.name}</div>
              <div class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span>📍</span> ${stop.landmark}
              </div>
              <div class="text-xs text-emerald-400 font-mono mt-1">Est: ${stop.estimatedTime}</div>
            </div>
          `);

          stopMarkers.push(marker);
        });

        const stopGroup = L.featureGroup(stopMarkers).addTo(map);
        stopMarkersLayerRef.current = stopGroup;
      }
    }

    drawRoute();
  }, [mapReady, showRoutePolyline, showStops]);

  // Update Buses on Map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    async function updateBuses() {
      const L = (await import("leaflet")).default;

      buses.forEach((bus) => {
        const isEmergency = bus.status === "emergency";
        const isSelected = bus.id === activeBusId;

        const busHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300">
            ${
              isEmergency
                ? `<div class="absolute -inset-3 rounded-full bg-red-600 animate-ping opacity-75"></div>
                   <div class="absolute -inset-2 rounded-full bg-red-500 animate-pulse opacity-90"></div>`
                : `<div class="absolute -inset-2 rounded-full bg-cyan-400/30 animate-pulse"></div>`
            }
            <div class="relative w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xl ${
              isEmergency
                ? "bg-gradient-to-tr from-red-600 to-rose-500 border-2 border-red-200 shadow-[0_0_20px_#EF4444]"
                : isSelected
                ? "bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 border-2 border-cyan-300 shadow-[0_0_18px_#22D3EE]"
                : "bg-slate-900 border-2 border-cyan-400"
            }" style="transform: rotate(${bus.heading || 0}deg);">
              <svg class="w-5 h-5 text-white transform -rotate-${bus.heading || 0}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 7h8m-8 4h8m-5 8v2m-6-2v2m14-2v2M4 6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap bg-slate-950/90 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-cyan-500/40 text-cyan-300 shadow">
              ${bus.id} • ${bus.speed}km/h
            </div>
          </div>
        `;

        const busIcon = L.divIcon({
          html: busHtml,
          className: "custom-bus-icon",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        let marker = busMarkersRef.current.get(bus.id);
        if (marker) {
          marker.setLatLng([bus.currentLocation.lat, bus.currentLocation.lng]);
          marker.setIcon(busIcon);
        } else {
          marker = L.marker([bus.currentLocation.lat, bus.currentLocation.lng], {
            icon: busIcon,
            zIndexOffset: 1000,
          }).addTo(map);

          marker.on("click", () => {
            if (onBusSelect) onBusSelect(bus);
          });

          marker.bindPopup(`
            <div class="p-2 min-w-[180px]">
              <div class="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1 mb-1.5">
                <span class="text-xs font-bold text-cyan-400 font-mono">${bus.id}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  isEmergency ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                }">${bus.status.toUpperCase()}</span>
              </div>
              <div class="text-xs font-bold text-white mb-1">${bus.routeName}</div>
              <div class="text-xs text-slate-300">Driver: <span class="text-white">${bus.driverName}</span></div>
              <div class="text-xs text-slate-300">Speed: <span class="text-cyan-300 font-mono">${bus.speed} km/h</span></div>
              <div class="text-xs text-slate-300">Next: <span class="text-white font-medium">${bus.nextStop}</span></div>
              <div class="text-xs text-amber-300 font-mono mt-1">ETA: ${bus.etaMinutes} mins</div>
            </div>
          `);

          busMarkersRef.current.set(bus.id, marker);
        }
      });

      // Pan to active bus if following
      const activeBus = buses.find((b) => b.id === activeBusId);
      if (activeBus && followBus && !focusLocation) {
        map.panTo([activeBus.currentLocation.lat, activeBus.currentLocation.lng], {
          animate: true,
          duration: 1,
        });
      }
    }

    updateBuses();
  }, [buses, activeBusId, mapReady, followBus, focusLocation, onBusSelect]);

  // Handle SOS Alert markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    async function updateAlerts() {
      const L = (await import("leaflet")).default;

      // Remove stale markers
      alertMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      alertMarkersRef.current.clear();

      alerts
        .filter((a) => a.status !== "resolved")
        .forEach((alert) => {
          const alertHtml = `
            <div class="relative flex items-center justify-center cursor-pointer">
              <div class="absolute -inset-3 rounded-full bg-red-600 animate-ping opacity-90"></div>
              <div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-[0_0_20px_#EF4444]">
                <span class="text-white text-xs font-black">SOS</span>
              </div>
            </div>
          `;

          const alertIcon = L.divIcon({
            html: alertHtml,
            className: "custom-sos-icon",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([alert.location.lat, alert.location.lng], {
            icon: alertIcon,
            zIndexOffset: 2000,
          }).addTo(map);

          marker.bindPopup(`
            <div class="p-2 min-w-[200px]">
              <div class="flex items-center gap-1.5 text-red-400 font-bold text-xs mb-1">
                <span>🚨</span> EMERGENCY SOS ALERT
              </div>
              <div class="text-xs text-slate-200">Passenger: <b>${alert.passengerName}</b></div>
              <div class="text-xs text-slate-200">Bus: <b class="font-mono">${alert.busId}</b></div>
              <div class="text-xs text-slate-400 mt-1">Status: <span class="uppercase text-amber-400 font-bold">${alert.status}</span></div>
            </div>
          `);

          alertMarkersRef.current.set(alert.id, marker);
        });
    }

    updateAlerts();
  }, [alerts, mapReady]);

  // Focus location change handler
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !focusLocation) return;
    mapInstanceRef.current.flyTo([focusLocation.lat, focusLocation.lng], 15, {
      animate: true,
      duration: 1.5,
    });
  }, [focusLocation, mapReady]);

  const activeBus = buses.find((b) => b.id === activeBusId) || buses[0];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-slate-950 isolate z-0" style={{ height }}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full relative z-0" />

      {/* Loading Skeleton */}
      {!mapReady && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
            <Compass className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-sm font-bold text-white">Initializing Telematics Map...</div>
          <div className="text-xs text-slate-400 mt-1">Connecting to SafeBus live GPS grid</div>
        </div>
      )}

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-200 shadow-lg border border-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]"></div>
          <span>Live GPS Telemetry</span>
          <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
            3s Refresh
          </span>
        </div>

        {activeBus && (
          <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-300 border border-white/10">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Next: <b className="text-white">{activeBus.nextStop}</b>
            </span>
            <span className="text-amber-400 font-mono font-semibold">({activeBus.etaMinutes} min)</span>
          </div>
        )}
      </div>

      {/* Map Action Quick Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => {
            setFollowBus(!followBus);
            if (!followBus && activeBus && mapInstanceRef.current) {
              mapInstanceRef.current.panTo([
                activeBus.currentLocation.lat,
                activeBus.currentLocation.lng,
              ]);
            }
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-lg border ${
            followBus
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
              : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800"
          }`}
          title="Toggle Auto-Follow Bus"
        >
          <Compass className={`w-4 h-4 ${followBus ? "animate-spin text-cyan-400" : ""}`} />
          <span>{followBus ? "Tracking Bus" : "Free Roam"}</span>
        </button>

        <button
          onClick={() => {
            if (activeBus && mapInstanceRef.current) {
              mapInstanceRef.current.flyTo(
                [activeBus.currentLocation.lat, activeBus.currentLocation.lng],
                14,
                { animate: true, duration: 1 }
              );
            }
          }}
          className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 shadow-lg backdrop-blur-md transition-all"
        >
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Recenter</span>
        </button>

        <button
          onClick={() => setIsCameraModalOpen(true)}
          className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-400/40 shadow-lg backdrop-blur-md transition-all"
          title="Open Live On-Board CCTV Stream"
        >
          <Camera className="w-4 h-4 text-cyan-300" />
          <span>Bus Live CCTV</span>
        </button>
      </div>

      {/* Speed & Heading HUD Overlay */}
      {activeBus && (
        <div className="absolute bottom-4 left-4 z-20 glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-4 text-xs shadow-xl border border-white/10">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Speed</div>
            <div className="text-lg font-black text-cyan-300 font-mono">
              {activeBus.speed} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Bus ID</div>
            <div className="text-sm font-bold text-white font-mono">{activeBus.id}</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
            <div
              className={`text-xs font-bold uppercase ${
                activeBus.status === "emergency"
                  ? "text-red-400 animate-pulse font-black"
                  : "text-emerald-400"
              }`}
            >
              {activeBus.status === "emergency" ? "🚨 SOS ACTIVE" : "🟢 ON TRACK"}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Live Camera Modal */}
      {activeBus && (
        <CameraModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          busId={activeBus.id}
          title={`SafeBus Live On-Board CCTV: ${activeBus.id}`}
          subtitle={`Pilot: ${activeBus.driverName} • Route: ${activeBus.routeName}`}
        />
      )}
    </div>
  );
}
