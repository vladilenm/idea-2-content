"use client";

import { useEffect } from "react";

// Регистрирует service worker (/sw.js) только в production —
// в `next dev` SW мешал бы hot-reload. Ничего не рендерит.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("SW registration failed:", err);
      });
    };

    // Регистрируем после загрузки, чтобы не конкурировать за пропускную способность.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
