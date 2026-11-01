import { describe, expect, it } from "vitest";
import { normalizeDbUrl } from "../../scripts/db-url.mjs";

const HOST = "aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
const USER = "postgres.abcdefghijklmnop";
const url = (password: string) => `postgresql://${USER}:${password}@${HOST}`;

/** What a Postgres client will actually log in with: parse the result the standard way. */
function parsed(result: string) {
  const u = new URL(result);
  return { user: decodeURIComponent(u.username), password: decodeURIComponent(u.password), host: u.host, path: u.pathname };
}

describe("normalizeDbUrl", () => {
  it.each([
    ["plain", "Sup3rSecret"],
    ["at sign", "p@ssword"],
    ["two at signs", "a@b@c"],
    ["colon", "pa:ss"],
    ["slash", "pa/ss"],
    ["hash", "pa#ss"],
    ["question mark", "pa?ss"],
    ["percent", "100%sure"],
    ["ampersand and equals", "a&b=c"],
    ["space and plus", "a b+c"],
    ["everything", "p@ss:w/rd#1?%&= +x"],
    ["non-ASCII", "pässwörd₹"],
  ])("pasted raw, with %s, keeps the exact password", (_, password) => {
    const result = parsed(normalizeDbUrl(url(password)));
    expect(result).toEqual({ user: USER, password, host: "aws-0-ap-south-1.pooler.supabase.com:5432", path: "/postgres" });
  });

  it("does not double-encode a password that was already percent-encoded", () => {
    const password = "p@ss:w/rd#1";
    const once = url(encodeURIComponent(password));
    expect(normalizeDbUrl(once)).toBe(once);
    expect(parsed(normalizeDbUrl(once)).password).toBe(password);
  });

  it("is stable: running it twice gives the same string", () => {
    const first = normalizeDbUrl(url("p@ss:w/rd#1?%"));
    expect(normalizeDbUrl(first)).toBe(first);
  });

  it("accepts the postgres:// scheme and surrounding whitespace", () => {
    expect(parsed(normalizeDbUrl(`  postgres://${USER}:a@b@${HOST}\n`)).password).toBe("a@b");
  });

  it.each([
    ["the placeholder left in", url("[YOUR-PASSWORD]"), /\[YOUR-PASSWORD\]/],
    ["no scheme", `${USER}:x@${HOST}`, /postgresql:\/\//],
    ["no password", `postgresql://${USER}@${HOST}`, /no password/],
    ["empty password", url(""), /empty/],
    ["no host", `postgresql://${USER}:secret@`, /no host/],
  ])("rejects %s with a clear message", (_, input, message) => {
    expect(() => normalizeDbUrl(input)).toThrow(message);
  });

  it("never puts the password in an error message", () => {
    try {
      normalizeDbUrl(`${USER}:TopSecret123@${HOST}`);
    } catch (error) {
      expect(String(error)).not.toContain("TopSecret123");
    }
  });
});
