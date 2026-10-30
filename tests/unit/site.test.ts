import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";
import { telLink, whatsappLink } from "@/lib/site";

describe("contact links", () => {
  it("adds India's country code to 10-digit numbers", () => {
    expect(telLink("96556 69675")).toBe("tel:+919655669675");
    expect(telLink("+91 96556 69675")).toBe("tel:+919655669675");
  });
  it("URL-encodes WhatsApp messages", () => {
    expect(whatsappLink("Hi & hello")).toMatch(/\?text=Hi%20%26%20hello$/);
  });
});

describe("toCsv", () => {
  it("quotes commas and neutralises spreadsheet formulas", () => {
    const csv = toCsv([{ name: "=HYPERLINK(1)", note: "a,b" }], ["name", "note"]);
    expect(csv).toBe(`name,note\r\n'=HYPERLINK(1),"a,b"`);
  });
});
