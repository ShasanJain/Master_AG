// tests/components.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Input", () => {
  it("renders label and input", () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows error message with role=alert", () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
  });

  it("sets aria-invalid when error present", () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows hint text when no error", () => {
    render(<Input label="Password" hint="Min 8 chars" />);
    expect(screen.getByText("Min 8 chars")).toBeInTheDocument();
  });
});

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders as article when specified", () => {
    const { container } = render(<Card as="article">Content</Card>);
    expect(container.querySelector("article")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("renders with role=alert", () => {
    render(<Alert variant="error">Something went wrong</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("has aria-live polite", () => {
    render(<Alert>Info message</Alert>);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "polite");
  });
});

describe("Badge", () => {
  it("renders text content", () => {
    render(<Badge variant="primary">Doctor</Badge>);
    expect(screen.getByText("Doctor")).toBeInTheDocument();
  });
});
