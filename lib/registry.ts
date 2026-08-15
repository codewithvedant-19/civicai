import type {
  IDamageDetectionProvider,
  IRewardProvider,
  IAuthorityIntegration,
  IGeocodingProvider,
  IJurisdictionResolver,
} from "@/domain/types";
import { MockDamageDetectionProvider } from "@/providers/ai/mockDamageDetectionProvider";
import { MockRewardProvider } from "@/providers/rewards/mockRewardProvider";
import { SimulatedAuthorityRouter } from "@/providers/authority/simulatedAuthorityRouter";
import { MockGeocodingProvider } from "@/providers/geocoding/mockGeocodingProvider";
import { DefaultJurisdictionResolver } from "@/providers/geocoding/jurisdictionResolver";

// ============================================================================
// COMPOSITION ROOT — the single place that decides which concrete adapter
// backs each interface. Everything else in the app (services, API routes)
// depends only on the interfaces in /domain/types.ts.
//
// To go from mock to real: add a new adapter class implementing the same
// interface, then change ONE line below (or flip the env var). Nothing in
// /services, /app/api, or /components needs to change.
// ============================================================================

export function getDamageDetectionProvider(): IDamageDetectionProvider {
  // switch (process.env.AI_PROVIDER) { case "yolo": return new YoloDamageDetectionProvider(); }
  return new MockDamageDetectionProvider();
}

export function getRewardProvider(): IRewardProvider {
  // switch (process.env.REWARD_PROVIDER) { case "giftcardapi": return new GiftCardApiProvider(); }
  return new MockRewardProvider();
}

export function getAuthorityIntegration(): IAuthorityIntegration {
  // switch (process.env.AUTHORITY_PROVIDER) { case "cityapi": return new CityApiIntegration(); }
  return new SimulatedAuthorityRouter();
}

export function getGeocodingProvider(): IGeocodingProvider {
  // switch (process.env.GEOCODING_PROVIDER) { case "mapbox": return new MapboxGeocodingProvider(); }
  return new MockGeocodingProvider();
}

export function getJurisdictionResolver(): IJurisdictionResolver {
  return new DefaultJurisdictionResolver();
}
