/**
 * Currency formatting utilities for Ghanaian Cedis (GHS)
 */

/**
 * Format a number as Ghanaian Cedis currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string with ₵ symbol
 */
export function formatCurrency(
  amount: number,
  options?: {
    showSymbol?: boolean;
    decimals?: number;
  }
): string {
  const { showSymbol = true, decimals = 2 } = options || {};
  
  const formatted = amount.toLocaleString('en-GH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return showSymbol ? `GH₵ ${formatted}` : formatted;
}

/**
 * Format amount for Paystack (convert to pesewas)
 * Paystack expects amounts in pesewas (smallest currency unit)
 * @param amount - Amount in cedis
 * @returns Amount in pesewas
 */
export function toPaystackAmount(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert from Paystack amount (pesewas) to cedis
 * @param pesewas - Amount in pesewas
 * @returns Amount in cedis
 */
export function fromPaystackAmount(pesewas: number): number {
  return pesewas / 100;
}

/**
 * Currency code for Ghanaian Cedis
 */
export const CURRENCY_CODE = 'GHS';

/**
 * Currency symbol for Ghanaian Cedis
 */
export const CURRENCY_SYMBOL = '₵';
