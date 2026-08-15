import type { IDamageDetectionProvider, ImageInput, DetectionResult, Severity } from "@/domain/types";
import crypto from "crypto";

// ============================================================================
// SIMULATED PROVIDER — labeled clearly per the build prompt's guardrails.
// This is NOT a real trained model. It derives a deterministic "confidence"
// from the image bytes + filename so that different uploaded images produce
// different (but repeatable) accept/reject outcomes — genuinely testable,
// without pretending to be a live CV pipeline.
//
// To replace with a real model: implement IDamageDetectionProvider in a new
// file (e.g. providers/ai/yoloDamageDetectionProvider.ts) and switch it on in
// lib/registry.ts. Nothing else in the app needs to change.
// ============================================================================

const DEFECT_TYPES = ["pothole", "crack", "waterlogging", "faded_marking", "broken_signage"];

export class MockDamageDetectionProvider implements IDamageDetectionProvider {
  readonly name = "MockDamageDetectionProvider (simulated)";

  async detect(image: ImageInput): Promise<DetectionResult> {
    const hash = crypto.createHash("sha256").update(image.base64.slice(0, 20000)).digest();
    const seed = hash.readUInt32BE(0);

    // Deterministic pseudo-confidence in [0, 1) from image bytes.
    const confidence = (seed % 10000) / 10000;

    // Bias filenames containing hints toward higher/lower confidence so the
    // demo's "submit a non-road image" flow is reliably rejectable, while
    // "submit a real pothole photo" flow is reliably acceptable.
    const name = image.filename.toLowerCase();
    let adjusted = confidence;
    if (/(pothole|road|crack|street|asphalt|damage)/.test(name)) adjusted = Math.max(adjusted, 0.72);
    if (/(cat|dog|person|selfie|random|object|face)/.test(name)) adjusted = Math.min(adjusted, 0.25);

    const isRoadDefect = adjusted >= 0.5;
    const severity: Severity = adjusted > 0.85 ? "high" : adjusted > 0.65 ? "medium" : "low";
    const defectType = DEFECT_TYPES[seed % DEFECT_TYPES.length];

    // Deterministic pseudo bounding box, normalized 0-1. Use unsigned right shift
    // since `seed` can exceed 2^31 (readUInt32BE returns an unsigned value).
    const bx = ((seed >>> 4) % 40) / 100;
    const by = ((seed >>> 8) % 40) / 100;

    return {
      isRoadDefect,
      confidence: Math.round(adjusted * 100) / 100,
      severity,
      boundingBox: { x: bx, y: by, width: 0.35, height: 0.3 },
      defectType,
    };
  }
}
