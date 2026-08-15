// ============================================================================
// CivicRoad AI — Domain Types
// Single source of truth for shapes shared across ui / api / services / providers.
// ============================================================================

export type Role = "citizen" | "officer" | "authority_admin" | "super_admin";

export type Severity = "low" | "medium" | "high";
export type PriorityBand = "medium" | "high" | "critical";

export type IssueStatus =
  | "reported"
  | "ai_verified"
  | "authority_notified"
  | "under_review"
  | "officer_assigned"
  | "repair_in_progress"
  | "repair_completed"
  | "verification_pending"
  | "resolved"
  | "reopened";

export interface BoundingBox {
  x: number; // 0-1 normalized
  y: number;
  width: number;
  height: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  pointsBalance: number;
  level: number;
  streakCount: number;
  lastActivityDate: string | null;
  authorityId?: string; // for officer/authority_admin
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  pointsBalance: number;
  level: number;
  streakCount: number;
  authorityId?: string;
}

export interface DamageClass {
  id: string;
  label: string;
  icon: string;
  defaultSeverityWeight: number;
  description: string;
}

export interface Jurisdiction {
  id: string;
  city: string;
  state: string;
  country: string;
  authorityId: string;
  // simple bounding box lookup for the prototype instead of full polygons
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

export interface Authority {
  id: string;
  name: string;
  jurisdictionId: string;
  isSimulated: boolean;
}

export interface Officer {
  userId: string;
  authorityId: string;
  assignedIssueIds: string[];
}

export interface Confirmation {
  userId: string;
  createdAt: string;
}

export interface RepairEvidence {
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  notes?: string;
  officerId?: string;
  completedAt?: string;
}

export interface Issue {
  id: string;
  damageClassId: string;
  severity: Severity;
  status: IssueStatus;
  lat: number;
  lng: number;
  address: string;
  jurisdictionId: string;
  authorityId?: string;
  routedTo?: string;
  isSimulatedRouting?: boolean;
  reporterId: string;
  imageUrl: string;
  imageHash: string;
  aiConfidence: number;
  boundingBox: BoundingBox;
  confirmations: Confirmation[];
  priorityScore: number;
  priorityBand: PriorityBand;
  assignedOfficerId?: string;
  slaDeadline?: string;
  repairEvidence?: RepairEvidence;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  issueId: string;
  userId: string;
  imageUrl: string;
  aiConfidence: number;
  boundingBox: BoundingBox;
  imageHash: string;
  isDuplicateOf?: string;
  createdAt: string;
}

export type PointEventType =
  | "report_verified"
  | "confirmation"
  | "accuracy_bonus"
  | "resolution_bonus"
  | "redemption";

export interface PointsLedgerEntry {
  id: string;
  userId: string;
  eventType: PointEventType;
  amount: number; // negative for spends
  relatedIssueId?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: string;
}

export interface RewardItem {
  id: string;
  label: string;
  description: string;
  pointCost: number;
  stock: number;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  pointCost: number;
  status: "redeemed";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  relatedIssueId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId?: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface PriorityThresholds {
  highReporterCount: number;
  criticalReporterCount: number;
  severityWeight: number;
  reporterWeight: number;
  recencyWeight: number;
}

export interface Settings {
  aiConfidenceThreshold: number;
  priorityThresholds: PriorityThresholds;
  rateLimitReportsPerHour: number;
  slaHoursByBand: Record<PriorityBand, number>;
}

export interface ActiveProviders {
  ai: string;
  reward: string;
  authority: string;
  geocoding: string;
}

// ============================================================================
// Pluggable interfaces — the modularity contract (see build prompt Section 3).
// Every provider (mock or real) implements one of these. The app only ever
// depends on these interfaces, never on a concrete implementation directly.
// ============================================================================

export interface ImageInput {
  base64: string;
  mimeType: string;
  filename: string;
}

export interface DetectionResult {
  isRoadDefect: boolean;
  confidence: number;
  severity: Severity;
  boundingBox: BoundingBox;
  defectType: string; // damage_classes id
}

export interface IDamageDetectionProvider {
  readonly name: string;
  detect(image: ImageInput): Promise<DetectionResult>;
}

export interface RedemptionResult {
  success: boolean;
  redemption?: Redemption;
  error?: string;
}

export interface IRewardProvider {
  readonly name: string;
  listCatalog(): Promise<RewardItem[]>;
  redeem(userId: string, rewardId: string): Promise<RedemptionResult>;
}

export interface AuthorityRoutingResult {
  routedTo: string;
  isSimulated: boolean;
  externalRef?: string;
}

export interface IAuthorityIntegration {
  readonly name: string;
  routeIssue(issue: Issue, authority: Authority): Promise<AuthorityRoutingResult>;
  pushStatusUpdate?(issue: Issue): Promise<void>;
}

export interface GeocodeResult {
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface IGeocodingProvider {
  readonly name: string;
  reverseGeocode(lat: number, lng: number): Promise<GeocodeResult>;
}

export interface JurisdictionResolution {
  jurisdictionId: string;
  authorityId: string;
}

export interface IJurisdictionResolver {
  resolve(lat: number, lng: number): Promise<JurisdictionResolution | null>;
}
