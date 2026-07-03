// Server-only helper for calling Lovable AI Gateway.
// Never import this from client/route files directly — use *.functions.ts wrappers.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

interface CallOptions {
  model?: string;
  messages: ChatMessage[];
  responseFormatJson?: boolean;
  temperature?: number;
}

export async function callAiGateway({
  model = "google/gemini-3-flash-preview",
  messages,
  responseFormatJson = false,
  temperature = 0.7,
}: CallOptions): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured. Missing LOVABLE_API_KEY.");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      ...(responseFormatJson ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (res.status === 429) {
    throw new Error("RATE_LIMIT");
  }
  if (res.status === 402) {
    throw new Error("CREDITS_EXHAUSTED");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[AI Gateway] error", res.status, text);
    throw new Error("AI_ERROR");
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}
