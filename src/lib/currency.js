export const CURRENCIES = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
]

export function getCurrencySymbol(code) {
  const currency = CURRENCIES.find((c) => c.code === code)
  return currency?.symbol || '৳'
}

export function formatAmount(amount, currencyCode = 'BDT') {
  const symbol = getCurrencySymbol(currencyCode)
  return `${symbol}${Number(amount).toFixed(2)}`
}

export const DEFAULT_CURRENCY = 'BDT'
