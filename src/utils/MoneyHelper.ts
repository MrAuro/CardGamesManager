export function parseMoney(value: string | number): number {
  if (typeof value === "string") {
    return parseFloat(value.replace(/,/g, ""));
  } else {
    return value;
  }
}

export function formatMoney(value: number, useCents = false, noLeadingZeros = false): string {
  if (!value) return "$0.00";
  if (isNaN(value)) return "$0.00";
  if (value > 1000000) return `$${(value / 1000000).toFixed(0)}M`;

  if (value > -1 && value < 1 && useCents) {
    // 0.50 -> 50c, 0.05 -> 5c
    const p = value.toFixed(2).split(".");
    return `${parseInt(p[1])}c`;
  } else if (value < 0) {
    // $-10.00 -> -$10.00
    return `-$${Math.abs(value).toFixed(2)}`;
  } else {
    // No leading zeros, so if its $10.00, it will be $10, but if its $10.50, it will be $10.50, and $10.5 will be $10.50
    if (noLeadingZeros) {
      if (countDecimalPlaces(value) >= 1) {
        // Keep cents
        return `$${value.toFixed(2)}`;
      } else {
        // Remove cents (trailing zeros)
        return `$${value.toFixed(0)}`;
      }
    } else {
      return `$${value.toFixed(2)}`;
    }
  }
}

export function countDecimalPlaces(value: number): number {
  if (Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0;
}

export function round(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
