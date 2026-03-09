import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useAuthStore } from "./stores/authStore";

// Unregister any stale service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
}

// Hydrate auth state from localStorage before first render
useAuthStore.getState().hydrate();

// Refresh user data from backend in the background (updates policy fields etc.)
useAuthStore.getState().refreshUser();

createRoot(document.getElementById("root")!).render(<App />);
