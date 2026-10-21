import "server-only";

// SERVER-ONLY helpers for "Top 5 psychiatrists near me".
// Import this file only from route handlers / server code — it reads GOOGLE_PLACES_API_KEY.
// Privacy: coordinates are used only for the outgoing search and are never logged or stored.

export type NearbyPlace = {
  id: string;
  name: string;
  address: string | null;
  rating: number | null;
  userRatingCount: number | null;
  distanceKm: number | null;
  mapsUrl: string;
  websiteUrl: string | null;
  phone: string | null;
  openNow: boolean | null;
  /** Full listing name as shown on Google (display name is cleaned up). */
  fullName?: string;
  /** Listing name/website clearly mentions psychiatry or mental health. */
  psychiatryConfirmed?: boolean;
};

export type NearbySource = "google" | "openstreetmap";

export type NearbyResponse =
  | {
      ok: true;
      source: NearbySource;
      ratingsAvailable: boolean;
      results: NearbyPlace[];
      /** How far we searched (Google only). */
      radiusKm?: number;
    }
  | { ok: false; error: string };

export type SearchInput = { lat: number; lng: number } | { city: string };

const RADIUS_METERS = 15_000;
const TOP_N = 5;
const TIMEOUT_MS = 8_000;
// Bayesian weighting: m = "prior" number of reviews, C = prior mean rating.
const PRIOR_REVIEWS = 20;
const PRIOR_RATING = 4.0;
const OSM_USER_AGENT = "EaseMind/0.1 (wellness app)";
const OVERPASS_TIMEOUT_MS = 20_000;
// Only the main OpenStreetMap Overpass server. Adding another host would send
// users' (rounded) location to a new third party — the owner must approve that first.
const OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter"];

/** Great-circle distance in km. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** (v/(v+m))*R + (m/(v+m))*C — a 5.0 with 3 reviews won't beat a 4.7 with 600. */
export function bayesianScore(rating: number, reviews: number, m = PRIOR_REVIEWS, c = PRIOR_RATING): number {
  const v = Math.max(0, reviews);
  return (v / (v + m)) * rating + (m / (v + m)) * c;
}

// Round coordinates (~110 m) before sending them to any third party.
const coarse = (n: number) => Math.round(n * 1000) / 1000;
const roundKm = (n: number) => Math.round(n * 10) / 10;

function mapsSearchUrl(name: string, lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${lat},${lng}`)}`;
}

/* ----------------------------- Google Places ----------------------------- */

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  location?: { latitude?: number; longitude?: number };
  currentOpeningHours?: { openNow?: boolean };
  businessStatus?: string;
  types?: string[];
  shortFormattedAddress?: string;
};

const GOOGLE_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.shortFormattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.location",
  "places.currentOpeningHours.openNow",
  "places.businessStatus",
  "places.types",
].join(",");

const PLACES_URL = "https://places.googleapis.com/v1/places:searchText";
// Search close first, widen only if there aren't enough confirmed matches.
const RADII_KM = [5, 15, 30];
// Listing text that shows the place really is psychiatry / mental health.
const PSYCH_SIGNAL = /psychiatr|neuro-?psych|mental health|\bmind\b|manas|\bmann\b|de-?addiction|\bDPM\b|MD[\s,.(]*psych|DNB[\s,.(]*psych|MRCPsych/i;
const MEDICAL_TYPES = new Set(["doctor", "medical_clinic", "hospital", "health"]);
const AREA_TYPES = new Set([
  "locality",
  "sublocality",
  "sublocality_level_1",
  "neighborhood",
  "postal_town",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
]);
const EXCLUDED_TYPES = new Set(["pharmacy", "drugstore", "store", "beauty_salon", "hair_care", "spa", "gym"]);

/** Turn an SEO-stuffed listing name into a clean display name. */
export function cleanPlaceName(raw: string): string {
  // Cut at a "|" / "•" separator, or at a dash that starts marketing text ("- Best…", "- #1…").
  let n = raw.split(/\s*[|•]\s*|\s*[-–—]\s*(?=best\b|top\b|no\.?\s?1\b|#\s?1\b)/i)[0];
  n = n.replace(/\s*(#\s?1|no\.?\s?1|best|top)\s+(psychiatrist|clinic|doctor)s?\b.*$/i, "");
  // Drop an unclosed bracket left by truncation: "Clinic(care and counselling with…"
  const open = n.lastIndexOf("(");
  if (open > 0 && n.indexOf(")", open) === -1) n = n.slice(0, open);
  n = n.replace(/[\s,:;\-–—|]+$/, "").trim();
  // Keyword lists after commas: "Dr. A ,Depression ,Alcohol Deaddiction…" → "Dr. A"
  if (n.length > 48 && n.includes(",")) {
    const first = n.split(",")[0].trim();
    if (first.length >= 3) n = first;
  }
  return n.length >= 3 ? n : raw.trim();
}

const nameKey = (n: string) =>
  n.toLowerCase().replace(/\b(dr|doctor|mbbs|md|dnb|dpm)\b\.?/g, "").replace(/[^a-z]/g, "");

async function googleText(apiKey: string, body: Record<string, unknown>, mask = GOOGLE_FIELD_MASK) {
  const res = await fetch(PLACES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": mask },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Google Places responded ${res.status}`);
  return (await res.json()) as { places?: GooglePlace[] };
}

/** Precise city centre via Google (same key) so city searches get distances too. */
async function geocodeCityGoogle(city: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  const data = await googleText(
    apiKey,
    { textQuery: city, pageSize: 3, includedType: "locality" },
    "places.location,places.types"
  );
  // Google may return a building for nonsense input ("Qwertyville" → "Qwerty" apartments),
  // so only accept real places-on-a-map types. Aliases still work (Gurgaon → Gurugram, Bombay → Mumbai).
  const match = (data.places ?? []).find((p) => (p.types ?? []).some((t) => AREA_TYPES.has(t)));
  const loc = match?.location;
  return typeof loc?.latitude === "number" && typeof loc?.longitude === "number" ? { lat: loc.latitude, lng: loc.longitude } : null;
}

/** Box around a point (Text Search locationRestriction only accepts rectangles). */
function boxAround(c: { lat: number; lng: number }, km: number) {
  const dLat = km / 111.32;
  const dLng = km / (111.32 * Math.cos((c.lat * Math.PI) / 180));
  return { rectangle: { low: { latitude: c.lat - dLat, longitude: c.lng - dLng }, high: { latitude: c.lat + dLat, longitude: c.lng + dLng } } };
}

type Candidate = { place: NearbyPlace; score: number; verified: boolean };

function toCandidates(places: GooglePlace[], origin: { lat: number; lng: number }, maxKm: number): Candidate[] {
  const out: Candidate[] = [];
  for (const p of places) {
    if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;
    if (typeof p.rating !== "number" || !p.userRatingCount) continue;
    const types = p.types ?? [];
    if (types.some((t) => EXCLUDED_TYPES.has(t)) || !types.some((t) => MEDICAL_TYPES.has(t))) continue;
    const lat = p.location?.latitude;
    const lng = p.location?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    const km = haversineKm(origin, { lat, lng });
    if (km > maxKm) continue; // stay strictly inside the search circle
    const fullName = p.displayName?.text ?? "Unnamed clinic";
    const verified = PSYCH_SIGNAL.test(fullName) || PSYCH_SIGNAL.test(p.websiteUri ?? "");
    // Quality (Bayesian rating) with a gentle preference for closer places.
    const score = bayesianScore(p.rating, p.userRatingCount) * (1 - Math.min(km, 30) / 200);
    out.push({
      verified,
      score,
      place: {
        id: p.id ?? `${fullName}-${lat}-${lng}`,
        name: cleanPlaceName(fullName),
        fullName,
        address: p.shortFormattedAddress ?? p.formattedAddress ?? null,
        rating: p.rating,
        userRatingCount: p.userRatingCount,
        distanceKm: roundKm(km),
        mapsUrl: p.googleMapsUri ?? mapsSearchUrl(fullName, lat, lng),
        websiteUrl: p.websiteUri ?? null,
        phone: p.nationalPhoneNumber ?? null,
        openNow: typeof p.currentOpeningHours?.openNow === "boolean" ? p.currentOpeningHours.openNow : null,
        psychiatryConfirmed: verified,
      },
    });
  }
  return out;
}

export class CityNotFoundError extends Error {
  constructor() {
    super("city not found");
  }
}

export async function searchGoogle(
  input: SearchInput,
  apiKey: string
): Promise<{ results: NearbyPlace[]; radiusKm: number }> {
  const origin = "city" in input ? await geocodeCityGoogle(input.city, apiKey) : { lat: coarse(input.lat), lng: coarse(input.lng) };
  if (!origin) throw new CityNotFoundError();

  const seen = new Map<string, Candidate>();
  let radiusKm = RADII_KM[0];
  for (const km of RADII_KM) {
    radiusKm = km;
    const data = await googleText(apiKey, {
      textQuery: "psychiatrist",
      includedType: "doctor",
      strictTypeFiltering: false,
      pageSize: 20,
      rankPreference: "RELEVANCE",
      locationRestriction: boxAround(origin, km),
    });
    for (const c of toCandidates(data.places ?? [], origin, km)) {
      const k = nameKey(c.place.name);
      const prev = seen.get(k);
      // Same doctor listed twice → keep the listing with more reviews.
      if (!prev || (c.place.userRatingCount ?? 0) > (prev.place.userRatingCount ?? 0)) seen.set(k, c);
    }
    if ([...seen.values()].filter((c) => c.verified).length >= TOP_N) break;
  }

  // Confirmed psychiatry listings first, then established ones (5+ reviews), then by score.
  const results = [...seen.values()]
    .sort(
      (a, b) =>
        Number(b.verified) - Number(a.verified) ||
        Number((b.place.userRatingCount ?? 0) >= 5) - Number((a.place.userRatingCount ?? 0) >= 5) ||
        b.score - a.score
    )
    .slice(0, TOP_N)
    .map((c) => c.place);
  return { results, radiusKm };
}

/* --------------------------- OpenStreetMap fallback --------------------------- */

export async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": OSM_USER_AGENT, "Accept-Language": "en" },
    next: { revalidate: 60 * 60 * 24 }, // city names aren't personal data; cache for a day
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);
  const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
  const first = data[0];
  if (!first?.lat || !first?.lon) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function osmAddress(tags: Record<string, string>): string | null {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter((s) => s && s.trim());
  return parts.length ? parts.join(", ") : null;
}

export async function searchOsm(origin: { lat: number; lng: number }): Promise<NearbyPlace[]> {
  const o = { lat: coarse(origin.lat), lng: coarse(origin.lng) };
  const around = `around:${RADIUS_METERS},${o.lat},${o.lng}`;
  const query = `[out:json][timeout:20];
(
  nwr["healthcare:speciality"~"psychiatry",i](${around});
  nwr["healthcare"="psychotherapist"](${around});
  nwr["amenity"="doctors"]["healthcare:speciality"~"psychiatr",i](${around});
);
out center tags 60;`;

  // The main public Overpass server often rejects server-side traffic (502/504),
  // so we keep the request short and fail fast (no third-party mirrors — owner decision)
  // and use whichever answers first (total wait capped at OVERPASS_TIMEOUT_MS).
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), OVERPASS_TIMEOUT_MS);
  let data: { elements?: OverpassElement[] };
  try {
    data = await Promise.any(
      OVERPASS_ENDPOINTS.map(async (endpoint) => {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": OSM_USER_AGENT },
          body: `data=${encodeURIComponent(query)}`,
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`Overpass responded ${res.status}`);
        return (await res.json()) as { elements?: OverpassElement[] };
      }),
    );
  } catch (err) {
    const reasons = err instanceof AggregateError ? err.errors.map((e) => (e as Error).message).join("; ") : String(err);
    throw new Error(`All Overpass endpoints failed: ${reasons}`);
  } finally {
    clearTimeout(timer);
    ctrl.abort(); // cancel the slower request
  }

  const seen = new Set<string>();
  const places: NearbyPlace[] = [];
  for (const el of data.elements ?? []) {
    const tags = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const name = tags.name ?? tags["name:en"];
    if (typeof lat !== "number" || typeof lng !== "number" || !name) continue;
    const key = `${name.toLowerCase()}-${lat.toFixed(3)}-${lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const website = tags.website ?? tags["contact:website"] ?? null;
    places.push({
      id: `osm-${el.type}-${el.id}`,
      name,
      address: osmAddress(tags),
      rating: null,
      userRatingCount: null,
      distanceKm: roundKm(haversineKm(o, { lat, lng })),
      mapsUrl: mapsSearchUrl(name, lat, lng),
      websiteUrl: website && /^https?:\/\//i.test(website) ? website : null,
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      openNow: null,
    });
  }
  return places.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)).slice(0, TOP_N);
}

/* --------------------------------- Main --------------------------------- */

export async function findNearbyPsychiatrists(input: SearchInput): Promise<NearbyResponse> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (apiKey) {
    try {
      const { results, radiusKm } = await searchGoogle(input, apiKey);
      return { ok: true, source: "google", ratingsAvailable: true, results, radiusKm };
    } catch (err) {
      if (err instanceof CityNotFoundError) {
        return { ok: false, error: "We couldn't find that city. Check the spelling or try a nearby bigger city." };
      }
      // Log only the error message — never the coordinates or city.
      console.error("[nearby] Google Places failed, falling back to OpenStreetMap:", (err as Error).message);
    }
  }

  try {
    const origin = "lat" in input ? input : await geocodeCity(input.city);
    if (!origin) {
      return { ok: false, error: "We couldn't find that city. Check the spelling or try a nearby bigger city." };
    }
    const results = await searchOsm(origin);
    return { ok: true, source: "openstreetmap", ratingsAvailable: false, results };
  } catch (err) {
    console.error("[nearby] OpenStreetMap search failed:", (err as Error).message);
    return {
      ok: false,
      error: "We couldn't reach the map service right now. Please try again in a minute.",
    };
  }
}
