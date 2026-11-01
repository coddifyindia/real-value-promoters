import { describe, expect, it } from "vitest";
import { parseShortlist, SHORTLIST_MAX, toggleSlug } from "@/lib/shortlist-core";

describe("parseShortlist", () => {
  it("reads a stored list", () => {
    expect(parseShortlist('["venus-garden","opal-garden"]')).toEqual(["venus-garden", "opal-garden"]);
  });
  it.each([null, "", "not json", "{}", '"x"', "[1,2]"])("treats %j as empty", (raw) => {
    expect(parseShortlist(raw)).toEqual([]);
  });
  it("drops invalid slugs and duplicates", () => {
    expect(parseShortlist('["a","a","<script>","b"]')).toEqual(["a", "b"]);
  });
  it("caps the list length", () => {
    const many = JSON.stringify(Array.from({ length: 50 }, (_, i) => `p-${i}`));
    expect(parseShortlist(many)).toHaveLength(SHORTLIST_MAX);
  });
});

describe("toggleSlug", () => {
  it("adds newest first, removes when present", () => {
    expect(toggleSlug(["a"], "b")).toEqual(["b", "a"]);
    expect(toggleSlug(["b", "a"], "b")).toEqual(["a"]);
  });
});
