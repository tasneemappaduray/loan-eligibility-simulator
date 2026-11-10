import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PacmanSpinner from "./PacmanSpinner";

describe("PacmanSpinner", () => {
  it("tells everyone, including screen readers, that the loan options are loading", () => {
    render(<PacmanSpinner />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading loan options…");
  });
});
