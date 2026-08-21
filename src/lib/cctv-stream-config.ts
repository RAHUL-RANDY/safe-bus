"use client";

export type CCTVChannel = "driver" | "road" | "cabin" | "door";
export type CCTVFeedMode = "simulation" | "webcam" | "ip_stream";

export interface BusCameraConfig {
  busId: string;
  channelStreams: {
    driver: string;
    road: string;
    cabin: string;
    door: string;
  };
  preferredMode: CCTVFeedMode;
  dvrModel?: string;
  rtspGatewayUrl?: string;
}

const DEFAULT_CONFIGS: Record<string, BusCameraConfig> = {
  "BUS-42A": {
    busId: "BUS-42A",
    channelStreams: {
      driver: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      road: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      cabin: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      door: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    },
    preferredMode: "simulation",
    dvrModel: "Hikvision DS-MP7608HN Mobile Bus NVR",
    rtspGatewayUrl: "http://192.168.1.100:8080/stream",
  },
};

const STORAGE_KEY = "safebus_cctv_configs_v1";

export function getBusCameraConfig(busId: string = "BUS-42A"): BusCameraConfig {
  if (typeof window === "undefined") {
    return DEFAULT_CONFIGS[busId] || {
      busId,
      channelStreams: { driver: "", road: "", cabin: "", door: "" },
      preferredMode: "simulation",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[busId]) {
        return parsed[busId];
      }
    }
  } catch (e) {
    console.warn("Failed to read CCTV configs:", e);
  }

  return (
    DEFAULT_CONFIGS[busId] || {
      busId,
      channelStreams: {
        driver: "http://192.168.1.101:8080/video",
        road: "http://192.168.1.102:8080/video",
        cabin: "http://192.168.1.103:8080/video",
        door: "http://192.168.1.104:8080/video",
      },
      preferredMode: "simulation",
      dvrModel: "Hikvision Mobile Bus NVR (4-Ch H.265)",
    }
  );
}

export function saveBusCameraConfig(config: BusCameraConfig): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    existing[config.busId] = config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn("Failed to save CCTV config:", e);
  }
}
