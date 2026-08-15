import type { Role, User } from "@/domain/types";

// Every role check in the app routes through here, server-side, so it can
// never be bypassed by hiding a button in the UI (build prompt Section 4/11).
export const RbacService = {
  requireRole(user: User | null, allowed: Role[]): { ok: true } | { ok: false; status: number; message: string } {
    if (!user) return { ok: false, status: 401, message: "Not signed in." };
    if (!allowed.includes(user.role)) {
      return { ok: false, status: 403, message: "You don't have permission to do this." };
    }
    return { ok: true };
  },

  canManageIssue(user: User, authorityId?: string): boolean {
    if (user.role === "super_admin") return true;
    if (user.role === "authority_admin" || user.role === "officer") {
      return user.authorityId === authorityId;
    }
    return false;
  },
};
