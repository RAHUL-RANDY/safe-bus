import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

// Test 1: Navigation algorithms & Geo calculations
test("1. Geodesic Navigation Algorithms (Haversine Distance & Bearing)", async () => {
  function calculateDistanceKm(pos1, pos2) {
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

  function calculateBearing(start, end) {
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

  const stop1 = { lat: 12.8399, lng: 77.6770 }; // Electronic City
  const stop2 = { lat: 12.9172, lng: 77.6228 }; // Silk Board

  const distance = calculateDistanceKm(stop1, stop2);
  assert.ok(distance > 5 && distance < 20, `Distance should be ~10km between Electronic City & Silk Board, got ${distance.toFixed(2)} km`);

  const bearing = calculateBearing(stop1, stop2);
  assert.ok(bearing >= 0 && bearing <= 360, `Bearing must be within 0-360 deg, got ${bearing.toFixed(1)} deg`);
});

// Test 2: Video Retention Policy & Purge Logic
test("2. 24-Hour Video Retention & Incident Preservation Engine", async () => {
  const now = Date.now();

  const sampleRecordings = [
    {
      id: "rec-normal",
      tripId: "trip-001",
      busId: "BUS-42A",
      createdAt: now - (25 * 60 * 60 * 1000), // 25h old (expired)
      expiresAt: now - (1 * 60 * 60 * 1000),
      isIncidentPreserved: false,
    },
    {
      id: "rec-sos-incident",
      tripId: "trip-002",
      busId: "BUS-42A",
      createdAt: now - (30 * 60 * 60 * 1000), // 30h old (expired time, BUT preserved)
      expiresAt: now - (6 * 60 * 60 * 1000),
      isIncidentPreserved: true,
      incidentReason: "SOS Emergency Triggered",
    },
    {
      id: "rec-recent",
      tripId: "trip-003",
      busId: "BUS-18B",
      createdAt: now - (2 * 60 * 60 * 1000), // 2h old (fresh)
      expiresAt: now + (22 * 60 * 60 * 1000),
      isIncidentPreserved: false,
    },
  ];

  // Purge expired unpreserved recordings
  const activeRecordings = sampleRecordings.filter((rec) => {
    if (rec.isIncidentPreserved) return true; // Permanently preserved
    return rec.expiresAt > now; // Active within 24h
  });

  assert.equal(activeRecordings.length, 2, "Should retain 2 recordings (1 fresh, 1 preserved incident)");
  assert.ok(activeRecordings.some(r => r.id === "rec-sos-incident"), "Incident-preserved recording must survive 24h purge");
  assert.ok(activeRecordings.some(r => r.id === "rec-recent"), "Fresh recording under 24h must survive");
  assert.ok(!activeRecordings.some(r => r.id === "rec-normal"), "Unpreserved 25h old recording must be purged");
});

// Test 3: AI Assistant Route (/api/ai)
test("3. Live AI Assistant API (/api/ai) Query & Telemetry Context", async () => {
  const response = await fetch(`${BASE_URL}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "What is my next stop and ETA?",
      tripContext: {
        busId: "BUS-42A",
        routeName: "Route 42A - Metro Tech Express",
        nextStop: "Silk Board Central Interchange",
        etaMinutes: 4,
        speed: 42,
        seatNumber: "14B",
      },
    }),
  });

  assert.equal(response.status, 200, "AI API should respond with HTTP 200");
  const data = await response.json();
  assert.ok(data.reply, "Response must include reply text");
  assert.ok(data.reply.includes("Silk Board") || data.reply.includes("4"), "Reply should be grounded in trip context");
  assert.equal(data.isEmergency, false, "Standard ETA query must not flag as emergency");
});

// Test 4: AI Emergency SOS Keyword Triggering
test("4. Live AI Assistant Emergency Detection & Protocol", async () => {
  const response = await fetch(`${BASE_URL}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Someone is threatening me, emergency SOS help!",
      tripContext: {
        busId: "BUS-42A",
        seatNumber: "14B",
      },
    }),
  });

  assert.equal(response.status, 200, "AI API should respond with HTTP 200");
  const data = await response.json();
  assert.equal(data.isEmergency, true, "Threat / distress message must flag isEmergency=true");
  assert.ok(data.reply.includes("SOS") || data.reply.includes("RED"), "Emergency reply must instruct passenger on SOS action");
});

// Test 5: /api/gemini Alias Endpoint
test("5. Gemini API Proxy Alias (/api/gemini)", async () => {
  const response = await fetch(`${BASE_URL}/api/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Hello from test suite",
    }),
  });

  assert.equal(response.status, 200, "/api/gemini must proxy and return HTTP 200");
  const data = await response.json();
  assert.ok(data.reply, "/api/gemini must return a valid reply");
});

// Test 6: HTTP Status & HTML Rendering on All 6 Core Routes
test("6. HTTP Route Health & SSR Render Integrity", async () => {
  const testRoutes = [
    { path: "/", title: "SafeBus" },
    { path: "/passenger", title: "Passenger" },
    { path: "/operator", title: "Command" },
    { path: "/driver", title: "Driver" },
    { path: "/login", title: "Login" },
    { path: "/ticket", title: "Ticket" },
  ];

  for (const route of testRoutes) {
    const res = await fetch(`${BASE_URL}${route.path}`);
    assert.equal(res.status, 200, `Route ${route.path} should return HTTP 200 OK`);
    const html = await res.text();
    assert.ok(html.length > 500, `Route ${route.path} should return full HTML document`);
    assert.ok(html.includes("<!DOCTYPE html>") || html.includes("<html"), `Route ${route.path} must return valid HTML`);
  }
});
