const DEFAULT_LOCALE = "en-US";

export function formatNumber(value: unknown): string {
  const numeric = typeof value === "number" ? value : Number(value);

  if (Number.isFinite(numeric)) {
    return new Intl.NumberFormat(DEFAULT_LOCALE).format(numeric);
  }

  return "—";
}

export function formatDate(value: unknown): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(String(value));

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(parsed);
}

export function prettifyKey(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

export function truncate(value: string, max = 120): string {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max).trimEnd()}...`;
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return formatNumber(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }

  return JSON.stringify(value);
}
