import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

/** Elegant "coming soon" section for modules on the roadmap. */
export function ComingSoon({
  title,
  description,
  eyebrow = "On the roadmap",
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" /> {eyebrow}
        </span>
        <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="hero" size="lg" asChild>
            <Link to="/crop-doctor">Try Crop Doctor</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/assistant">Ask the AI Assistant</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
