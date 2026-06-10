import type { MetadataRoute } from "next";

// Web App Manifest. Next.js App Router отдаёт его по /manifest.webmanifest
// и автоматически добавляет <link rel="manifest"> в <head>.
// theme/background = graphite.950 (#07070b) — совпадает с фоном body, чтобы
// запуск standalone не давал белой вспышки.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Synapse — Idea-to-Content Engine",
    short_name: "Synapse",
    description: "Преврати одну сырую идею в полноценную контент-машину.",
    lang: "ru",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07070b",
    theme_color: "#07070b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
