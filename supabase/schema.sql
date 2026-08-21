-- ==============================================================================
-- SafeBus Nexus - Supabase Schema & Realtime Setup
-- ==============================================================================

-- 1. Create Buses Table
CREATE TABLE IF NOT EXISTS public.buses (
  id TEXT PRIMARY KEY,
  "routeName" TEXT NOT NULL,
  "routeCode" TEXT NOT NULL,
  "plateNumber" TEXT NOT NULL,
  "driverName" TEXT NOT NULL,
  "driverPhone" TEXT NOT NULL,
  "currentLocation" JSONB NOT NULL,
  speed NUMERIC NOT NULL DEFAULT 0,
  heading NUMERIC NOT NULL DEFAULT 0,
  "nextStop" TEXT NOT NULL,
  "nextStopIndex" INTEGER NOT NULL DEFAULT 0,
  "etaMinutes" INTEGER NOT NULL DEFAULT 0,
  occupancy INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 45,
  status TEXT NOT NULL DEFAULT 'on-route',
  "lastUpdated" BIGINT NOT NULL
);

-- 2. Create Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  "tripId" TEXT PRIMARY KEY,
  "passengerId" TEXT NOT NULL,
  "passengerName" TEXT NOT NULL,
  "busId" TEXT NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  "routeCode" TEXT NOT NULL,
  "routeName" TEXT NOT NULL,
  "originStop" TEXT NOT NULL,
  "destinationStop" TEXT NOT NULL,
  "seatNumber" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  "startedAt" BIGINT NOT NULL,
  "completedAt" BIGINT,
  "currentLocation" JSONB NOT NULL,
  "emergencyContact" JSONB NOT NULL
);

-- 3. Create Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL,
  "busId" TEXT NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  "passengerName" TEXT NOT NULL,
  type TEXT NOT NULL,
  location JSONB NOT NULL,
  timestamp BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  message TEXT,
  "acknowledgedAt" BIGINT,
  "resolvedAt" BIGINT,
  "operatorNotes" TEXT
);

-- 4. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  is_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create 24-Hour Ephemeral Video Recordings Table
CREATE TABLE IF NOT EXISTS public.trip_video_recordings (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
  bus_id TEXT NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  recorded_by TEXT NOT NULL,
  recorded_at BIGINT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'stored',
  completed_at BIGINT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 24 hours after completed ride
  is_incident_preserved BOOLEAN DEFAULT FALSE, -- Retain if flagged for legal SOS evidence
  encryption_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- Automated 24-Hour Purge Function & Extension
-- Automatically deletes expired video recordings > 24 hours after completed ride
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.purge_expired_trip_videos()
RETURNS void AS $$
BEGIN
  DELETE FROM public.trip_video_recordings
  WHERE expires_at < NOW() AND is_incident_preserved = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- Row Level Security (RLS) - Enable and Allow Demo Access
-- ==============================================================================
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_video_recordings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read & write for active simulation / demo
CREATE POLICY "Allow public read access on buses" ON public.buses FOR SELECT USING (true);
CREATE POLICY "Allow public write access on buses" ON public.buses FOR ALL USING (true);

CREATE POLICY "Allow public read access on trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Allow public write access on trips" ON public.trips FOR ALL USING (true);

CREATE POLICY "Allow public read access on alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Allow public write access on alerts" ON public.alerts FOR ALL USING (true);

CREATE POLICY "Allow public read access on chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public write access on chat_messages" ON public.chat_messages FOR ALL USING (true);

CREATE POLICY "Allow public read access on trip_video_recordings" ON public.trip_video_recordings FOR SELECT USING (true);
CREATE POLICY "Allow public write access on trip_video_recordings" ON public.trip_video_recordings FOR ALL USING (true);

-- ==============================================================================
-- Enable Realtime Broadcast for Supabase
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.buses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_video_recordings;
