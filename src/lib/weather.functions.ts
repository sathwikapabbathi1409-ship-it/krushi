import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callAiGateway } from "@/lib/ai.server";

export interface DailyForecast {
  date: string;
  weather_code: number;
  temp_max: number;
  temp_min: number;
  precipitation: number;
  wind_max: number;
}

export interface WeatherResult {
  location: string;
  timezone: string;
  current: {
    temperature: number;
    apparent: number;
    humidity: number;
    wind: number;
    precipitation: number;
    weather_code: number;
    is_day: number;
  };
  daily: DailyForecast[];
  advice: string;
}

/** Get 7-day forecast + AI farming advice for coordinates. */
export const getWeather = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
        label: z.string().max(120).optional(),
        crops: z.string().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(data.lat));
    url.searchParams.set("longitude", String(data.lon));
    url.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day",
    );
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
    );
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("wind_speed_unit", "kmh");

    const res = await fetch(url.toString());
    if (!res.ok) return { error: "WEATHER_ERROR" as const };
    const json = (await res.json()) as {
      timezone: string;
      current: Record<string, number>;
      daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        wind_speed_10m_max: number[];
      };
    };

    // Reverse geocode
    let locationLabel = data.label ?? `${data.lat.toFixed(2)}, ${data.lon.toFixed(2)}`;
    if (!data.label) {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${data.lat}&longitude=${data.lon}&count=1`,
        );
        if (geoRes.ok) {
          const g = (await geoRes.json()) as { results?: Array<{ name?: string; admin1?: string; country?: string }> };
          const first = g.results?.[0];
          if (first) {
            locationLabel = [first.name, first.admin1, first.country].filter(Boolean).join(", ");
          }
        }
      } catch {
        /* ignore */
      }
    }

    const daily: DailyForecast[] = json.daily.time.map((date, i) => ({
      date,
      weather_code: json.daily.weather_code[i],
      temp_max: json.daily.temperature_2m_max[i],
      temp_min: json.daily.temperature_2m_min[i],
      precipitation: json.daily.precipitation_sum[i],
      wind_max: json.daily.wind_speed_10m_max[i],
    }));

    // Ask AI for a short crop advice (best-effort)
    let advice = "";
    try {
      advice = await callAiGateway({
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are an agronomy assistant. Given a 7-day forecast for an Indian farm, produce 3 short, actionable bullet points (in the user's language if provided) covering irrigation, pest risk and field operations. Keep under 90 words. Use markdown bullets.",
          },
          {
            role: "user",
            content: `Location: ${locationLabel}\nCrops: ${data.crops ?? "mixed"}\nForecast (max/min °C, rain mm, wind km/h):\n${daily
              .map(
                (d) =>
                  `${d.date}: ${d.temp_max}/${d.temp_min}°C, rain ${d.precipitation}mm, wind ${d.wind_max}km/h`,
              )
              .join("\n")}`,
          },
        ],
      });
    } catch {
      advice = "";
    }

    const result: WeatherResult = {
      location: locationLabel,
      timezone: json.timezone,
      current: {
        temperature: json.current.temperature_2m,
        apparent: json.current.apparent_temperature,
        humidity: json.current.relative_humidity_2m,
        wind: json.current.wind_speed_10m,
        precipitation: json.current.precipitation,
        weather_code: json.current.weather_code,
        is_day: json.current.is_day,
      },
      daily,
      advice,
    };
    return { result };
  });

/** Geocode an Indian place name to coordinates. */
export const geocodePlace = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ query: z.string().trim().min(2).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(data.query)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return { results: [] as Array<{ name: string; lat: number; lon: number }> };
    const j = (await res.json()) as {
      results?: Array<{
        name: string;
        latitude: number;
        longitude: number;
        admin1?: string;
        country?: string;
      }>;
    };
    return {
      results: (j.results ?? []).map((r) => ({
        name: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
        lat: r.latitude,
        lon: r.longitude,
      })),
    };
  });
