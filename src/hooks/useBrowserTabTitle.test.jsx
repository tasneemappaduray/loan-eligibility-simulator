import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useBrowserTabTitle } from "./useBrowserTabTitle";

describe("useBrowserTabTitle", () => {
  afterEach(() => {
    document.title = "";
  });

  it("puts the page name in front of the app name on the browser tab", () => {
    renderHook(() => useBrowserTabTitle("How it works"));
    expect(document.title).toBe("How it works · Loan Eligibility Simulator");
  });

  it("puts the old title back when the page goes away", () => {
    document.title = "Before";
    const { unmount } = renderHook(() => useBrowserTabTitle("How it works"));
    unmount();
    expect(document.title).toBe("Before");
  });
});
