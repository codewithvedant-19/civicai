import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import type { User, Role } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const UserRepository = {
  async findById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user as User | undefined;
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(ilike(users.email, email));
    return user as User | undefined;
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    authorityId?: string;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: uuid(),
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        pointsBalance: 0,
        level: 1,
        streakCount: 0,
        lastActivityDate: null,
        authorityId: input.authorityId,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return user as User;
  },

  async list(): Promise<User[]> {
    return (await db.select().from(users)) as User[];
  },

  async listByRole(role: Role): Promise<User[]> {
    return (await db.select().from(users).where(eq(users.role, role))) as User[];
  },

  async update(id: string, patch: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(patch).where(eq(users.id, id)).returning();
    return user as User | undefined;
  },

  async adjustPoints(id: string, delta: number): Promise<User | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const [user] = await db
      .update(users)
      .set({ pointsBalance: Math.max(0, existing.pointsBalance + delta) })
      .where(eq(users.id, id))
      .returning();
    return user as User | undefined;
  },
};
