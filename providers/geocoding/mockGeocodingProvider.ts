import type { IGeocodingProvider, GeocodeResult } from "@/domain/types";
import { JurisdictionRepository } from "@/repositories/jurisdictionRepository";

// SIMULATED PROVIDER — resolves a lat/lng to a plausible street address using
// a deterministic pattern plus the seeded jurisdiction lookup table, instead
// of calling a real geocoding API. Swap for MapboxGeocodingProvider or
// similar by implementing IGeocodingProvider and updating lib/registry.ts.
export class MockGeocodingProvider implements IGeocodingProvider {
  readonly name = "MockGeocodingProvider (simulated)";

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    const jurisdiction = await JurisdictionRepository.findContaining(lat, lng);
    const streetNumber = 100 + (Math.round(Math.abs(lat * 1000)) % 900);
    const streetNames = ["Main St", "Oak Ave", "Elm Rd", "Market St", "River Rd", "Park Blvd"];
    const street = streetNames[Math.round(Math.abs(lng * 1000)) % streetNames.length];

    if (jurisdiction) {
      return {
        address: `${streetNumber} ${street}, ${jurisdiction.city}, ${jurisdiction.state}`,
        city: jurisdiction.city,
        state: jurisdiction.state,
        country: jurisdiction.country,
      };
    }
    return {
      address: `${streetNumber} ${street}`,
      city: "Unknown locality",
      state: "",
      country: "",
    };
  }
}
