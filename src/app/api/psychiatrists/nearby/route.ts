import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { findNearbyPsychiatrists, type NearbyResponse, type SearchInput } from "@/lib/places";
import { clientIp, takeDailyQuota } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/server/request-guard";

// GET /api/psychiatrists/nearby?lat=..&lng=..   or   ?city=..
// Coordinates are used only for this one search — never logged or stored.

export const dynamic = "force-dynamic";

const coordsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

const citySchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, "Please type a city name.")
    .max(80, "That city name is too long.")
    .regex(/^[\p{L}\p{M}\s.,'()-]+$/u, "Please use letters only for the city name."),
});

function json(body: NearbyResponse, status: number, cacheable: boolean) {
  return NextResponse.json(body, {
    status,
    headers: {
      // Coordinate searches are private to this user — never cached by a shared CDN.
      "Cache-Control": cacheable ? "public, max-age=300, s-maxage=3600" : "private, no-store",
    },
  });
}

export async function GET(req: NextRequest) {
  // Each search costs money on the Google account: same-site only + a daily cap per visitor.
  if (!isSameOrigin(req)) return json({ ok: false, error: "Not allowed." }, 403, false);
  if (!takeDailyQuota("nearby", clientIp(req), 40)) {
    return json({ ok: false, error: "You've reached today's search limit — it resets tomorrow." }, 429, false);
  }
  try {
    const params = req.nextUrl.searchParams;
    let input: SearchInput;

    if (params.has("lat") || params.has("lng")) {
      const parsed = coordsSchema.safeParse({ lat: params.get("lat"), lng: params.get("lng") });
      if (!parsed.success || !params.get("lat")?.trim() || !params.get("lng")?.trim()) {
        return json({ ok: false, error: "That location didn't look right. Try searching by city instead." }, 400, false);
      }
      input = parsed.data;
    } else if (params.has("city")) {
      const parsed = citySchema.safeParse({ city: params.get("city") ?? "" });
      if (!parsed.success) {
        return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Please type a city name." }, 400, false);
      }
      input = parsed.data;
    } else {
      return json({ ok: false, error: "Share your location or type a city to search." }, 400, false);
    }

    const result = await findNearbyPsychiatrists(input);
    const isCity = "city" in input;
    return json(result, result.ok ? 200 : 502, result.ok && isCity);
  } catch (err) {
    console.error("[nearby] unexpected error:", (err as Error).message);
    return json({ ok: false, error: "Something went wrong on our side. Please try again." }, 500, false);
  }
}
