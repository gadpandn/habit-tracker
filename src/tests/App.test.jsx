import { vi, describe, test, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Habits before importing App
vi.mock("../components/Habits", () => ({
  default: () => null,
}));

import App from "../App";

describe("PWA update toast", () => {
  test("shows toast when pwa:update-available event is dispatched", async () => {
    render(<App />);

    expect(screen.queryByTestId("pwa-update-toast")).not.toBeInTheDocument();

    await Promise.resolve();

    act(() => {
      window.dispatchEvent(new CustomEvent("pwa:update-available"));
    });

    expect(await screen.findByTestId("pwa-update-toast")).toBeInTheDocument();
    expect(screen.getByText(/update available/i)).toBeInTheDocument();
  });

  test("dismiss hides the toast", async () => {
    const user = userEvent.setup();
    render(<App />);

    await Promise.resolve();

    act(() => {
      window.dispatchEvent(new CustomEvent("pwa:update-available"));
    });

    expect(await screen.findByTestId("pwa-update-toast")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(screen.queryByTestId("pwa-update-toast")).not.toBeInTheDocument();
  });
});