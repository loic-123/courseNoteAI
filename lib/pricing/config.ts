import { Length } from '@/types';

export type VisualModel = 'ideogram' | 'nano-banana';

export interface PricingConfig {
  // Base prices in cents (£)
  basePrices: {
    withApiKey: {
      ideogram: number;    // £1 = 100
      nanoBanana: number;  // £2 = 200
    };
    withoutApiKey: {
      ideogram: number;    // £3 = 300
      nanoBanana: number;  // £4 = 400
    };
  };
  // Multipliers based on length
  lengthMultipliers: {
    short: number;
    medium: number;
    long: number;
  };
  // Multipliers based on detail level (1-10)
  detailMultipliers: {
    low: number;    // 1-3
    medium: number; // 4-6
    high: number;   // 7-10
  };
}

export const pricingConfig: PricingConfig = {
  basePrices: {
    withApiKey: {
      ideogram: 100,    // £1.00
      nanoBanana: 200,  // £2.00
    },
    withoutApiKey: {
      ideogram: 300,    // £3.00
      nanoBanana: 400,  // £4.00
    },
  },
  lengthMultipliers: {
    short: 0.8,   // 20% discount for short
    medium: 1.0,  // base price
    long: 1.3,    // 30% extra for long
  },
  detailMultipliers: {
    low: 0.9,     // 10% discount for low detail
    medium: 1.0,  // base price
    high: 1.2,    // 20% extra for high detail
  },
};

export function getDetailLevel(detailValue: number): 'low' | 'medium' | 'high' {
  if (detailValue <= 3) return 'low';
  if (detailValue <= 6) return 'medium';
  return 'high';
}

export function calculatePrice(
  visualModel: VisualModel,
  hasApiKey: boolean,
  length: Length,
  detailLevel: number
): number {
  const config = pricingConfig;

  // Get base price
  const basePrice = hasApiKey
    ? (visualModel === 'ideogram' ? config.basePrices.withApiKey.ideogram : config.basePrices.withApiKey.nanoBanana)
    : (visualModel === 'ideogram' ? config.basePrices.withoutApiKey.ideogram : config.basePrices.withoutApiKey.nanoBanana);

  // Apply length multiplier
  const lengthMultiplier = config.lengthMultipliers[length];

  // Apply detail multiplier
  const detailCategory = getDetailLevel(detailLevel);
  const detailMultiplier = config.detailMultipliers[detailCategory];

  // Calculate final price (round to nearest 10 cents)
  const finalPrice = Math.round((basePrice * lengthMultiplier * detailMultiplier) / 10) * 10;

  return finalPrice;
}

export function formatPrice(priceInCents: number): string {
  return `£${(priceInCents / 100).toFixed(2)}`;
}

export function getPriceRange(visualModel: VisualModel, hasApiKey: boolean): { min: number; max: number } {
  const config = pricingConfig;

  const basePrice = hasApiKey
    ? (visualModel === 'ideogram' ? config.basePrices.withApiKey.ideogram : config.basePrices.withApiKey.nanoBanana)
    : (visualModel === 'ideogram' ? config.basePrices.withoutApiKey.ideogram : config.basePrices.withoutApiKey.nanoBanana);

  const minMultiplier = config.lengthMultipliers.short * config.detailMultipliers.low;
  const maxMultiplier = config.lengthMultipliers.long * config.detailMultipliers.high;

  return {
    min: Math.round((basePrice * minMultiplier) / 10) * 10,
    max: Math.round((basePrice * maxMultiplier) / 10) * 10,
  };
}
