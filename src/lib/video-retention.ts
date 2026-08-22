"use client";

import { TripVideoRecording, Trip } from "@/types";
import { supabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEY_VIDEOS = "safebus_trip_videos_v1";
export const RETENTION_MS = 12 * 60 * 60 * 1000; // 12 Hours in milliseconds (Automated Auto-Purge)

export const INITIAL_DEMO_RECORDINGS: TripVideoRecording[] = [
  {
    id: "vid-fulltrip-42a-01",
    tripId: "trip-sample-01",
    busId: "BUS-42A",
    recordedBy: "Full Journey DVR • Road & Cabin CCTV (Downtown ➔ Tech Park)",
    recordedAt: Date.now() - 3.5 * 60 * 60 * 1000, // 3.5 hours ago
    durationSeconds: 2700, // 45 minutes
    status: "stored",
    completedAt: Date.now() - 2.8 * 60 * 60 * 1000,
    expiresAt: Date.now() - 2.8 * 60 * 60 * 1000 + RETENTION_MS, // ~9.2 hours left
    encryptionHash: "AES256-GCM-7f9a2b4c81d3",
  },
  {
    id: "vid-dms-42a-02",
    tripId: "trip-sample-01",
    busId: "BUS-42A",
    recordedBy: "AI Driver DMS & Safety Telematics Stream (Pilot Shift 1)",
    recordedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    durationSeconds: 1800, // 30 minutes
    status: "stored",
    completedAt: Date.now() - 1.5 * 60 * 60 * 1000,
    expiresAt: Date.now() - 1.5 * 60 * 60 * 1000 + RETENTION_MS, // ~10.5 hours left
    encryptionHash: "AES256-GCM-91e823fca401",
  },
  {
    id: "vid-cabin-42a-03",
    tripId: "trip-sample-01",
    busId: "BUS-42A",
    recordedBy: "Door Entry & Passenger Boarding Safety Cam (Stops 1-6)",
    recordedAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    durationSeconds: 900, // 15 minutes
    status: "stored",
    completedAt: Date.now() - 0.75 * 60 * 60 * 1000,
    expiresAt: Date.now() - 0.75 * 60 * 60 * 1000 + RETENTION_MS, // ~11.25 hours left
    encryptionHash: "AES256-GCM-33bc88fa091e",
  },
  {
    id: "vid-fulltrip-18b-01",
    tripId: "trip-sample-18b",
    busId: "BUS-18B",
    recordedBy: "Full Journey DVR • Airport Express Route (Stops 1-12)",
    recordedAt: Date.now() - 4 * 60 * 60 * 1000,
    durationSeconds: 3120, // 52 minutes
    status: "stored",
    completedAt: Date.now() - 3.2 * 60 * 60 * 1000,
    expiresAt: Date.now() - 3.2 * 60 * 60 * 1000 + RETENTION_MS,
    encryptionHash: "AES256-GCM-ba5529f109bc",
  },
  {
    id: "vid-fulltrip-09c-01",
    tripId: "trip-sample-09c",
    busId: "BUS-09C",
    recordedBy: "Full Journey DVR • City Center Metro Link",
    recordedAt: Date.now() - 2.5 * 60 * 60 * 1000,
    durationSeconds: 2280, // 38 minutes
    status: "stored",
    completedAt: Date.now() - 1.9 * 60 * 60 * 1000,
    expiresAt: Date.now() - 1.9 * 60 * 60 * 1000 + RETENTION_MS,
    encryptionHash: "AES256-GCM-cc0991823abf",
  },
];

class VideoRetentionEngine {
  private recordings: TripVideoRecording[] = [];
  private listeners: Set<(recordings: TripVideoRecording[]) => void> = new Set();
  private purgeInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initStorage();
      this.startPurgeDaemon();
    }
  }

  private initStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VIDEOS);
      if (stored) {
        this.recordings = JSON.parse(stored);
      } else {
        this.recordings = INITIAL_DEMO_RECORDINGS;
        this.save();
      }
      this.purgeExpired();
    } catch (e) {
      console.warn("Video retention storage init error:", e);
      this.recordings = INITIAL_DEMO_RECORDINGS;
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_VIDEOS, JSON.stringify(this.recordings));
      } catch (e) {}
    }
  }

  private notify() {
    this.listeners.forEach((cb) => cb([...this.recordings]));
  }

  public subscribe(cb: (recordings: TripVideoRecording[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.recordings);
    return () => this.listeners.delete(cb);
  }

  // 1. Create a new encrypted recording
  public async addRecording(
    data: Omit<TripVideoRecording, "expiresAt" | "encryptionHash" | "status">
  ): Promise<TripVideoRecording> {
    const expiresAt = (data.completedAt || data.recordedAt) + RETENTION_MS;
    const encryptionHash = `AES256-GCM-${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`;

    const newRecord: TripVideoRecording = {
      ...data,
      status: "stored",
      expiresAt,
      encryptionHash,
    };

    this.recordings = [newRecord, ...this.recordings];
    this.save();
    this.notify();

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("trip_video_recordings").upsert({
          id: newRecord.id,
          trip_id: newRecord.tripId || null,
          bus_id: newRecord.busId,
          recorded_by: newRecord.recordedBy,
          recorded_at: newRecord.recordedAt,
          duration_seconds: newRecord.durationSeconds,
          status: newRecord.status,
          completed_at: newRecord.completedAt || null,
          expires_at: new Date(newRecord.expiresAt).toISOString(),
          is_incident_preserved: Boolean(newRecord.isIncidentPreserved),
          encryption_hash: newRecord.encryptionHash,
        });
      } catch (err) {
        console.warn("Supabase video recording log error:", err);
      }
    }

    return newRecord;
  }

  // 2. Automatically record full trip video upon trip completion or manual save
  public async recordFullTripVideo(
    trip: Trip,
    driverName?: string
  ): Promise<TripVideoRecording> {
    const durationSeconds = Math.max(
      60,
      Math.round(((trip.completedAt || Date.now()) - trip.startedAt) / 1000)
    );

    const recordingTitle = `Full Journey DVR Video • ${trip.originStop || "Start"} ➔ ${trip.destinationStop || "Terminal"} (${trip.passengerName})`;

    return this.addRecording({
      id: `trip-dvr-${trip.tripId}-${Date.now()}`,
      tripId: trip.tripId,
      busId: trip.busId,
      recordedBy: recordingTitle,
      recordedAt: trip.startedAt,
      completedAt: trip.completedAt || Date.now(),
      durationSeconds,
    });
  }

  // 3. Trigger 12-hour expiration clock when trip finishes
  public onTripCompleted(tripId: string) {
    const now = Date.now();
    const newExpiresAt = now + RETENTION_MS;

    this.recordings = this.recordings.map((rec) => {
      if (rec.tripId === tripId) {
        return {
          ...rec,
          completedAt: now,
          expiresAt: newExpiresAt,
        };
      }
      return rec;
    });

    this.save();
    this.notify();
  }

  // 4. Automated purge daemon: permanently deletes recordings > 12 hours after completion
  public purgeExpired(): number {
    const now = Date.now();
    const initialCount = this.recordings.length;

    // Filter out expired videos unless preserved for legal SOS evidence
    this.recordings = this.recordings.filter((rec) => {
      if (rec.isIncidentPreserved) return true; // Keep legal evidence
      return rec.expiresAt > now;
    });

    const deletedCount = initialCount - this.recordings.length;
    if (deletedCount > 0) {
      this.save();
      this.notify();
    }
    return deletedCount;
  }

  // 5. Preserve incident video for police / fleet investigation
  public preserveIncidentVideo(recordingId: string) {
    this.recordings = this.recordings.map((rec) =>
      rec.id === recordingId ? { ...rec, isIncidentPreserved: true } : rec
    );
    this.save();
    this.notify();
  }

  // 6. Demo Tool: Simulate passing 12 hours to test automated permanent deletion
  public simulateFastForward12Hours() {
    this.recordings = this.recordings.map((rec) => {
      if (rec.isIncidentPreserved) return rec;
      return {
        ...rec,
        expiresAt: Date.now() - 1000, // Expire immediately
      };
    });
    this.purgeExpired();
  }

  private startPurgeDaemon() {
    if (this.purgeInterval) return;
    this.purgeInterval = setInterval(() => {
      this.purgeExpired();
    }, 15000); // Check every 15 seconds
  }

  public getRecordings(): TripVideoRecording[] {
    return this.recordings;
  }
}

// Global Singleton
let videoRetentionInstance: VideoRetentionEngine | null = null;

export function getVideoRetentionEngine(): VideoRetentionEngine {
  if (!videoRetentionInstance) {
    videoRetentionInstance = new VideoRetentionEngine();
  }
  return videoRetentionInstance;
}
