import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "1 hr 25 min" — reads better than "85 min" for anything over an hour. */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** "1:05" for a countdown display. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Round a scaled quantity to something a cook would actually write.
 *
 * Scaling 1.5 tbsp by 3x gives 4.5, which is fine — but 0.30000000000000004
 * from floating point is not, and neither is "2.37 eggs".
 */
export function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) return "";
  if (amount === 0) return "0";

  const rounded = amount < 1 ? Math.round(amount * 8) / 8 : Math.round(amount * 4) / 4;

  const FRACTIONS: Record<string, string> = {
    "0.125": "⅛", "0.25": "¼", "0.375": "⅜", "0.5": "½",
    "0.625": "⅝", "0.75": "¾", "0.875": "⅞",
  };

  const whole = Math.floor(rounded);
  const fraction = Number((rounded - whole).toFixed(3));
  const glyph = FRACTIONS[String(fraction)];

  if (!glyph) return String(Number(rounded.toFixed(2)));
  return whole === 0 ? glyph : `${whole}${glyph}`;
}

export const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
