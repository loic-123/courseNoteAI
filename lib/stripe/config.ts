import Stripe from 'stripe';

// Lazy initialization to avoid build errors when env vars are not set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return stripeInstance;
}

// For backwards compatibility
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get paymentIntents() { return getStripe().paymentIntents; },
  get webhooks() { return getStripe().webhooks; },
};

// Price for a single generation (in cents)
export const GENERATION_PRICE = 200; // $2.00

// Promo codes with their discounts (percentage off)
export const PROMO_CODES: Record<string, number> = {
  'LAUNCH50': 50,    // 50% off
  'STUDENT25': 25,   // 25% off
  'FREE100': 100,    // 100% off (free)
};

export function validatePromoCode(code: string): { valid: boolean; discount: number } {
  const upperCode = code.toUpperCase().trim();
  const discount = PROMO_CODES[upperCode];

  if (discount !== undefined) {
    return { valid: true, discount };
  }

  return { valid: false, discount: 0 };
}

export function calculateFinalPrice(promoCode?: string): number {
  if (promoCode) {
    const { valid, discount } = validatePromoCode(promoCode);
    if (valid) {
      return Math.round(GENERATION_PRICE * (1 - discount / 100));
    }
  }
  return GENERATION_PRICE;
}
