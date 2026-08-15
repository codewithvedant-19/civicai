import { supabaseServer } from "@/lib/supabase";
import type { User, Role } from "@/domain/types";
import { v4 as uuid } from "uuid";

function mapUser(data: any): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    role: data.role as Role,
    pointsBalance: data.points_balance,
    level: data.level,
    streakCount: data.streak_count,
    lastActivityDate: data.last_activity_date,
    authorityId: data.authority_id || undefined,
    createdAt: data.created_at,
  };
}

export const UserRepository = {
  async findById(id: string): Promise<User | undefined> {
    const { data } = await supabaseServer.from("users").select("*").eq("id", id).maybeSingle();
    return data ? mapUser(data) : undefined;
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const { data } = await supabaseServer.from("users").select("*").ilike("email", email).maybeSingle();
    return data ? mapUser(data) : undefined;
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    authorityId?: string;
  }): Promise<User> {
    const id = uuid();
    const { data, error } = await supabaseServer.from("users").insert({
      id,
      name: input.name,
      email: input.email,
      password_hash: input.passwordHash,
      role: input.role,
      authority_id: input.authorityId || null,
      points_balance: 0,
      level: 1,
      streak_count: 0,
    }).select().single();

    if (error) throw error;
    return mapUser(data);
  },

  async list(): Promise<User[]> {
    const { data } = await supabaseServer.from("users").select("*");
    return (data || []).map(mapUser);
  },

  async listByRole(role: Role): Promise<User[]> {
    const { data } = await supabaseServer.from("users").select("*").eq("role", role);
    return (data || []).map(mapUser);
  },

  async update(id: string, patch: Partial<User>): Promise<User | undefined> {
    const updateData: any = {};
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.passwordHash !== undefined) updateData.password_hash = patch.passwordHash;
    if (patch.role !== undefined) updateData.role = patch.role;
    if (patch.pointsBalance !== undefined) updateData.points_balance = patch.pointsBalance;
    if (patch.level !== undefined) updateData.level = patch.level;
    if (patch.streakCount !== undefined) updateData.streak_count = patch.streakCount;
    if (patch.lastActivityDate !== undefined) updateData.last_activity_date = patch.lastActivityDate;
    if (patch.authorityId !== undefined) updateData.authority_id = patch.authorityId;

    const { data, error } = await supabaseServer.from("users").update(updateData).eq("id", id).select().maybeSingle();
    if (error || !data) return undefined;
    return mapUser(data);
  },

  async adjustPoints(id: string, delta: number): Promise<User | undefined> {
    // Basic select then update
    const user = await this.findById(id);
    if (!user) return undefined;
    const newPoints = Math.max(0, user.pointsBalance + delta);
    return this.update(id, { pointsBalance: newPoints });
  },
};
