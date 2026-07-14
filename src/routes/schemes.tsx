import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Search, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SCHEMES, type Scheme } from "@/lib/schemes-data";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes for Farmers — KRUSHI" },
      {
        name: "description",
        content:
          "Explore PM-KISAN, PMFBY, KCC, PMKSY, e-NAM and other major central government schemes for Indian farmers with eligibility and how to apply.",
      },
      { property: "og:title", content: "Farmer Schemes — KRUSHI" },
      {
        property: "og:description",
        content:
          "Discover benefits and application steps for the most important central government schemes for farmers.",
      },
    ],
  }),
  component: SchemesPage,
});

const CATEGORIES: Array<{ key: Scheme["category"] | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "income", label: "Income support" },
  { key: "insurance", label: "Insurance" },
  { key: "credit", label: "Credit" },
  { key: "irrigation", label: "Irrigation" },
  { key: "market", label: "Market access" },
  { key: "soil", label: "Soil health" },
  { key: "organic", label: "Organic" },
];

function SchemesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Scheme["category"] | "all">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SCHEMES.filter((s) => {
      const catOk = cat === "all" || s.category === cat;
      if (!needle) return catOk;
      return (
        catOk &&
        (s.name.toLowerCase().includes(needle) ||
          s.eligibility.toLowerCase().includes(needle) ||
          s.benefit.toLowerCase().includes(needle))
      );
    });
  }, [q, cat]);

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl gradient-hero text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Government Schemes</h1>
            <p className="mt-1 text-muted-foreground">
              Major central government schemes for Indian farmers, with eligibility and how to apply.
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search schemes (e.g. insurance, drip, credit)"
              className="pl-9"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                cat === c.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((s) => (
            <Card key={s.slug} className="border-primary/10">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{s.name}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{s.ministry}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {s.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-foreground">Benefit</div>
                  <p className="text-muted-foreground">{s.benefit}</p>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Eligibility</div>
                  <p className="text-muted-foreground">{s.eligibility}</p>
                </div>
                <div>
                  <div className="font-semibold text-foreground">How to apply</div>
                  <p className="text-muted-foreground">{s.howToApply}</p>
                </div>
                <Button variant="outline" asChild className="mt-2">
                  <a href={s.link} target="_blank" rel="noreferrer noopener">
                    Visit official site <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-muted-foreground">
              No schemes match your search.
            </p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
