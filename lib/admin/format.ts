const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return DATE_FORMAT.format(new Date(value))
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  return DATE_TIME_FORMAT.format(new Date(value))
}

/** Stripe reports amounts in the currency's smallest unit. */
export function formatCurrency(
  amountInMinorUnits: number | null | undefined,
  currency?: string | null
) {
  if (amountInMinorUnits === null || amountInMinorUnits === undefined) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency ?? 'usd').toUpperCase(),
  }).format(amountInMinorUnits / 100)
}

export function daysAgoIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}
