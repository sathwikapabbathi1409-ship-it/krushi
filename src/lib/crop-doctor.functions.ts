import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAiGateway } from "@/lib/ai.server";

export interface CropDiagnosis {
  disease: string;
  confidence: number;
  causes: string[];
  treatment: string;
  organic_solution: string;
  chemical_solution: string;
  prevention: string[];
  is_healthy: boolean;
}

const VISION_PROMPT = `You are an expert plant pathologist for Indian agriculture. Analyze the crop image and identify any disease, pest damage or deficiency.
Respond ONLY with a valid JSON object (no markdown fences) with this exact shape:
{
  "disease": "short disease/condition name",
  "confidence": 0-100 integer,
  "causes": ["cause 1", "cause 2"],
  "treatment": "overall treatment summary",
  "organic_solution": "organic/natural remedy with quantities",
  "chemical_solution": "chemical remedy with product type and dosage",
  "prevention": ["tip 1", "tip 2", "tip 3"],
  "is_healthy": true/false
}
If the plant looks healthy, set is_healthy true, disease "Healthy", confidence high, and give care tips in prevention.`;

export const analyzeCrop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        imageDataUrl: z.string().min(1).max(12_000_000),
        partType: z.enum(["leaf", "fruit", "stem", "plant"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    let raw: string;
    try {
      raw = await callAiGateway({
        model: "google/gemini-2.5-flash",
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `${VISION_PROMPT}\nThe image shows the ${data.partType}.` },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI_ERROR";
      return { error: msg as "RATE_LIMIT" | "CREDITS_EXHAUSTED" | "AI_ERROR" };
    }

    // Parse JSON, stripping any accidental code fences
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    let result: CropDiagnosis;
    try {
      result = JSON.parse(cleaned) as CropDiagnosis;
    } catch {
      return { error: "PARSE_ERROR" as const };
    }

    // Store in history (best-effort)
    await context.supabase.from("disease_history").insert({
      user_id: context.userId,
      disease: result.disease,
      confidence: result.confidence,
      result: result as unknown as Record<string, unknown>,
    });

    return { result };
  });
