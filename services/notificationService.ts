import { NotificationRepository } from "@/repositories/notificationRepository";
import { UserRepository } from "@/repositories/userRepository";

export const NotificationService = {
  async notify(userId: string, type: string, message: string, relatedIssueId?: string) {
    return NotificationRepository.create(userId, type, message, relatedIssueId);
  },

  /** Notifies every officer/authority_admin attached to an authority (e.g. critical-issue alerts). */
  async notifyAuthority(authorityId: string, type: string, message: string, relatedIssueId?: string) {
    const users = await UserRepository.list();
    const staff = users.filter((u) => u.authorityId === authorityId && (u.role === "officer" || u.role === "authority_admin"));
    await Promise.all(staff.map((u) => NotificationRepository.create(u.id, type, message, relatedIssueId)));
  },
};
