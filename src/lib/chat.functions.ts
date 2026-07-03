import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAiGateway, type ChatMessage } from "@/lib/ai.server";

const SYSTEM_PROMPT = `You are KRUSHI's AI farming assistant, an expert agronomist helping Indian farmers.
- Give practical, actionable advice about crops, fertilizers, irrigation, pests, diseases, soil and weather.
- Be concise and clear. Use simple language. Use markdown (headings, bullet lists, bold) for readability.
- When relevant, mention both organic and chemical options, and approximate quantities.
- If the user writes in Hindi or another Indian language, reply in that same language.
- If a question is outside farming, gently steer back to agriculture.`;

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_threads")
      .insert({ user_id: context.userId })
      .select("id, title, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("chat_threads")
      .delete()
      .eq("id", data.threadId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        threadId: z.string().uuid(),
        content: z.string().trim().min(1).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Persist the user message
    const { error: insertErr } = await supabase.from("chat_messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "user",
      content: data.content,
    });
    if (insertErr) throw new Error(insertErr.message);

    // Load full history for context
    const { data: history, error: histErr } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (histErr) throw new Error(histErr.message);

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history ?? []).map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
    ];

    let reply: string;
    try {
      reply = await callAiGateway({ messages });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI_ERROR";
      return { error: msg as "RATE_LIMIT" | "CREDITS_EXHAUSTED" | "AI_ERROR" };
    }

    // Persist assistant reply
    const { data: assistantRow, error: aErr } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: data.threadId,
        user_id: userId,
        role: "assistant",
        content: reply,
      })
      .select("id, role, content, created_at")
      .single();
    if (aErr) throw new Error(aErr.message);

    // Auto-title the thread from the first user message
    const isFirst = (history ?? []).filter((m) => m.role === "user").length <= 1;
    if (isFirst) {
      const title = data.content.slice(0, 60);
      await supabase.from("chat_threads").update({ title }).eq("id", data.threadId);
    } else {
      await supabase
        .from("chat_threads")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", data.threadId);
    }

    return { message: assistantRow };
  });
