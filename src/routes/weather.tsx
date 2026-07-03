import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather — KRUSHI" },
      {
        name: "description",
        content: "7-day weather forecasts with farming suggestions for your crops and soil.",
      },
    ],
  }),
  component: () => (
    <PageShell>
      <ComingSoon
        title="Smart Weather"
        description="Live conditions and a 7-day forecast with animated icons and crop-specific farming suggestions are on the way."
      />
    </PageShell>
  ),
});
