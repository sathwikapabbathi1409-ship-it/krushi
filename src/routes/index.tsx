import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Stethoscope,
  MessageSquareText,
  CloudSun,
  Landmark,
  ShoppingBasket,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import heroFarmer from "@/assets/hero-farmer.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

const FEATURES = [
  {
    icon: Stethoscope,
    title: "AI Crop Doctor",
    desc: "Snap a leaf, fruit or stem and get instant disease diagnosis with organic and chemical treatments.",
    to: "/crop-doctor" as const,
  },
  {
    icon: MessageSquareText,
    title: "AI Assistant",
    desc: "Ask anything about fertilizer, irrigation or pests and get expert answers in your language.",
    to: "/assistant" as const,
  },
  {
    icon: CloudSun,
    title: "Smart Weather",
    desc: "7-day forecasts with farming suggestions tailored to your crops and soil.",
    to: "/weather" as const,
  },
  {
    icon: Landmark,
    title: "Govt. Schemes",
    desc: "Discover subsidies, loans and insurance you qualify for — with documents and apply links.",
    to: "/schemes" as const,
  },
  {
    icon: ShoppingBasket,
    title: "Marketplace",
    desc: "Sell crops, dairy, seeds and machinery directly to buyers at fair prices.",
    to: "/marketplace" as const,
  },
  {
    icon: Users,
    title: "Community",
    desc: "Learn and share with fellow farmers across organic, cotton, rice and more.",
    to: "/community" as const,
  },
];

const STATS = [
  { value: "50+", label: "Crop diseases detected" },
  { value: "24/7", label: "AI farming assistant" },
  { value: "10+", label: "Govt. schemes tracked" },
  { value: "100%", label: "Free for farmers" },
];

function Home() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-blob absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="animate-blob absolute right-0 top-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl [animation-delay:4s]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> AI powered smart agriculture
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] sm:text-6xl">
              Empowering Farmers with <span className="text-gradient">AI</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              KRUSHI puts a crop doctor, farming expert, weather forecaster and marketplace in every
              farmer's pocket — simple, smart and built for India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/crop-doctor">
                  Diagnose a crop <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/assistant">Ask the AI Assistant</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Secure &amp; private
              </span>
              <span className="inline-flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" /> Multi-language
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-4xl shadow-elevated">
              <img
                src={heroFarmer}
                alt="Smiling Indian farmer holding freshly harvested crops in a green field"
                width={1280}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>

            <motion.div
              className="absolute -left-4 bottom-8 hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Leaf blight detected</p>
                  <p className="text-xs text-muted-foreground">96% confidence</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-4 top-8 hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:block"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                  <CloudSun className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">28°C · Clear</p>
                  <p className="text-xs text-muted-foreground">Good for sowing</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-gradient">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Everything a modern farm needs</h2>
          <p className="mt-4 text-muted-foreground">
            One platform for diagnosis, advice, weather, schemes and trade.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={f.to}
                className="group flex h-full flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:gradient-hero group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-4xl gradient-hero px-8 py-16 text-center text-primary-foreground shadow-elevated">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to grow smarter?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
            Join KRUSHI free and get AI-powered help for every stage of your farming journey.
          </p>
          <Button variant="glass" size="xl" className="mt-8" asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Create your free account <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
