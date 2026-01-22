import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/stripe/config';
import { formatPrice } from '@/lib/pricing/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promoCode, basePrice } = body;

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    // Use dynamic base price or default to £2.00
    const priceInCents = basePrice || 200;

    const result = validatePromoCode(promoCode);

    if (result.valid) {
      const discountAmount = Math.round(priceInCents * result.discount / 100);
      const finalPriceCents = priceInCents - discountAmount;

      return NextResponse.json({
        valid: true,
        discount: result.discount,
        originalPrice: formatPrice(priceInCents),
        discountAmount: formatPrice(discountAmount),
        finalPrice: formatPrice(finalPriceCents),
        message: result.discount === 100
          ? 'Free access!'
          : `${result.discount}% off applied!`,
      });
    }

    return NextResponse.json({
      valid: false,
      message: 'Invalid promo code',
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
