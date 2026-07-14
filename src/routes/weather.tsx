import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CloudRain,
  Droplets,
  Loader2,
  MapPin,
  Search,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { geocodePlace, getWeather, type WeatherResult } from "@/lib/weather.functions";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Smart Weather — KRUSHI" },
      {
        name: "description",
        content:
          "Live weather, 7-day forecast and AI farming suggestions for your village — irrigation, pests and field operations.",
      },
      { property: "og:title", content: "Smart Weather for Farmers — KRUSHI" },
      {
        property: "og:description",
        content: "Live conditions, 7-day outlook and crop-specific AI advice.",
      },
    ],
  }),
  component: WeatherPage,
});

const WEATHER_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Heavy showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Storm w/ hail",
  99: "Severe storm",
};

function labelFor(code: number) {
  return WEATHER_LABELS[code] ?? "—";
}

function WeatherPage() {
  const geocode = useServerFn(geocodePlace);
  const fetchWeather = useServerFn(getWeather);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeatherResult | null>(null);

  async function loadWeather(lat: number, lon: number, label?: string) {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetchWeather({ data: { lat, lon, label } });
      if ("error" in res) {
        toast.error("Could not load weather. Try again.");
        return;
      }
      setData(res.result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load weather");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
      () => loadWeather(28.6139, 77.209, "New Delhi, India"),
      { timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await geocode({ data: { query: query.trim() } });
      setResults(res.results);
      if (res.results.length === 0) toast.info("No matching place found.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Smart Weather</h1>
          <p className="mt-2 text-muted-foreground">
            Live conditions, a 7-day forecast and AI-generated farming suggestions for your fields.
          </p>
        </div>

        <form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search village, town or district (e.g. Nashik)"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={searching}>
            {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (p) => loadWeather(p.coords.latitude, p.coords.longitude),
                  () => toast.error("Location permission denied"),
                );
              }
            }}
          >
            <MapPin className="mr-2 h-4 w-4" /> Use my location
          </Button>
        </form>

        {results.length > 0 && (
          <div className="mt-3 rounded-xl border bg-card p-2 shadow-soft">
            {results.map((r) => (
              <button
                key={`${r.lat},${r.lon}`}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => loadWeather(r.lat, r.lon, r.name)}
              >
                <MapPin className="h-4 w-4 text-primary" /> {r.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading forecast…
            </div>
          )}

          {!loading && data && <WeatherView data={data} />}
        </div>
      </section>
    </PageShell>
  );
}

function WeatherView({ data }: { data: WeatherResult }) {
  const today = data.daily[0];
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }),
    [],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> {data.location}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-6xl font-bold">{Math.round(data.current.temperature)}°C</div>
              <div className="mt-1 text-muted-foreground">
                Feels like {Math.round(data.current.apparent)}°C · {labelFor(data.current.weather_code)}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${data.current.humidity}%`} />
              <Metric icon={<Wind className="h-4 w-4" />} label="Wind" value={`${Math.round(data.current.wind)} km/h`} />
              <Metric icon={<CloudRain className="h-4 w-4" />} label="Precip" value={`${data.current.precipitation} mm`} />
              <Metric
                icon={<Thermometer className="h-4 w-4" />}
                label="Today range"
                value={`${Math.round(today.temp_min)}° / ${Math.round(today.temp_max)}°`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" /> Farming advice
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.advice ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{data.advice}</div>
          ) : (
            <p className="text-sm text-muted-foreground">
              AI advice unavailable right now. Base decisions on the forecast below.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>7-day forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {data.daily.map((d) => (
              <div key={d.date} className="rounded-xl border bg-card/60 p-3 text-center">
                <div className="text-sm font-medium">{dateFmt.format(new Date(d.date))}</div>
                <div className="mt-1 text-xs text-muted-foreground">{labelFor(d.weather_code)}</div>
                <div className="mt-2 text-lg font-semibold">
                  {Math.round(d.temp_max)}° <span className="text-muted-foreground">/ {Math.round(d.temp_min)}°</span>
                </div>
                <div className="mt-1 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CloudRain className="h-3 w-3" />
                    {d.precipitation}mm
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {Math.round(d.wind_max)}km/h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card/60 px-3 py-2">
      <span className="text-primary">{icon}</span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
