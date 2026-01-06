export function parseCount(v?: string | number): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v !== "") return Number(v);
  return undefined;
}
