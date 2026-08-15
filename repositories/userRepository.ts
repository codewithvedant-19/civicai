import { getDb } from "@/lib/db";
import type { User, Role } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const UserRepository = {
  async findById(id: string): Promise<User | undefined> {
    const db = await getDb();
    return db.data.users.find((u) => u.id === id);
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const db = await getDb();
    return db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    authorityId?: string;
  }): Promise<User> {
    const db = await getDb();
    const user: User = {
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
    };
    db.data.users.push(user);
    await db.write();
    return user;
  },

  async list(): Promise<User[]> {
    const db = await getDb();
    return db.data.users;
  },

  async listByRole(role: Role): Promise<User[]> {
    const db = await getDb();
    return db.data.users.filter((u) => u.role === role);
  },

  async update(id: string, patch: Partial<User>): Promise<User | undefined> {
    const db = await getDb();
    const user = db.data.users.find((u) => u.id === id);
    if (!user) return undefined;
    Object.assign(user, patch);
    await db.write();
    return user;
  },

  async adjustPoints(id: string, delta: number): Promise<User | undefined> {
    const db = await getDb();
    const user = db.data.users.find((u) => u.id === id);
    if (!user) return undefined;
    user.pointsBalance = Math.max(0, user.pointsBalance + delta);
    await db.write();
    return user;
  },
};
