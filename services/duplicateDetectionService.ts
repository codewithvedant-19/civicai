import { IssueRepository } from "@/repositories/issueRepository";
import { hammingDistanceHex } from "@/services/imageHash";
import type { Issue } from "@/domain/types";

const HASH_DISTANCE_THRESHOLD = 10; // out of 64 bits; lower = stricter match
const PROXIMITY_DEG = 0.0015; // ~150m

export const DuplicateDetectionService = {
  /** Finds an existing open issue that this new report likely duplicates. */
  async findDuplicate(lat: number, lng: number, imageHash: string): Promise<Issue | undefined> {
    const nearby = await IssueRepository.listOpenNear(lat, lng, PROXIMITY_DEG);
    return nearby.find((issue) => hammingDistanceHex(issue.imageHash, imageHash) <= HASH_DISTANCE_THRESHOLD);
  },
};
