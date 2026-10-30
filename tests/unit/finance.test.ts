import { describe, expect, it } from "vitest";
import { emi, formatINR, formatINRShort, loanBreakdown } from "@/lib/finance";

describe("emi", () => {
  it("matches the standard reducing-balance formula (₹10L, 9% for 20 years)", () => {
    // Bank-published figure for this loan is ₹8,997.
    expect(Math.round(emi(1_000_000, 9, 240))).toBe(8997);
  });

  it("splits evenly at 0% interest", () => {
    expect(emi(120_000, 0, 12)).toBe(10_000);
  });

  it("is zero for an empty loan", () => {
    expect(emi(0, 9, 120)).toBe(0);
    expect(emi(100_000, 9, 0)).toBe(0);
  });
});

describe("loanBreakdown", () => {
  it("adds up: down payment + principal = price, EMI × months = total payable", () => {
    const b = loanBreakdown(775_000, 25, 9.5, 10);
    expect(b.downPayment + b.principal).toBe(775_000);
    expect(b.principal).toBe(581_250);
    expect(b.totalPayable).toBe(b.principal + b.totalInterest);
    expect(Math.abs(b.monthly * 120 - b.totalPayable)).toBeLessThan(120);
  });
});

describe("formatting", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(1_234_567)).toBe("₹12,34,567");
  });
  it("abbreviates to lakhs and crores", () => {
    expect(formatINRShort(775_000)).toBe("₹7.75 L");
    expect(formatINRShort(12_000_000)).toBe("₹1.2 Cr");
    expect(formatINRShort(50_000)).toBe("₹50,000");
  });
});
