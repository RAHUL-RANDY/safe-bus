"use client";

// Define minimal SpeechRecognition interfaces for browser compatibility
interface ISpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((error: unknown) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognitionInstance;
}

class VoiceGuardianService {
  private isVoiceEnabled: boolean = false;
  private recognition: ISpeechRecognitionInstance | null = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initSpeechRecognition();
    }
  }

  private initSpeechRecognition() {
    try {
      const windowWithSpeech = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const SpeechRecognition =
        windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = "en-US";
      }
    } catch (e) {
      console.warn("SpeechRecognition not supported in this browser:", e);
    }
  }

  // Voice Announcement Speech Synthesis
  public speak(text: string, rate: number = 1.0, pitch: number = 1.0) {
    if (!this.isVoiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // Clear any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Select a clear voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  // Start hands-free voice trigger listener
  public startEmergencyVoiceListener(onTriggerSOS: (keyword: string) => void) {
    if (!this.recognition || this.isListening) return;

    try {
      this.recognition.onresult = (event: ISpeechRecognitionEvent) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();

        if (
          transcript.includes("emergency") ||
          transcript.includes("help me") ||
          transcript.includes("sos") ||
          transcript.includes("save me")
        ) {
          this.speak("Emergency distress voice keyword detected. Dispatching priority fleet alert.", 1.1);
          onTriggerSOS(`Voice keyword: "${transcript}"`);
        }
      };

      this.recognition.onerror = (e: unknown) => {
        console.warn("Voice recognition error:", e);
      };

      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.warn("Could not start voice recognition:", e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch {
        // ignore stop errors
      }
    }
  }

  public toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    if (!this.isVoiceEnabled && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return this.isVoiceEnabled;
  }

  public getVoiceState() {
    return this.isVoiceEnabled;
  }
}

let voiceGuardianInstance: VoiceGuardianService | null = null;

export function getVoiceGuardian(): VoiceGuardianService {
  if (!voiceGuardianInstance) {
    voiceGuardianInstance = new VoiceGuardianService();
  }
  return voiceGuardianInstance;
}
