import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes — KRUSHI" },
      {
        name: "description",
        content: "Search PM Kisan, crop insurance, subsidies, loans and state schemes for farmers.",
      },
    ],
  }),
  component: () => (
    <PageShell>
      <ComingSoon
        title="Government Schemes"
        description="A searchable hub for PM Kisan, crop insurance, subsidies, loans and equipment schemes — with eligibility, documents and apply links — is coming next."
      />
    </PageShell>
  ),
});
