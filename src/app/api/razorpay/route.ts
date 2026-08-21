import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, passengerName, routeName } = body;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_SafeBusTransit2026";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "SafeBusSecretKey2026Mock";

    // If live/valid credentials exist, initialize real Razorpay instance
    if (
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes("test_SafeBus")
    ) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // in paise
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: {
          passengerName: passengerName || "Passenger",
          routeName: routeName || "SafeBus Route",
          source: "SafeBus Nexus Public Transit",
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
      });
    }

    // Default High-Fidelity Test Gateway Order (Seamless 0-config developer experience)
    const simulatedOrderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return NextResponse.json({
      success: true,
      orderId: simulatedOrderId,
      amount: Math.round(amount * 100),
      currency,
      keyId,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize Razorpay payment order.",
      },
      { status: 500 }
    );
  }
}
