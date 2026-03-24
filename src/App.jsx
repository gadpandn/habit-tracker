import Habits from "./components/Habits";
import "./styles/App.scss";
import { useEffect, useState } from "react";
import HabitToast from "./components/HabitToast";


export default function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const onUpdate = () => {
      // Listen for service worker update event and show toast
      setUpdateAvailable(true);
    };
    window.addEventListener("pwa:update-available", onUpdate);
    return () => window.removeEventListener("pwa:update-available", onUpdate);
  }, []);

  return (
    <div className="app" style={{ padding: 16 }}>
      <Habits />

    {updateAvailable && (
      <HabitToast setUpdateAvailable={setUpdateAvailable} />
    )}  
    </div>
  );
}


