// Одноразовый build-скрипт: рендерит assets/icon.svg в набор PNG-иконок для PWA.
// Запуск: npm run generate-icons
// sharp самодостаточен (bundled libvips) и растеризует SVG без внешних бинарников.

import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "assets", "icon.svg");
const OUT = join(root, "public");

// Фон graphite.950 — тот же, что у body, чтобы иконки и сплэш не давали вспышку.
const BG = { r: 7, g: 7, b: 11, alpha: 1 };

async function render(svg, size) {
  return sharp(svg).resize(size, size, { fit: "contain" }).png().toBuffer();
}

// Maskable: контент в safe-zone (центральные ~80%), вокруг — сплошной фон.
async function renderMaskable(svg, size) {
  const inner = Math.round(size * 0.8);
  const glyph = await render(svg, inner);
  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: glyph, gravity: "centre" }])
    .png()
    .toBuffer();
}

async function main() {
  const svg = await readFile(SRC);
  await mkdir(OUT, { recursive: true });

  const tasks = [
    { name: "icon-192.png", buf: () => render(svg, 192) },
    { name: "icon-512.png", buf: () => render(svg, 512) },
    { name: "icon-512-maskable.png", buf: () => renderMaskable(svg, 512) },
    { name: "apple-icon-180.png", buf: () => render(svg, 180) },
    { name: "favicon-32.png", buf: () => render(svg, 32) },
    { name: "favicon-16.png", buf: () => render(svg, 16) },
  ];

  for (const { name, buf } of tasks) {
    const data = await buf();
    await sharp(data).toFile(join(OUT, name));
    console.log(`✓ public/${name}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
