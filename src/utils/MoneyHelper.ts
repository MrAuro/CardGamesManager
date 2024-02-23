export function parseMoney(value: string | number): number {
  if (typeof value === "string") {
    return parseFloat(value.replace(/,/g, ""));
  } else {
    return value;
  }
}

export function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}
