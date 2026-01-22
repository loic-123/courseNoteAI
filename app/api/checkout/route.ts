import { NextRequest, NextResponse } from 'next/server';
import { getStripe, validatePromoCode } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promoCode, returnUrl, priceInCents, visualModel, hasApiKey } = body;

    // Use dynamic price from client or default
    let basePrice = priceInCents || 200; // Default £2.00

    // Validate promo code if provided
    let discount = 0;
    if (promoCode) {
      const promoResult = validatePromoCode(promoCode);
      if (!promoResult.valid) {
        return NextResponse.json(
          { error: 'Invalid promo code' },
          { status: 400 }
        );
      }
      discount = promoResult.discount;
    }

    // Calculate final price with discount
    const finalPrice = Math.round(basePrice * (1 - discount / 100));

    // If price is 0 (100% discount), grant access directly
    if (finalPrice === 0) {
      return NextResponse.json({
        success: true,
        freeAccess: true,
        message: 'Promo code applied - free access granted!',
      });
    }

    // Determine product description based on visual model
    const visualDescription = visualModel === 'nano-banana'
      ? 'Premium visual (Nano Banana Pro)'
      : 'Standard visual (Ideogram v3)';

    // Create Stripe checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'CourseNotes AI - Note Generation',
              description: `Generate comprehensive notes, quizzes, and visual summaries. ${visualDescription}`,
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        promoCode: promoCode || '',
        originalPrice: basePrice.toString(),
        discount: discount.toString(),
        visualModel: visualModel || 'ideogram',
        hasApiKey: hasApiKey ? 'true' : 'false',
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
