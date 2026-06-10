import type { LLMContentPayload } from "./llm-types";

export type Format = "youtube" | "telegram" | "shorts";

export interface GeneratedAsset {
  id: string;
  format: Format;
  title: string;
  badge: string;
  content: string;
  leverage: number;
  meta?: string;
}

export async function generate(rawIdea: string): Promise<GeneratedAsset[]> {
  const idea = rawIdea.trim() || "новая AI-эра дистрибуции";

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });

  if (!res.ok) {
    const errText = await safeErrorText(res);
    throw new Error(errText);
  }

  const data = (await res.json()) as LLMContentPayload;

  const shortsContent = data.shorts
    .slice(0, 5)
    .map((h, i) => `${String(i + 1).padStart(2, "0")} · ${h}`)
    .join("\n\n");

  const youtube: GeneratedAsset = {
    id: "yt",
    format: "youtube",
    title: "Структура YouTube-видео",
    badge: "LONG-FORM · 9:45",
    content: data.youtube,
    leverage: scoreFor(idea, 87, 96),
    meta: "Hook → Context → Thesis → Proof → Action → Loop-close",
  };

  const telegram: GeneratedAsset = {
    id: "tg",
    format: "telegram",
    title: "Telegram-пост",
    badge: `TEXT · ~${data.telegram.length} знаков`,
    content: data.telegram,
    leverage: scoreFor(idea, 78, 92),
    meta: "Tone: spoken, sharp, no fluff",
  };

  const shorts: GeneratedAsset = {
    id: "shorts",
    format: "shorts",
    title: "5 хуков для Reels / Shorts",
    badge: "VERTICAL · 0–3 sec",
    content: shortsContent,
    leverage: scoreFor(idea, 82, 98),
    meta: "Patterns: contrarian · urgency · curiosity · authority · zoom-in",
  };

  return [youtube, telegram, shorts];
}

async function safeErrorText(res: Response): Promise<string> {
  try {
    const j = await res.json();
    if (j?.error) return String(j.error);
    return `Запрос провалился: ${res.status}`;
  } catch {
    return `Запрос провалился: ${res.status}`;
  }
}

function scoreFor(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}
