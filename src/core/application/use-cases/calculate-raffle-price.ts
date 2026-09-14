import { DomainError } from '@/core/domain/errors/domain-error';

// Faixas: 1-2 → R$25/un, 3-4 → R$20/un, 5-9 → R$18/un, 10+ → R$15/un
const PRICE_TIERS: Array<{ maxQty: number; unitCents: number }> = [
  { maxQty: 2,        unitCents: 2500 },
  { maxQty: 4,        unitCents: 2000 },
  { maxQty: 9,        unitCents: 1800 },
  { maxQty: Infinity, unitCents: 1500 },
];

export function calculateRafflePrice(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new DomainError('VALIDATION', 'Quantidade deve ser um número inteiro maior que zero');
  }
  const tier = PRICE_TIERS.find((t) => quantity <= t.maxQty)!;
  return tier.unitCents * quantity;
}

export function rafflePricePerUnit(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new DomainError('VALIDATION', 'Quantidade deve ser um número inteiro maior que zero');
  }
  return PRICE_TIERS.find((t) => quantity <= t.maxQty)!.unitCents;
}
