import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Signed cookie proving a visitor entered the correct post password. */
export function postPasswordCookieName(postId: string | number): string {
  return `aska_postpw_${postId}`;
}

export function signPostPassword(postId: string | number): string {
  return createHmac("sha256", process.env.PAYLOAD_SECRET || "")
    .update(String(postId))
    .digest("hex");
}

export function isValidPostPasswordCookie(
  postId: string | number,
  value: string | undefined
): boolean {
  if (!value) return false;
  const expected = signPostPassword(postId);
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
