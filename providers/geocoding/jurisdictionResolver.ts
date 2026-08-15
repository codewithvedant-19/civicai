import type { IJurisdictionResolver, JurisdictionResolution } from "@/domain/types";
import { JurisdictionRepository } from "@/repositories/jurisdictionRepository";

// Pluggable/multi-jurisdiction by design: adding a new city is a data
// operation (seed a new Jurisdiction row with its bounds + authorityId),
// never a code change here.
//
// Safety net: if a submitted lat/lng falls outside every seeded jurisdiction's
// bounds (e.g. a reviewer's real device GPS, since this demo's jurisdictions
// use fictional coordinates), we still route it to the first seeded
// jurisdiction rather than leaving the issue authority-less and invisible to
// every authority dashboard. This is clearly a prototype fallback — a real
// deployment would use real polygon boundaries covering actual geography, so
// this branch would rarely if ever fire.
export class DefaultJurisdictionResolver implements IJurisdictionResolver {
  async resolve(lat: number, lng: number): Promise<JurisdictionResolution | null> {
    const jurisdiction = await JurisdictionRepository.findContaining(lat, lng);
    if (jurisdiction) return { jurisdictionId: jurisdiction.id, authorityId: jurisdiction.authorityId };

    const all = await JurisdictionRepository.list();
    const fallback = all[0];
    if (!fallback) return null;
    return { jurisdictionId: fallback.id, authorityId: fallback.authorityId };
  }
}
