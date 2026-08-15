import { NextResponse } from "next/server";
import { JurisdictionRepository } from "@/repositories/jurisdictionRepository";

// Lets the report-capture UI offer a city picker instead of relying purely on
// the device's real GPS, since this prototype's seeded jurisdictions cover
// fictional demo coordinates rather than real geography. Adding a new city
// is still a pure data operation (seed a new Jurisdiction row) — this route
// just reflects whatever is seeded, never hardcodes a city list.
export async function GET() {
  const jurisdictions = await JurisdictionRepository.list();
  return NextResponse.json({
    jurisdictions: jurisdictions.map((j) => ({
      id: j.id,
      city: j.city,
      state: j.state,
      country: j.country,
      bounds: j.bounds,
    })),
  });
}
