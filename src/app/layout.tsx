import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider } from "@/lib/toast-context";
import MobileBottomNav from "@/components/common/MobileBottomNav";
import AppLoadingScreen from "@/components/common/AppLoadingScreen";

export const metadata: Metadata = {
  title: "SafeBus Nexus — Where AI Protects Every Journey",
  description:
    "AI-powered smart mobility platform improving passenger safety with real-time GPS telemetry, one-tap emergency SOS, Gemini assistant, and live operator command.",
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" data-theme="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        {/* Google Fonts – must be in <head> not CSS for proper PostCSS ordering */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col text-slate-100 pb-16 md:pb-0 selection:bg-blue-500 selection:text-white">
        <AppLoadingScreen />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <MobileBottomNav />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
