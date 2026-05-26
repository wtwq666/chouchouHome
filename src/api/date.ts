/** 表单 date (YYYY-MM-DD) → 展示用 YYYY.MM.DD */
export function isoToDotDate(iso: string): string {
  if (!iso) return iso;
  if (iso.includes(".")) return iso;
  return iso.replace(/-/g, ".");
}

/** 展示 YYYY.MM.DD → 表单 YYYY-MM-DD */
export function dotToIsoDate(dot: string): string {
  if (!dot) return dot;
  if (dot.includes("-") && !dot.includes(".")) return dot.slice(0, 10);
  return dot.replace(/\./g, "-").slice(0, 10);
}

/** 今日 ISO 日期 YYYY-MM-DD（表单 date input） */
export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 从 date 字符串解析年份 */
export function yearFromDate(date: string): number {
  const normalized = date.replace(/\./g, "-");
  const y = Number(normalized.slice(0, 4));
  return Number.isFinite(y) ? y : new Date().getFullYear();
}
