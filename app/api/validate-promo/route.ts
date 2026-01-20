import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode, GENERATION_PRICE } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promoCode } = body;

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const result = validatePromoCode(promoCode);

    if (result.valid) {
      const originalPrice = GENERATION_PRICE / 100;
      const discountAmount = (GENERATION_PRICE * result.discount / 100) / 100;
      const finalPrice = originalPrice - discountAmount;

      return NextResponse.json({
        valid: true,
        discount: result.discount,
        originalPrice: originalPrice.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
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
