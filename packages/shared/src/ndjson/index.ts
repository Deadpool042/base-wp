export type NDJSONBase = { type: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function parseNDJSONLine(line: string): NDJSONBase | null {
  try {
    const obj = JSON.parse(line) as unknown;
    if (!isRecord(obj)) return null;
    if (typeof obj.type !== "string") return null;
    return obj as NDJSONBase;
  } catch {
    return null;
  }
}

export function asEvent<TType extends string, TKeys extends readonly string[]>(
  evt: NDJSONBase,
  type: TType,
  requiredStringKeys: TKeys
): (NDJSONBase & { type: TType } & Record<TKeys[number], string>) | null {
  if (evt.type !== type) return null;

  const rec = evt as unknown as Record<string, unknown>;
  for (const k of requiredStringKeys) {
    if (typeof rec[k] !== "string") return null;
  }
  return evt as NDJSONBase & { type: TType } & Record<TKeys[number], string>;
}
