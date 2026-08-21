import { Bus, RouteStop, GeoLocation } from "@/types";

// Route 42A - Metro Tech Express (Bangalore Corridor / Major Metro City)
export const ROUTE_STOPS: RouteStop[] = [
  {
    id: "stop-1",
    name: "Electronic City Phase 1 Hub",
    location: { lat: 12.8399, lng: 77.6770 },
    landmark: "Metro Station Gate 2",
    estimatedTime: "08:00 AM",
  },
  {
    id: "stop-2",
    name: "Silk Board Central Interchange",
    location: { lat: 12.9176, lng: 77.6238 },
    landmark: "Flyover Junction",
    estimatedTime: "08:15 AM",
  },
  {
    id: "stop-3",
    name: "Koramangala 5th Block",
    location: { lat: 12.9352, lng: 77.6245 },
    landmark: "Forum Nexus Galleria",
    estimatedTime: "08:28 AM",
  },
  {
    id: "stop-4",
    name: "Indiranagar 100ft Road",
    location: { lat: 12.9719, lng: 77.6412 },
    landmark: "CMH Road Crossing",
    estimatedTime: "08:42 AM",
  },
  {
    id: "stop-5",
    name: "MG Road Metro Terminal",
    location: { lat: 12.9756, lng: 77.6066 },
    landmark: "Trinity Station Plaza",
    estimatedTime: "08:55 AM",
  },
  {
    id: "stop-6",
    name: "Majestic City Railway Hub",
    location: { lat: 12.9767, lng: 77.5713 },
    landmark: "Platform 1 Terminal",
    estimatedTime: "09:10 AM",
  },
];

// Dense polyline path representing realistic bus navigation along the highway & urban arterial
export const ROUTE_COORDINATES: GeoLocation[] = [
  { lat: 12.8399, lng: 77.6770 },
  { lat: 12.8465, lng: 77.6720 },
  { lat: 12.8550, lng: 77.6650 },
  { lat: 12.8680, lng: 77.6560 },
  { lat: 12.8820, lng: 77.6460 },
  { lat: 12.8950, lng: 77.6370 },
  { lat: 12.9070, lng: 77.6290 },
  { lat: 12.9176, lng: 77.6238 }, // Stop 2 - Silk Board
  { lat: 12.9230, lng: 77.6230 },
  { lat: 12.9285, lng: 77.6235 },
  { lat: 12.9352, lng: 77.6245 }, // Stop 3 - Koramangala
  { lat: 12.9430, lng: 77.6290 },
  { lat: 12.9520, lng: 77.6340 },
  { lat: 12.9610, lng: 77.6380 },
  { lat: 12.9719, lng: 77.6412 }, // Stop 4 - Indiranagar
  { lat: 12.9730, lng: 77.6300 },
  { lat: 12.9745, lng: 77.6180 },
  { lat: 12.9756, lng: 77.6066 }, // Stop 5 - MG Road
  { lat: 12.9760, lng: 77.5950 },
  { lat: 12.9763, lng: 77.5830 },
  { lat: 12.9767, lng: 77.5713 }, // Stop 6 - Majestic
];

export const INITIAL_BUSES: Bus[] = [
  {
    id: "BUS-42A",
    routeName: "Route 42A • Metro Tech Express",
    routeCode: "42A",
    plateNumber: "KA 01 F 8821",
    driverName: "Rajesh Kumar",
    driverPhone: "+91 98450 12345",
    currentLocation: { lat: 12.8465, lng: 77.6720 },
    speed: 42,
    heading: 320,
    nextStop: "Silk Board Central Interchange",
    nextStopIndex: 1,
    etaMinutes: 6,
    occupancy: 28,
    capacity: 45,
    status: "on-route",
    lastUpdated: Date.now(),
  },
  {
    id: "BUS-18B",
    routeName: "Route 18B • Airport Direct Link",
    routeCode: "18B",
    plateNumber: "KA 04 E 4910",
    driverName: "Suresh Gowda",
    driverPhone: "+91 98860 67890",
    currentLocation: { lat: 12.9352, lng: 77.6245 },
    speed: 38,
    heading: 45,
    nextStop: "Indiranagar 100ft Road",
    nextStopIndex: 3,
    etaMinutes: 11,
    occupancy: 19,
    capacity: 45,
    status: "on-route",
    lastUpdated: Date.now(),
  },
];

// Helper to calculate heading bearing between two lat/lng coords
export function calculateBearing(start: GeoLocation, end: GeoLocation): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Calculate distance in km (Haversine formula)
export function calculateDistanceKm(pos1: GeoLocation, pos2: GeoLocation): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
