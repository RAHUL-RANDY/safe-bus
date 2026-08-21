export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface RouteStop {
  id: string;
  name: string;
  location: GeoLocation;
  landmark: string;
  estimatedTime: string;
}

export interface Bus {
  id: string;
  routeName: string;
  routeCode: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  currentLocation: GeoLocation;
  speed: number; // km/h
  heading: number; // degrees
  nextStop: string;
  nextStopIndex: number;
  etaMinutes: number;
  occupancy: number; // passenger count
  capacity: number;
  status: "on-route" | "delayed" | "stopped" | "emergency";
  lastUpdated: number; // timestamp
}

export interface Trip {
  tripId: string;
  passengerId: string;
  passengerName: string;
  busId: string;
  routeCode: string;
  routeName: string;
  originStop: string;
  destinationStop: string;
  seatNumber: string;
  status: "active" | "completed";
  startedAt: number;
  completedAt?: number;
  currentLocation: GeoLocation;
  emergencyContact: {
    name: string;
    phone: string;
  };
}

export interface Alert {
  id: string;
  tripId: string;
  busId: string;
  passengerName: string;
  type: "sos" | "speed_anomaly" | "route_deviation" | "medical" | "harassment";
  location: GeoLocation;
  timestamp: number;
  status: "open" | "acknowledged" | "resolved";
  message?: string;
  acknowledgedAt?: number;
  resolvedAt?: number;
  operatorNotes?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: number;
  suggestions?: string[];
  isEmergencyRelated?: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "passenger" | "operator" | "admin";
  avatar?: string;
  badgeId?: string;
  assignedBusId?: string;
}

export interface TripVideoRecording {
  id: string;
  tripId?: string;
  busId: string;
  recordedBy: string;
  recordedAt: number;
  durationSeconds: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: "recording" | "stored" | "expired" | "deleted";
  completedAt?: number;
  expiresAt: number; // Exactly 24 hours after completed ride
  isIncidentPreserved?: boolean;
  encryptionHash: string;
}
