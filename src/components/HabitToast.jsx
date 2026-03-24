import { useEffect, useRef } from "react";
import "../styles/HabitToast.scss";

function HabitToast({ setUpdateAvailable }) {
  const timerRef = useRef(null);

  const startTimer = () => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setUpdateAvailable(false);
    }, 10000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, []);

  return (
    <div
      data-testid="pwa-update-toast"
      className="pwa-update-toast"
      role="status"
      aria-live="polite"
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
    >
      <div className="toast-text">
        <div className="toast-title">Update available</div>
        <div className="toast-subtitle">
          Refresh to get the latest version.
        </div>
      </div>

      <div className="toast-actions">
        <button
          type="button"
          onClick={() => setUpdateAvailable(false)}
          className="btn-dismiss"
        >
          Dismiss
        </button>

        <button
          type="button"
          onClick={() => window.__PWA_UPDATE__?.()}
          className="btn-refresh"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

export default HabitToast;