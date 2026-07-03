import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-extrabold">KRUSHI</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Empowering Indian farmers with AI — crop disease detection, smart advice, weather,
              schemes and a fair marketplace, all in one place.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/crop-doctor" className="hover:text-foreground">Crop Doctor</Link></li>
              <li><Link to="/assistant" className="hover:text-foreground">AI Assistant</Link></li>
              <li><Link to="/weather" className="hover:text-foreground">Weather</Link></li>
              <li><Link to="/marketplace" className="hover:text-foreground">Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/schemes" className="hover:text-foreground">Schemes</Link></li>
              <li><Link to="/community" className="hover:text-foreground">Community</Link></li>
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} KRUSHI. Built for the farmers of India.
        </div>
      </div>
    </footer>
  );
}
