/**
 * Formats a number according to the Indian numbering system (en-IN).
 * Handles Lakhs (1,00,000) and Crores (1,00,00,000) notation.
 */
export function formatINR(
  val: number | undefined | null,
  options?: {
    decimals?: number;
    showSymbol?: boolean;
    compact?: boolean;
  }
): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '—';
  }

  const decimals = options?.decimals ?? 2;
  const showSymbol = options?.showSymbol ?? true;
  const symbol = showSymbol ? '₹' : '';

  const formatted = val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formatted}`;
}

/**
 * Formats AUM value in Crores with Indian numbering system.
 * e.g. 1254.31 -> "₹1,254.31 Cr"
 * Handles defensive fallback if AUM is missing: "Pending disclosure"
 */
export function formatAumCr(
  aumCr: number | undefined | null,
  options?: { pendingFallback?: string }
): string {
  if (aumCr === undefined || aumCr === null || isNaN(aumCr) || aumCr <= 0) {
    return options?.pendingFallback ?? 'Pending disclosure';
  }

  return `${formatINR(aumCr, { decimals: 2 })} Cr`;
}

/**
 * Formats raw amount in Lakhs.
 * e.g. 125430.50 -> "₹1,25,430.50 L"
 */
export function formatAumLakhs(lakhs: number | undefined | null): string {
  if (lakhs === undefined || lakhs === null || isNaN(lakhs)) {
    return '—';
  }
  return `${formatINR(lakhs, { decimals: 2 })} L`;
}

/**
 * Formats NAV value in rupees.
 * e.g. 118.4215 -> "₹118.42"
 */
export function formatNav(nav: number | undefined | null, decimals = 2): string {
  if (nav === undefined || nav === null || isNaN(nav)) {
    return '—';
  }
  return formatINR(nav, { decimals });
}

/**
 * Formats percentage with + sign for positive values.
 * e.g. 0.48 -> "+0.48%"
 */
export function formatPct(val: number | undefined | null, decimals = 2): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '0.00%';
  }
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
}

/**
 * Formats an ISO date into standard AMFI Indian format: "09-Oct-2026"
 */
export function formatAmfiDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}
