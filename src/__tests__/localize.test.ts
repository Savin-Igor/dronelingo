import { describe, it, expect } from "vitest";
import { localize } from "@/lib/localize";

describe("localize", () => {
  it("returns the requested locale", () => {
    expect(localize({ lv: "Latviski", en: "English" }, "lv")).toBe("Latviski");
  });

  it("falls back to en when locale is missing", () => {
    expect(localize({ en: "English" }, "ru")).toBe("English");
  });

  it("returns empty string when both locale and en are missing", () => {
    expect(localize({ ru: "Русский" }, "lv")).toBe("");
  });

  it("returns empty string for null input", () => {
    expect(localize(null, "lv")).toBe("");
  });

  it("returns empty string for array input", () => {
    expect(localize(["a", "b"], "lv")).toBe("");
  });

  it("returns empty string for string input", () => {
    expect(localize("plain string", "lv")).toBe("");
  });
});
