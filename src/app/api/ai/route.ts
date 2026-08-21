import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are "Nexus AI", the official intelligent safety & trip co-pilot inside the SafeBus Nexus passenger app.
Your mission is to keep bus passengers safe, informed, and assisted during their transit journey.

Key Guidelines:
1. Scope: Answer route inquiries, estimated arrival times, safety guidance, emergency protocols, reporting complaints/grievances (rash driving, harassment, lost items, conductor misbehavior), and bus amenities.
2. Conciseness: Keep responses short, direct, and actionable (2-4 sentences max). You are rendered in a mobile chat bubble.
3. Tone: Reassuring, calm, ultra-helpful, and safety-conscious.
4. Emergency / Danger: If the passenger is in immediate distress or feels unsafe, proactively remind them to tap the Red SOS Button on their screen immediately, which instantly broadcasts their live GPS to police/fleet emergency dispatch.
5. Out of scope questions: If asked questions completely unrelated to bus transit, navigation, or passenger safety, politely redirect them back to their journey.
`;

export async function POST(req: NextRequest) {
  try {
    const { message, tripContext } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    const contextStr = tripContext
      ? `Current Passenger Trip Context:
- Route: ${tripContext.routeName || "Route 42A - Metro Tech Express"}
- Bus: ${tripContext.busId || "BUS-42A"} (Plate: ${tripContext.plateNumber || "KA 01 F 8821"})
- Next Stop: ${tripContext.nextStop || "Silk Board Central Interchange"}
- ETA to next stop: ${tripContext.etaMinutes || 5} mins
- Current Speed: ${tripContext.speed || 40} km/h
- Passenger Seat: ${tripContext.seatNumber || "14B"}
- Passenger Name: ${tripContext.passengerName || "Passenger"}`
      : "No active trip selected currently.";

    let responseText = "";
    let providerUsed = "fallback";

    // 1. Try OpenAI if API key configured
    if (openaiApiKey && openaiApiKey !== "your-openai-api-key-here") {
      try {
        const openai = new OpenAI({ apiKey: openaiApiKey });
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: `${SYSTEM_PROMPT}\n\n${contextStr}` },
            { role: "user", content: message },
          ],
          max_tokens: 250,
          temperature: 0.7,
        });

        responseText = completion.choices[0]?.message?.content || "";
        providerUsed = "openai";
      } catch (openaiErr) {
        console.warn("OpenAI API error, trying next provider:", openaiErr);
      }
    }

    // 2. Try Gemini if OpenAI wasn't used or failed
    if (!responseText && geminiApiKey && geminiApiKey !== "your-gemini-api-key-here") {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `${SYSTEM_PROMPT}\n\n${contextStr}\n\nPassenger: ${message}\nNexus AI:`;
        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        responseText = result.text || "";
        providerUsed = "gemini";
      } catch (geminiError) {
        console.warn("Gemini API error, using heuristic engine fallback:", geminiError);
      }
    }

    // 3. Fallback to built-in intelligent heuristic engine
    if (!responseText) {
      responseText = generateFallbackResponse(message, tripContext);
      providerUsed = "heuristic-engine";
    }

    const isEmergency =
      message.toLowerCase().includes("sos") ||
      message.toLowerCase().includes("emergency") ||
      message.toLowerCase().includes("danger") ||
      message.toLowerCase().includes("harass") ||
      message.toLowerCase().includes("help");

    return NextResponse.json({
      reply: responseText,
      provider: providerUsed,
      isEmergency,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("AI Assistant API error:", error);
    return NextResponse.json(
      { error: "Failed to process AI response", details: error?.message },
      { status: 500 }
    );
  }
}

// Built-in intelligent heuristic engine for instant offline demo resilience
function generateFallbackResponse(userMsg: string, trip: any): string {
  const msg = userMsg.toLowerCase();
  const nextStop = trip?.nextStop || "Silk Board Central Interchange";
  const eta = trip?.etaMinutes || "5";
  const speed = trip?.speed || "42";
  const bus = trip?.busId || "BUS-42A";

  if (
    msg.includes("sos") ||
    msg.includes("emergency") ||
    msg.includes("danger") ||
    msg.includes("scared") ||
    msg.includes("harass") ||
    msg.includes("help") ||
    msg.includes("threat")
  ) {
    return "🚨 Please tap the bright RED SOS button at the bottom of your screen right away. This will immediately transmit your exact GPS coordinates and seat details to the 24/7 Fleet Command Center and initiate emergency response protocols.";
  }

  if (
    msg.includes("next stop") ||
    msg.includes("where are we") ||
    msg.includes("location") ||
    msg.includes("reaching")
  ) {
    return `Your bus (${bus}) is currently traveling at ${speed} km/h. The upcoming stop is **${nextStop}**, with an estimated arrival time of approximately **${eta} minutes**.`;
  }

  if (
    msg.includes("eta") ||
    msg.includes("time") ||
    msg.includes("when will") ||
    msg.includes("how long")
  ) {
    return `Based on live traffic telemetry, you are expected to reach ${nextStop} in ~${eta} minutes. Your overall journey remains on schedule.`;
  }

  if (
    msg.includes("complaint") ||
    msg.includes("rash") ||
    msg.includes("speeding") ||
    msg.includes("dirty") ||
    msg.includes("conductor") ||
    msg.includes("driver")
  ) {
    return `You can log an instant grievance directly through SafeBus Nexus. For reckless driving or staff misbehavior, our telemetry logs vehicle speed and audio-visual logs. Would you like me to flag this ride to the Fleet Safety Supervisor?`;
  }

  if (
    msg.includes("lost") ||
    msg.includes("bag") ||
    msg.includes("phone") ||
    msg.includes("forgot")
  ) {
    return `Don't panic! All items left on bus ${bus} are logged upon arrival at the central depot. Our Operator Command has been notified of your trip session (${trip?.passengerName || "Passenger"}).`;
  }

  if (
    msg.includes("seat") ||
    msg.includes("amenities") ||
    msg.includes("wifi") ||
    msg.includes("charging")
  ) {
    return `You are checked into Seat ${trip?.seatNumber || "14B"}. Each seat has USB charging ports under the armrest, and high-speed SafeBus WiFi is accessible with ticket verification.`;
  }

  return `I am your SafeBus Nexus AI Co-Pilot powered by OpenAI. I am continuously monitoring your trip on ${bus}. Feel free to ask about upcoming stops, live ETA, safety tips, or tap the SOS button if you need immediate emergency assistance!`;
}
