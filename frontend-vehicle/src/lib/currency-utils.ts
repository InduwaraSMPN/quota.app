/**
 * Format a number as currency (LKR)
 * 
 * @param amount The amount to format
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a number with commas as thousands separators
 * 
 * @param number The number to format
 * @returns The formatted number string
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number);
}
