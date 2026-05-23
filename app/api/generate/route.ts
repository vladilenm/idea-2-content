import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

const SYSTEM_PROMPT = `Ты — content-stratiст из мира AI-эры дистрибуции. Из одной сырой идеи ты разворачиваешь полноценную медиа-систему: структуру YouTube-видео (long-form), пост в Telegram и 5 хуков для Reels/Shorts.

Жёсткие правила:
- Весь текст строго на русском языке.
- Тон: уверенный, острый, без воды, без штампов.
- Никаких эмодзи, кроме одного ⚡ в конце Telegram-поста.
- Возвращай ТОЛЬКО валидный JSON по схеме ниже. Без markdown-обёрток, без комментариев.

Схема:
{
  "youtube": "многострочная структура видео с таймкодами и блоками ▸ ХУК / КОНТЕКСТ / ОСНОВНОЙ ТЕЗИС / ДОКАЗАТЕЛЬСТВА / ПРАКТИЧЕСКИЙ ШАГ / ЗАКРЫТИЕ",
  "telegram": "пост ~600-800 знаков, разговорный, заканчивается строкой '⚡ Подпишись, ...'",
  "shorts": ["хук 1", "хук 2", "хук 3", "хук 4", "хук 5"]
}`;

function buildUserPrompt(idea: string) {
  return `Сырая идея:\n"""${idea}"""\n\nРазверни её в JSON по заданной схеме.`;
}

type DeepSeekPayload = {
  youtube: string;
  telegram: string;
  shorts: string[];
};

function isValidPayload(x: unknown): x is DeepSeekPayload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.youtube === "string" &&
    typeof o.telegram === "string" &&
    Array.isArray(o.shorts) &&
    o.shorts.every((s) => typeof s === "string")
  );
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let idea = "";
  try {
    const body = await req.json();
    idea = typeof body?.idea === "string" ? body.idea.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!idea) {
    return NextResponse.json({ error: "Field 'idea' is required." }, { status: 400 });
  }
  if (idea.length > 280) idea = idea.slice(0, 280);

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(idea) },
      ],
      response_format: { type: "json_object" },
      stream: false,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "DeepSeek вернул невалидный JSON.", raw },
        { status: 502 }
      );
    }

    if (!isValidPayload(parsed)) {
      return NextResponse.json(
        { error: "DeepSeek вернул JSON, не соответствующий схеме.", payload: parsed },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `DeepSeek API error: ${message}` }, { status: 502 });
  }
}
