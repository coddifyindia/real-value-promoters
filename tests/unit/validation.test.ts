import { describe, expect, it } from "vitest";
import { fieldErrorsOf, leadSchema, subscribeSchema } from "@/lib/validation";

const valid = { kind: "enquiry", name: "Priya", email: "priya@example.com", phone: "98765 43210" };

describe("leadSchema", () => {
  it("accepts a normal enquiry and normalises the phone", () => {
    const r = leadSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.data?.phone).toBe("9876543210");
  });

  it("accepts international numbers", () => {
    expect(leadSchema.safeParse({ ...valid, phone: "+971 50 123 4567" }).success).toBe(true);
  });

  it("reports each bad field once, keyed by name", () => {
    const r = leadSchema.safeParse({ kind: "contact", name: "A", email: "nope", phone: "123" });
    expect(r.success).toBe(false);
    expect(Object.keys(fieldErrorsOf(r.error!)).sort()).toEqual(["email", "name", "phone"]);
  });

  it("requires a date for site visits", () => {
    const r = leadSchema.safeParse({ ...valid, kind: "site_visit" });
    expect(r.success).toBe(false);
    expect(fieldErrorsOf(r.error!).preferredDate).toBe("Pick a date for your visit");
    expect(leadSchema.safeParse({ ...valid, kind: "site_visit", preferredDate: "2026-12-01" }).success).toBe(true);
  });

  it("rejects unknown lead kinds", () => {
    expect(leadSchema.safeParse({ ...valid, kind: "admin" }).success).toBe(false);
  });
});

describe("subscribeSchema", () => {
  it("validates email", () => {
    expect(subscribeSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
    expect(subscribeSchema.safeParse({ email: "a@" }).success).toBe(false);
  });
});
