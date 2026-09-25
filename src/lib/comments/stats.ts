import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";

export type CommentStats = {
  pending: number;
  approved: number;
  spam: number;
  total: number;
};

/** Counts comments per moderation status. Shared by the API route and the
 * dashboard widget, so both stay consistent. */
export async function getCommentStats(): Promise<CommentStats> {
  const payload = await getPayload({ config });
  const [pending, approved, spam] = await Promise.all([
    payload.count({ collection: "comments", where: { status: { equals: "pending" } } }),
    payload.count({ collection: "comments", where: { status: { equals: "approved" } } }),
    payload.count({ collection: "comments", where: { status: { equals: "spam" } } }),
  ]);
  return {
    pending: pending.totalDocs,
    approved: approved.totalDocs,
    spam: spam.totalDocs,
    total: pending.totalDocs + approved.totalDocs + spam.totalDocs,
  };
}
