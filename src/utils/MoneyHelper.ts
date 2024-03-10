export function parseMoney(value: string | number): number {
  if (typeof value === "string") {
    return parseFloat(value.replace(/,/g, ""));
  } else {
    return value;
  }
}

export function formatMoney(value: number): string {
  if (value < 0) {
    // -$100 looks better than $-100
    return `-$${Math.abs(value).toFixed(2)}`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}
