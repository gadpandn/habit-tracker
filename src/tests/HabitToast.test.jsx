import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import HabitToast from "../components/HabitToast";

describe("Habit Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.__PWA_UPDATE__;
  });

  test("renders update message and action buttons", () => {
    const setUpdateAvailable = vi.fn();

    render(<HabitToast setUpdateAvailable={setUpdateAvailable} />);

    expect(screen.getByText("Update available")).toBeInTheDocument();
    expect(
      screen.getByText(/refresh to get the latest version/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });

  test("toast autodismiss after 10s", () => {
    const setUpdateAvailable = vi.fn();

    render(<HabitToast setUpdateAvailable={setUpdateAvailable} />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(setUpdateAvailable).toHaveBeenCalledWith(false);
  });

  test("hover pauses auto dismiss timer", () => {
    const setUpdateAvailable = vi.fn();

    render(<HabitToast setUpdateAvailable={setUpdateAvailable} />);

    const toast = screen.getByTestId("pwa-update-toast");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    fireEvent.mouseEnter(toast);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(setUpdateAvailable).not.toHaveBeenCalled();
  });

  test("mouse leaves restarts the timer", () => {
    const setUpdateAvailable = vi.fn();

    render(<HabitToast setUpdateAvailable={setUpdateAvailable} />);

    const toast = screen.getByTestId("pwa-update-toast");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    fireEvent.mouseEnter(toast);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(setUpdateAvailable).not.toHaveBeenCalled();

    fireEvent.mouseLeave(toast);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(setUpdateAvailable).toHaveBeenCalledWith(false);
  });

  test("clicking Refresh calls window.__PWA_UPDATE__", () => {
    const setUpdateAvailable = vi.fn();
    window.__PWA_UPDATE__ = vi.fn();

    render(<HabitToast setUpdateAvailable={setUpdateAvailable} />);

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(window.__PWA_UPDATE__).toHaveBeenCalled();
  });
});