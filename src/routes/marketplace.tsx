import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MapPin, Phone, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import {
  createListing,
  deleteListing,
  listListings,
} from "@/lib/marketplace.functions";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Farmer Marketplace — KRUSHI" },
      {
        name: "description",
        content:
          "Buy and sell farm produce directly with other Indian farmers — grains, vegetables, fruits and more, at fair prices.",
      },
      { property: "og:title", content: "Farmer Marketplace — KRUSHI" },
      {
        property: "og:description",
        content: "Fair, direct trade of produce between farmers across India.",
      },
    ],
  }),
  component: MarketplacePage,
});

interface Listing {
  id: string;
  user_id: string;
  crop: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  description: string | null;
  contact: string;
  image_url: string | null;
  created_at: string;
}

function MarketplacePage() {
  const { user, loading: authLoading } = useAuth();
  const fetchListings = useServerFn(listListings);
  const del = useServerFn(deleteListing);

  const [listings, setListings] = useState<Listing[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function refresh() {
    if (!user) {
      setListings([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchListings();
      setListings(rows as Listing[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this listing?")) return;
    try {
      await del({ data: { id } });
      setListings((cur) => cur?.filter((l) => l.id !== id) ?? null);
      toast.success("Listing removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl gradient-hero text-primary-foreground">
              <ShoppingBasket className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Marketplace</h1>
              <p className="mt-1 text-muted-foreground">
                Fair, direct trade of produce between farmers across India.
              </p>
            </div>
          </div>
          {user && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="mr-2 h-4 w-4" /> New listing
                </Button>
              </DialogTrigger>
              <NewListingDialog
                onCreated={(row) => {
                  setListings((cur) => [row, ...(cur ?? [])]);
                  setOpen(false);
                }}
              />
            </Dialog>
          )}
        </div>

        {authLoading || loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading listings…
          </div>
        ) : !user ? (
          <SignInPrompt what="browse and post listings" />
        ) : (listings?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              No listings yet. Be the first to list your produce!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings!.map((l) => (
              <Card key={l.id} className="overflow-hidden">
                {l.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image_url} alt={l.crop} className="h-40 w-full object-cover" />
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="capitalize">{l.crop}</span>
                    <span className="text-primary">₹{l.price}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {l.quantity} {l.unit} · Listed {new Date(l.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {l.description && <p className="text-foreground/90">{l.description}</p>}
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {l.location}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> {l.contact}
                  </p>
                  {l.user_id === user.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(l.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function NewListingDialog({ onCreated }: { onCreated: (row: Listing) => void }) {
  const create = useServerFn(createListing);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    crop: "",
    quantity: "",
    unit: "kg" as "kg" | "quintal" | "ton" | "bag" | "dozen",
    price: "",
    location: "",
    contact: "",
    description: "",
    image_url: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const row = await create({
        data: {
          crop: form.crop,
          quantity: Number(form.quantity),
          unit: form.unit,
          price: Number(form.price),
          location: form.location,
          contact: form.contact,
          description: form.description || undefined,
          image_url: form.image_url || undefined,
        },
      });
      toast.success("Listing posted");
      onCreated(row as Listing);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Post a new listing</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="crop">Crop / produce</Label>
          <Input id="crop" required value={form.crop} onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))} placeholder="e.g. Basmati rice" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" type="number" min="0.1" step="0.1" required value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label>Unit</Label>
            <Select value={form.unit} onValueChange={(v) => setForm((f) => ({ ...f, unit: v as typeof form.unit }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="quintal">Quintal</SelectItem>
                <SelectItem value="ton">Ton</SelectItem>
                <SelectItem value="bag">Bag</SelectItem>
                <SelectItem value="dozen">Dozen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="price">Price (₹/unit)</Label>
            <Input id="price" type="number" min="1" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" required value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Village, District, State" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="contact">Contact</Label>
          <Input id="contact" required value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="Phone or WhatsApp" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="desc">Description (optional)</Label>
          <Textarea id="desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Quality, variety, harvest date…" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="img">Image URL (optional)</Label>
          <Input id="img" type="url" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://…" />
        </div>
        <DialogFooter>
          <Button type="submit" variant="hero" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post listing
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function SignInPrompt({ what }: { what: string }) {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center shadow-soft">
      <h2 className="font-display text-xl font-bold">Sign in required</h2>
      <p className="mt-2 text-muted-foreground">Please sign in to {what}.</p>
      <div className="mt-4 flex justify-center gap-2">
        <Button asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/auth" search={{ mode: "signup" }}>Create account</Link>
        </Button>
      </div>
    </div>
  );
}
