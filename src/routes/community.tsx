import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — KRUSHI" },
      {
        name: "description",
        content: "A farmer discussion forum for organic farming, cotton, rice, wheat and more.",
      },
    ],
  }),
  component: () => (
    <PageShell>
      <ComingSoon
        title="Farmer Community"
        description="A discussion forum with posts, comments, likes and image sharing across organic, cotton, rice, wheat, vegetables and machinery is coming soon."
      />
    </PageShell>
  ),
});
