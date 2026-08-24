const CANDIDATE_ARRAY_KEYS = [
  "data",
  "result",
  "results",
  "items",
  "records",
  "docs",
  "listings",
  "payload"
];

const CANDIDATE_OBJECT_KEYS = ["data", "result", "user", "profile", "payload"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getValueByKeyIgnoreCase(record: Record<string, unknown>, targetKey: string): unknown {
  const match = Object.keys(record).find((key) => key.toLowerCase() === targetKey.toLowerCase());
  return match ? record[match] : undefined;
}

function unwrapNested(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  for (const key of CANDIDATE_OBJECT_KEYS) {
    const nested = getValueByKeyIgnoreCase(value, key);
    if (nested !== undefined) {
      return nested;
    }
  }

  return value;
}

export function normalizeArrayResponse(value: unknown): Record<string, unknown>[] {
  const unwrapped = unwrapNested(value);

  if (Array.isArray(unwrapped)) {
    return unwrapped.filter(isRecord);
  }

  if (!isRecord(unwrapped)) {
    return [];
  }

  for (const key of CANDIDATE_ARRAY_KEYS) {
    const candidate = getValueByKeyIgnoreCase(unwrapped, key);

    if (Array.isArray(candidate)) {
      return candidate.filter(isRecord);
    }
  }

  return [];
}

export function normalizeObjectResponse(value: unknown): Record<string, unknown> | null {
  const unwrapped = unwrapNested(value);

  if (isRecord(unwrapped)) {
    return unwrapped;
  }

  if (Array.isArray(unwrapped)) {
    return unwrapped.find(isRecord) ?? null;
  }

  return null;
}
