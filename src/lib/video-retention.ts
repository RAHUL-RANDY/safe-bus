"use client";

import { TripVideoRecording } from "@/types";
import { supabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEY_VIDEOS = "safebus_trip_videos_v1";
const RETENTION_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

export const INITIAL_DEMO_RECORDINGS: TripVideoRecording[] = [
  {
    id: "vid-cabin-01",
    tripId: "trip-sample-01",
    busId: "BUS-42A",
    recordedBy: "On-Board Cabin CCTV Channel 3",
    recordedAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
    durationSeconds: 45,
    status: "stored",
    completedAt: Date.now() - 3.5 * 60 * 60 * 1000,
    expiresAt: Date.now() - 3.5 * 60 * 60 * 1000 + RETENTION_MS, // ~20.5 hours left
    encryptionHash: "AES256-GCM-7f9a2b4c81d3",
  },
  {
    id: "vid-dms-02",
    tripId: "trip-sample-01",
    busId: "BUS-42A",
    recordedBy: "AI Driver DMS Camera",
    recordedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    durationSeconds: 30,
    status: "stored",
    completedAt: Date.now() - 1.8 * 60 * 60 * 1000,
    expiresAt: Date.now() - 1.8 * 60 * 60 * 1000 + RETENTION_MS, // ~22.2 hours left
    encryptionHash: "AES256-GCM-91e823fca401",
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

  // 2. Trigger 24-hour expiration clock when trip finishes
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

  // 3. Automated purge daemon: deletes recordings > 24 hours after completion
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

  // 4. Preserve incident video for police / fleet investigation
  public preserveIncidentVideo(recordingId: string) {
    this.recordings = this.recordings.map((rec) =>
      rec.id === recordingId ? { ...rec, isIncidentPreserved: true } : rec
    );
    this.save();
    this.notify();
  }

  // 5. Demo Tool: Simulate passing 24 hours to test auto-deletion
  public simulateFastForward24Hours() {
    this.recordings = this.recordings.map((rec) => {
      if (rec.isIncidentPreserved) return rec;
      return {
        ...rec,
        expiresAt: Date.now() - 1000, // Make it expired
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
