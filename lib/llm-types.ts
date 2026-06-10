// Единый контракт ответа LLM (DeepSeek) между серверным route и клиентским generate.
// Источник истины для формы JSON, который модель обязана вернуть по SYSTEM_PROMPT.

export interface LLMContentPayload {
  youtube: string;
  telegram: string;
  shorts: string[];
}

// Рантайм-валидатор той же формы. Чистая функция — безопасна и на сервере, и в тестах.
export function isValidLLMPayload(x: unknown): x is LLMContentPayload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.youtube === "string" &&
    typeof o.telegram === "string" &&
    Array.isArray(o.shorts) &&
    o.shorts.every((s) => typeof s === "string")
  );
}
