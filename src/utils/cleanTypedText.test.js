import { describe, expect, it } from "vitest";
import { removeNonDigits, removeNonMoneyCharacters } from "./cleanTypedText";

describe("removeNonDigits", () => {
  it.each([
    ["abc", ""],
    ["35.5", "355"],
    ["12345", "123"],
    ["R 25 000", "250"],
    ["", ""],
  ])("turns %j into %j", (typed, expected) => {
    expect(removeNonDigits(typed)).toBe(expected);
  });
});

describe("removeNonMoneyCharacters", () => {
  it.each([
    ["abc", ""],
    ["25000", "25000"],
    ["R 25 000.50", "25000.50"],
    ["25000.5", "25000.5"],
    ["12.345", "12.34"],
    ["1.2.3", "1.23"],
    [".5", ".5"],
    ["1234567890", "123456789"],
    ["1234567890.55", "123456789.55"],
  ])("turns %j into %j", (typed, expected) => {
    expect(removeNonMoneyCharacters(typed)).toBe(expected);
  });
});
