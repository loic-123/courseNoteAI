import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        paid: true,
        customerEmail: session.customer_details?.email,
      });
    }

    return NextResponse.json({
      success: true,
      paid: false,
      message: 'Payment not completed',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
