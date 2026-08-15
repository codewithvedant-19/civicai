import { supabaseServer } from "@/lib/supabase";
import type { Issue, Confirmation, IssueStatus, Severity, PriorityBand } from "@/domain/types";
import { v4 as uuid } from "uuid";

function mapIssue(data: any): Issue {
  const ev = Array.isArray(data.repair_evidences) ? data.repair_evidences[0] : data.repair_evidences;
  return {
    id: data.id,
    damageClassId: data.damage_class_id,
    severity: data.severity as Severity,
    status: data.status as IssueStatus,
    lat: data.lat,
    lng: data.lng,
    address: data.address,
    jurisdictionId: data.jurisdiction_id,
    authorityId: data.authority_id || undefined,
    routedTo: data.routed_to || undefined,
    isSimulatedRouting: data.is_simulated_routing,
    reporterId: data.reporter_id,
    imageUrl: data.image_url,
    imageHash: data.image_hash,
    aiConfidence: data.ai_confidence,
    boundingBox: data.bounding_box,
    confirmations: (data.issue_confirmations || []).map((c: any) => ({
      userId: c.user_id,
      createdAt: c.created_at,
    })),
    priorityScore: data.priority_score,
    priorityBand: data.priority_band as PriorityBand,
    assignedOfficerId: data.assigned_officer_id || undefined,
    slaDeadline: data.sla_deadline || undefined,
    repairEvidence: ev ? {
      beforePhotoUrl: ev.before_photo_url || undefined,
      afterPhotoUrl: ev.after_photo_url || undefined,
      notes: ev.notes || undefined,
      officerId: ev.officer_id || undefined,
      completedAt: ev.completed_at || undefined,
    } : undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

const FULL_SELECT = "*, issue_confirmations(*), repair_evidences(*)";

export const IssueRepository = {
  async findById(id: string): Promise<Issue | undefined> {
    const { data } = await supabaseServer.from("issues").select(FULL_SELECT).eq("id", id).maybeSingle();
    return data ? mapIssue(data) : undefined;
  },

  async list(): Promise<Issue[]> {
    const { data } = await supabaseServer.from("issues").select(FULL_SELECT);
    return (data || []).map(mapIssue);
  },

  async listOpenNear(lat: number, lng: number, radiusDeg = 0.002): Promise<Issue[]> {
    // Basic coordinate bounds check
    const minLat = lat - radiusDeg;
    const maxLat = lat + radiusDeg;
    const minLng = lng - radiusDeg;
    const maxLng = lng + radiusDeg;

    const { data } = await supabaseServer
      .from("issues")
      .select(FULL_SELECT)
      .neq("status", "resolved")
      .gte("lat", minLat)
      .lte("lat", maxLat)
      .gte("lng", minLng)
      .lte("lng", maxLng);

    return (data || []).map(mapIssue);
  },

  async findByImageHash(hash: string): Promise<Issue | undefined> {
    const { data } = await supabaseServer.from("issues").select(FULL_SELECT).eq("image_hash", hash).maybeSingle();
    return data ? mapIssue(data) : undefined;
  },

  async create(issue: Omit<Issue, "id" | "createdAt" | "updatedAt" | "confirmations">): Promise<Issue> {
    const id = uuid();
    const { data, error } = await supabaseServer.from("issues").insert({
      id,
      damage_class_id: issue.damageClassId,
      severity: issue.severity,
      status: issue.status,
      lat: issue.lat,
      lng: issue.lng,
      address: issue.address,
      jurisdiction_id: issue.jurisdictionId,
      authority_id: issue.authorityId || null,
      routed_to: issue.routedTo || null,
      is_simulated_routing: issue.isSimulatedRouting || false,
      reporter_id: issue.reporterId,
      image_url: issue.imageUrl,
      image_hash: issue.imageHash,
      ai_confidence: issue.aiConfidence,
      bounding_box: issue.boundingBox,
      priority_score: issue.priorityScore || 0,
      priority_band: issue.priorityBand,
      assigned_officer_id: issue.assignedOfficerId || null,
      sla_deadline: issue.slaDeadline || null,
    }).select().single();

    if (error) throw error;
    // Newly created issue has no confirmations or repair_evidences
    return mapIssue({ ...data, issue_confirmations: [], repair_evidences: null });
  },

  async addConfirmation(issueId: string, confirmation: Confirmation): Promise<Issue | undefined> {
    const issue = await this.findById(issueId);
    if (!issue) return undefined;
    
    if (issue.reporterId === confirmation.userId) return issue;
    if (issue.confirmations.some(c => c.userId === confirmation.userId)) return issue;

    await supabaseServer.from("issue_confirmations").insert({
      issue_id: issueId,
      user_id: confirmation.userId,
      created_at: confirmation.createdAt,
    });

    await supabaseServer.from("issues").update({ updated_at: new Date().toISOString() }).eq("id", issueId);
    return this.findById(issueId);
  },

  async update(id: string, patch: Partial<Issue>): Promise<Issue | undefined> {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.priorityScore !== undefined) updateData.priority_score = patch.priorityScore;
    if (patch.priorityBand !== undefined) updateData.priority_band = patch.priorityBand;
    if (patch.slaDeadline !== undefined) updateData.sla_deadline = patch.slaDeadline;
    if (patch.assignedOfficerId !== undefined) updateData.assigned_officer_id = patch.assignedOfficerId;
    if (patch.authorityId !== undefined) updateData.authority_id = patch.authorityId;
    if (patch.routedTo !== undefined) updateData.routed_to = patch.routedTo;
    if (patch.isSimulatedRouting !== undefined) updateData.is_simulated_routing = patch.isSimulatedRouting;

    // Handle repairEvidence patch specifically
    if (patch.repairEvidence !== undefined) {
      const ev = patch.repairEvidence;
      await supabaseServer.from("repair_evidences").upsert({
        issue_id: id,
        before_photo_url: ev.beforePhotoUrl || null,
        after_photo_url: ev.afterPhotoUrl || null,
        notes: ev.notes || null,
        officer_id: ev.officerId || null,
        completed_at: ev.completedAt || null,
      });
    }

    const { error } = await supabaseServer.from("issues").update(updateData).eq("id", id);
    if (error) return undefined;
    return this.findById(id);
  },

  async setStatus(id: string, status: IssueStatus): Promise<Issue | undefined> {
    return this.update(id, { status });
  },

  async listByReporter(userId: string): Promise<Issue[]> {
    const { data } = await supabaseServer.from("issues").select(FULL_SELECT).eq("reporter_id", userId);
    return (data || []).map(mapIssue);
  },

  async listByAuthority(authorityId: string): Promise<Issue[]> {
    const { data } = await supabaseServer.from("issues").select(FULL_SELECT).eq("authority_id", authorityId);
    return (data || []).map(mapIssue);
  },

  async listAssignedToOfficer(officerId: string): Promise<Issue[]> {
    const { data } = await supabaseServer.from("issues").select(FULL_SELECT).eq("assigned_officer_id", officerId);
    return (data || []).map(mapIssue);
  },
};
