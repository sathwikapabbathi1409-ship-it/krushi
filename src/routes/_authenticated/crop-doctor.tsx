import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  Upload,
  Loader2,
  Leaf,
  Bug,
  FlaskConical,
  Sprout,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { analyzeCrop, type CropDiagnosis } from "@/lib/crop-doctor.functions";

export const Route = createFileRoute("/_authenticated/crop-doctor")({
  component: CropDoctor,
});

const PARTS = [
  { id: "leaf", label: "Leaf", icon: Leaf },
  { id: "fruit", label: "Fruit", icon: Sprout },
  { id: "stem", label: "Stem", icon: Sprout },
  { id: "plant", label: "Whole plant", icon: Sprout },
] as const;

type PartId = (typeof PARTS)[number]["id"];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function CropDoctor() {
  const analyze = useServerFn(analyzeCrop);
  const fileRef = useRef<HTMLInputElement>(null);
  const [part, setPart] = useState<PartId>("leaf");
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropDiagnosis | null>(null);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 8 * 1024 * 1024) return toast.error("Image must be under 8MB.");
    const url = await readFileAsDataUrl(file);
    setPreview(url);
    setDataUrl(url);
    setResult(null);
  }

  async function handleAnalyze() {
    if (!dataUrl) return toast.error("Upload an image first.");
    setLoading(true);
    setResult(null);
    try {
      const res = await analyze({ data: { imageDataUrl: dataUrl, partType: part } });
      if ("error" in res) {
        if (res.error === "RATE_LIMIT") toast.error("Too many requests. Please wait a moment.");
        else if (res.error === "CREDITS_EXHAUSTED")
          toast.error("AI credits exhausted. Please add credits to continue.");
        else toast.error("Could not analyze the image. Try a clearer photo.");
        return;
      }
      setResult(res.result);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-primary">
            <Stethoscope className="h-4 w-4" /> AI Crop Doctor
          </span>
          <h1 className="mt-6 text-4xl font-extrabold">Diagnose your crop in seconds</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Upload a photo of a leaf, fruit, stem or plant and get an instant AI diagnosis with
            treatment and prevention.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Uploader */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <p className="text-sm font-semibold">1. What are you photographing?</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {PARTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPart(p.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-colors ${
                    part === p.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <p.icon className="h-5 w-5" />
                  {p.label}
                </button>
              ))}
            </div>

            <p className="mt-6 text-sm font-semibold">2. Upload image</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-primary"
            >
              {preview ? (
                <img src={preview} alt="Crop preview" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Tap to upload or take a photo</span>
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />

            <Button
              variant="hero"
              className="mt-5 w-full"
              size="lg"
              onClick={handleAnalyze}
              disabled={loading || !dataUrl}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                </>
              ) : (
                "Diagnose crop"
              )}
            </Button>
          </div>

          {/* Result */}
          <div>
            {loading && (
              <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-border/60 bg-card p-6 text-muted-foreground shadow-soft">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Our AI is examining your crop…</p>
              </div>
            )}

            {!loading && !result && (
              <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/60 bg-secondary/30 p-6 text-center text-muted-foreground">
                <Stethoscope className="h-8 w-8" />
                <p className="text-sm">Your diagnosis will appear here.</p>
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div
                  className={`rounded-3xl border p-6 shadow-soft ${
                    result.is_healthy
                      ? "border-primary/40 bg-primary/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.is_healthy ? (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      ) : (
                        <Bug className="h-6 w-6 text-destructive" />
                      )}
                      <h2 className="text-xl font-bold">{result.disease}</h2>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                      {Math.round(result.confidence)}% confidence
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{result.treatment}</p>
                </div>

                {result.causes?.length > 0 && (
                  <ResultCard icon={Bug} title="Causes">
                    <ul className="list-disc space-y-1 pl-5">
                      {result.causes.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <ResultCard icon={Leaf} title="Organic solution" tone="primary">
                    <p>{result.organic_solution}</p>
                  </ResultCard>
                  <ResultCard icon={FlaskConical} title="Chemical solution" tone="accent">
                    <p>{result.chemical_solution}</p>
                  </ResultCard>
                </div>

                {result.prevention?.length > 0 && (
                  <ResultCard icon={ShieldCheck} title="Prevention">
                    <ul className="list-disc space-y-1 pl-5">
                      {result.prevention.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </ResultCard>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ResultCard({
  icon: Icon,
  title,
  children,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "primary" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "accent"
        ? "bg-accent/20 text-accent-foreground"
        : "bg-secondary text-foreground";
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
