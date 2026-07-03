import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, User as UserIcon, Save } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

interface ProfileForm {
  full_name: string;
  village: string;
  district: string;
  state: string;
  farm_size: string;
  soil_type: string;
  primary_crops: string;
}

const EMPTY: ProfileForm = {
  full_name: "",
  village: "",
  district: "",
  state: "",
  farm_size: "",
  soil_type: "",
  primary_crops: "",
};

function Profile() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data: row } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      return row;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        full_name: data.full_name ?? "",
        village: data.village ?? "",
        district: data.district ?? "",
        state: data.state ?? "",
        farm_size: data.farm_size ?? "",
        soil_type: data.soil_type ?? "",
        primary_crops: data.primary_crops ?? "",
      });
    }
  }, [data]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: uid, ...form }, { onConflict: "id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved.");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  function field(key: keyof ProfileForm) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero text-primary-foreground">
            <UserIcon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold">Farmer Profile</h1>
            <p className="text-sm text-muted-foreground">Tell us about your farm.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="mt-8 space-y-5 rounded-3xl border border-border/60 bg-card p-6 shadow-soft"
          >
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...field("full_name")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input id="village" {...field("village")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input id="district" {...field("district")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...field("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm_size">Farm size (acres)</Label>
                <Input id="farm_size" {...field("farm_size")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soil_type">Soil type</Label>
                <Input id="soil_type" placeholder="e.g. Black, Red, Alluvial" {...field("soil_type")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_crops">Primary crops</Label>
                <Input id="primary_crops" placeholder="e.g. Cotton, Wheat" {...field("primary_crops")} />
              </div>
            </div>
            <Button type="submit" variant="hero" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save profile
            </Button>
          </form>
        )}
      </section>
    </PageShell>
  );
}
