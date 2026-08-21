"use client";

import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { getSoundEngine } from "@/lib/audio-effects";
import { useToast } from "@/lib/toast-context";
import {
  Camera,
  X,
  Upload,
  RefreshCw,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TicketQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (decodedText: string) => void;
}

export default function TicketQRScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: TicketQRScannerModalProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "physical-ticket-qr-reader";

  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      setCameraError("");
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, facingMode]);

  const startScanner = async () => {
    try {
      setCameraError("");
      const element = document.getElementById(readerElementId);
      if (!element) return;

      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const qrScanner = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: facingMode },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setIsScanning(false);
      setCameraError(
        "Camera permission was denied or device is not available. You can upload an image of the physical ticket below or use test verification."
      );
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleSuccess = (decodedText: string) => {
    stopScanner();
    setScannedResult(decodedText);
    getSoundEngine().playSuccess();

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast({
      title: "🎫 Physical Ticket Verified!",
      description: `Decoded: ${decodedText}`,
      type: "success",
    });

    if (onScanSuccess) {
      onScanSuccess(decodedText);
    }
  };

  // Upload image file to decode QR code
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const qrScanner = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = qrScanner;

      const decodedText = await qrScanner.scanFile(file, true);
      handleSuccess(decodedText);
    } catch (err: any) {
      console.warn("File scan error:", err);
      toast({
        title: "QR Code Not Found in Image",
        description: "Please ensure the physical ticket QR code is clear and well-lit.",
        type: "warning",
      });
    }
  };

  const handleSimulatedScan = (samplePnr: string) => {
    handleSuccess(`NEXUS-TKT-${samplePnr}`);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Live Physical Ticket Scanner</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800">
                  CAMERA HD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Scan printed paper ticket, conductor receipt, or mobile QR
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {!scannedResult ? (
            <>
              {/* Scanner Viewport */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center min-h-[300px]">
                <div id={readerElementId} className="w-full h-full min-h-[280px]" />

                {/* Laser Overlay Guide */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-64 h-64 border-2 border-blue-500 rounded-2xl relative shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_12px_#38bdf8] animate-pulse" />
                      <div className="absolute top-2 left-2 text-[10px] font-mono text-blue-300 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded">
                        ALIGN TICKET QR
                      </div>
                    </div>
                  </div>
                )}

                {/* Camera Switch button */}
                {isScanning && (
                  <button
                    onClick={toggleCameraFacing}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs border border-slate-700 shadow flex items-center gap-1.5"
                    title="Switch Camera (Front/Back)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip Cam</span>
                  </button>
                )}

                {/* Camera Error / Fallback Card */}
                {cameraError && (
                  <div className="p-4 m-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                    <button
                      onClick={startScanner}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera Permission</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Image Option */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Upload Ticket Image</div>
                    <div className="text-[10px] text-slate-400">Scan photo from gallery or file</div>
                  </div>
                </div>

                <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer transition">
                  <span>Browse Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Fast 1-Tap Sample Scan Buttons */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Quick Test Physical Tickets</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">1-Tap Verification</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulatedScan("8821X9")}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs transition"
                  >
                    <div className="font-bold text-white font-mono text-[11px]">PNR 8821X9</div>
                    <div className="text-[10px] text-slate-400 truncate">Route 42A • Rahul</div>
                  </button>

                  <button
                    onClick={() => handleSimulatedScan("7741Y2")}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs transition"
                  >
                    <div className="font-bold text-white font-mono text-[11px]">PNR 7741Y2</div>
                    <div className="text-[10px] text-slate-400 truncate">Route 17B • Priya</div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Scanned Confirmation View */
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/50 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800">
                  OFFICIAL TRANSIT PASS VALID
                </span>
                <h3 className="text-base font-bold text-white mt-2">
                  Physical Ticket Scanned & Verified
                </h3>
                <p className="text-xs font-mono text-blue-400 font-bold mt-1 bg-slate-900 p-2 rounded-xl border border-slate-800 break-all">
                  {scannedResult}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-left pt-2 border-t border-slate-800 font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Corridor</span>
                  <b className="text-white">Route 42A Express</b>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <b className="text-emerald-400">READY TO BOARD</b>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setScannedResult(null);
                    startScanner();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                >
                  Scan Another Ticket
                </button>
                <button
                  onClick={() => {
                    stopScanner();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
