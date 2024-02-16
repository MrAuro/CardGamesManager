export function parseMoney(value: string | number): number {
  if (typeof value === "string") {
    return parseFloat(value.replace(/,/g, ""));
  } else {
    return value;
  }
}
