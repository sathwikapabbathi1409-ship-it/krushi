import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ListingInput = z.object({
  crop: z.string().trim().min(2).max(80),
  quantity: z.number().positive().max(1_000_000),
  unit: z.enum(["kg", "quintal", "ton", "bag", "dozen"]),
  price: z.number().positive().max(10_000_000),
  location: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(4).max(120),
  description: z.string().trim().max(1000).optional(),
  image_url: z.string().url().max(500).optional().or(z.literal("")),
});

export const listListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("marketplace_listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ListingInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("marketplace_listings")
      .insert({
        user_id: context.userId,
        crop: data.crop,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        location: data.location,
        contact: data.contact,
        description: data.description ?? null,
        image_url: data.image_url || null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("marketplace_listings")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
