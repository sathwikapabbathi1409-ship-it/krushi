import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Leaf, Target, Heart } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — KRUSHI" },
      {
        name: "description",
        content: "KRUSHI is an AI-powered smart agriculture platform built to empower Indian farmers.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-primary">
            <Leaf className="h-4 w-4" /> About KRUSHI
          </span>
          <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">
            Technology that works for the farmer
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            KRUSHI brings modern AI to Indian agriculture in a simple, accessible way. From
            diagnosing crop disease with a photo to answering everyday farming questions in your own
            language, our mission is to make expert help available to every farmer, everywhere.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-bold">Our mission</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Empower farmers with instant, reliable, AI-driven guidance to boost yields, reduce
              losses and improve livelihoods.
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
              <Heart className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-bold">Built for India</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Designed around real needs — multi-language support, offline-friendly design and a
              marketplace that connects farmers directly to buyers.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Join KRUSHI free
            </Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
