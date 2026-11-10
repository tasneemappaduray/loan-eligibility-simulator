import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { formatCurrencyWhole } from "../../utils/format";
import Button from "./Button";
import RangeSlider from "./RangeSlider";
import Select from "./Select";
import TextInput from "./TextInput";

const OPTIONS = [
  { value: "employed", label: "Employed" },
  { value: "retired", label: "Retired" },
];

describe("TextInput", () => {
  it("connects the label to the input", () => {
    render(<TextInput inputId="income" labelText="Monthly income" />);
    expect(screen.getByLabelText("Monthly income")).toBeInTheDocument();
  });

  it("describes the input with its error and marks it invalid", () => {
    render(<TextInput inputId="income" labelText="Monthly income" errorMessage="Required" />);
    const input = screen.getByLabelText("Monthly income");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Required");
  });

  it("is not marked invalid and has no description when there is no error", () => {
    render(<TextInput inputId="income" labelText="Monthly income" />);
    const input = screen.getByLabelText("Monthly income");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("hides the text before the box from screen readers", () => {
    render(<TextInput inputId="income" labelText="Monthly income" unitBefore="R" />);
    expect(screen.getByText("R")).toHaveAttribute("aria-hidden", "true");
  });

  it("drops letters and decimal points as they are typed in a whole-number box", async () => {
    render(<TextInput inputId="age" labelText="Age" inputMode="numeric" />);
    const box = screen.getByLabelText("Age");
    await userEvent.type(box, "3a5.5");
    expect(box).toHaveValue("355");
  });

  it("keeps only digits, one decimal point and two decimals in a money box", async () => {
    render(<TextInput inputId="income" labelText="Monthly income" />);
    const box = screen.getByLabelText("Monthly income");
    await userEvent.type(box, "R2 5.504x");
    expect(box).toHaveValue("25.50");
  });

  it("asks the browser not to fill the box in from earlier visits", () => {
    render(<TextInput inputId="income" labelText="Monthly income" />);
    expect(screen.getByLabelText("Monthly income")).toHaveAttribute("autocomplete", "off");
  });

  it("passes other props through to the input", async () => {
    const onChange = vi.fn();
    render(<TextInput inputId="income" labelText="Monthly income" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Monthly income"), "5");
    expect(onChange).toHaveBeenCalled();
  });
});

describe("Select", () => {
  it("lists every option and reports the chosen value", async () => {
    const onChange = vi.fn();
    render(<Select inputId="job" labelText="Employment" options={OPTIONS} onChange={onChange} />);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Employed",
      "Retired",
    ]);
    await userEvent.selectOptions(screen.getByLabelText("Employment"), "retired");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Employment")).toHaveValue("retired");
  });

  it("starts on an empty first choice when given a placeholder", () => {
    render(<Select inputId="job" labelText="Employment" options={OPTIONS} placeholder="Select…" />);
    const [first] = screen.getAllByRole("option");
    expect(first).toHaveTextContent("Select…");
    expect(first).toHaveValue("");
    expect(screen.getByLabelText("Employment")).toHaveValue("");
  });

  it("describes the select with its error", () => {
    render(
      <Select
        inputId="job"
        labelText="Employment"
        options={OPTIONS}
        errorMessage="Please choose one"
      />,
    );
    expect(screen.getByLabelText("Employment")).toHaveAccessibleDescription("Please choose one");
  });
});

describe("RangeSlider", () => {
  const props = {
    inputId: "amount",
    labelText: "Loan amount",
    min: 5000,
    max: 300000,
    step: 1000,
    format: formatCurrencyWhole,
  };

  it("shows the current value in rand format", () => {
    render(<RangeSlider {...props} value={150000} onChange={() => {}} />);
    expect(screen.getByText(/R150,000/)).toBeInTheDocument();
  });

  it("shows no value, and tells screen readers none, until it has one", () => {
    render(<RangeSlider {...props} value={null} onChange={() => {}} />);
    expect(screen.queryByText(/R\d/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Loan amount")).not.toHaveAttribute("aria-valuetext");
  });

  it.each([
    [50, "50%"],
    [0, "0%"],
    [100, "100%"],
    [250, "100%"],
    [null, "0%"],
  ])("draws the blue bar %s along a 0 to 100 slider as %s wide", (value, expectedWidth) => {
    const { container } = render(
      <RangeSlider {...props} min={0} max={100} step={1} value={value} onChange={() => {}} />,
    );
    expect(container.querySelector(".blueBar")).toHaveStyle({ width: expectedWidth });
  });

  it("reports changes as numbers", () => {
    const onChange = vi.fn();
    render(<RangeSlider {...props} value={150000} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Loan amount"), { target: { value: "200000" } });
    expect(onChange).toHaveBeenCalledWith(200000);
  });
});

describe("Button", () => {
  it("is a plain button by default so it never submits a form by accident", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("is disabled and busy while loading, and ignores clicks", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Check eligibility
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Check eligibility" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when it is not loading", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("accessibility", () => {
  it.each([
    ["TextInput", () => <TextInput inputId="income" labelText="Monthly income" />],
    [
      "TextInput with error",
      () => <TextInput inputId="income" labelText="Monthly income" errorMessage="Required" />,
    ],
    ["Select", () => <Select inputId="job" labelText="Employment" options={OPTIONS} />],
    [
      "Select with error",
      () => (
        <Select inputId="job" labelText="Employment" options={OPTIONS} errorMessage="Choose one" />
      ),
    ],
    [
      "RangeSlider",
      () => (
        <RangeSlider
          inputId="amount"
          labelText="Loan amount"
          min={5000}
          max={300000}
          step={1000}
          value={150000}
          onChange={() => {}}
          format={formatCurrencyWhole}
        />
      ),
    ],
    ["Button", () => <Button>Save</Button>],
    ["Button while loading", () => <Button loading>Save</Button>],
  ])("%s has no accessibility violations", async (_name, ui) => {
    const { container } = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
