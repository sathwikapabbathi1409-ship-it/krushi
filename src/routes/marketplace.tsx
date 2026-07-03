import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — KRUSHI" },
      {
        name: "description",
        content: "Buy and sell crops, vegetables, fruits, dairy, seeds and machinery at fair prices.",
      },
    ],
  }),
  component: () => (
    <PageShell>
      <ComingSoon
        title="Farmer Marketplace"
        description="Sell crops, dairy, seeds and machinery directly to buyers with search, filters, wishlists and direct WhatsApp contact. Launching soon."
      />
    </PageShell>
  ),
});
