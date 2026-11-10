import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

expect.extend(axeMatchers);

afterEach(() => {
  cleanup();
});

// The test browser cannot scroll a page or draw on a canvas. The router and the accessibility checker
// try, and would print "Not implemented" notices, so these do nothing.
window.scrollTo = () => {};
HTMLCanvasElement.prototype.getContext = () => null;

// The test browser has no matchMedia, which the animation library needs.
// We pretend the person asked for less motion, so animations jump straight to the end in tests.
window.matchMedia = (query) => ({
  matches: query.includes("prefers-reduced-motion"),
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});
