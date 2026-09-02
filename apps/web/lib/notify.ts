// Shared notification helper (N1). Other modules call these to drop a Notification
// row for a user on key events (routed, team formed, proposal reviewed, partner joined…).
import { prisma } from "./prisma";
import type { NotificationType } from "@repo/types";

export function notifyUser(input: {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      link: input.link ?? null,
    },
  });
}

export function notifyUsers(
  userIds: string[],
  input: { type: NotificationType; message: string; link?: string }
) {
  if (userIds.length === 0) return Promise.resolve({ count: 0 });
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: input.type,
      message: input.message,
      link: input.link ?? null,
    })),
  });
}
