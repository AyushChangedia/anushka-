import { describe, expect, it } from "vitest";
import { formatAmount, formatClock, formatMinutes } from "@/lib/utils";
import { suggestIngredients } from "@/lib/data/ingredients";

describe("formatMinutes", () => {
  it("keeps sub-hour durations in minutes", () => {
    expect(formatMinutes(45)).toBe("45 min");
  });

  it("switches to hours past 60 minutes", () => {
    expect(formatMinutes(60)).toBe("1 hr");
    expect(formatMinutes(85)).toBe("1 hr 25 min");
    expect(formatMinutes(120)).toBe("2 hr");
  });
});

describe("formatClock", () => {
  it("zero-pads the seconds", () => {
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(600)).toBe("10:00");
  });

  it("clamps negative values to zero rather than showing a negative clock", () => {
    expect(formatClock(-5)).toBe("0:00");
  });
});

describe("formatAmount", () => {
  it("renders common fractions as glyphs", () => {
    expect(formatAmount(0.5)).toBe("½");
    expect(formatAmount(0.25)).toBe("¼");
    expect(formatAmount(1.5)).toBe("1½");
  });

  it("keeps whole numbers clean", () => {
    expect(formatAmount(2)).toBe("2");
    expect(formatAmount(200)).toBe("200");
  });

  it("does not leak floating point noise from scaling", () => {
    // 0.1 * 3 is 0.30000000000000004 in IEEE 754.
    expect(formatAmount(0.1 * 3)).not.toContain("0000");
  });

  it("rounds to quantities a cook could actually measure", () => {
    expect(formatAmount(0.333)).toBe("⅜");
    // 2.6 snaps to the nearest quarter and renders as a mixed fraction.
    expect(formatAmount(2.6)).toBe("2½");
  });
});

describe("suggestIngredients", () => {
  it("ranks prefix matches above substring matches", () => {
    // Typing "on" almost certainly means Onion, not Lemon.
    const results = suggestIngredients("on");
    expect(results[0]).toBe("Onion");
  });

  it("excludes ingredients already in the pantry", () => {
    expect(suggestIngredients("tom", ["Tomato"])).not.toContain("Tomato");
  });

  it("returns nothing for an empty query rather than the whole vocabulary", () => {
    expect(suggestIngredients("")).toEqual([]);
    expect(suggestIngredients("   ")).toEqual([]);
  });

  it("respects the result limit", () => {
    expect(suggestIngredients("a", [], 3).length).toBeLessThanOrEqual(3);
  });
});
