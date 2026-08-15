import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { PublicUser, Role, User } from "@/domain/types";
import { UserRepository } from "@/repositories/userRepository";

const SESSION_COOKIE = "civicroad_session";

// NOTE (prototype scope): sessions are a base64 JSON payload in an httpOnly
// cookie rather than a signed JWT. Fine for a demo; a production build would
// swap this for signed/encrypted sessions without touching callers, since
// everything else in the app only calls getCurrentUser()/requireRole().
export const AuthService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  toPublicUser(user: User): PublicUser {
    const { passwordHash, createdAt, lastActivityDate, ...rest } = user;
    return rest;
  },

  async createSession(userId: string) {
    const payload = Buffer.from(JSON.stringify({ userId })).toString("base64");
    cookies().set(SESSION_COOKIE, payload, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  },

  async clearSession() {
    cookies().delete(SESSION_COOKIE);
  },

  async getCurrentUser(): Promise<User | null> {
    const raw = cookies().get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    try {
      const { userId } = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
      const user = await UserRepository.findById(userId);
      return user ?? null;
    } catch {
      return null;
    }
  },

  redirectPathForRole(role: Role): string {
    switch (role) {
      case "citizen":
        return "/dashboard";
      case "officer":
      case "authority_admin":
        return "/authority";
      case "super_admin":
        return "/admin";
    }
  },
};
