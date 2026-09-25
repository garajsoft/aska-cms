import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

/**
 * Public self-registration. Creates the user as a customer (the Users
 * collection's beforeChange role guard also forces this for non-admin
 * requesters), then establishes a session the same way the REST login
 * endpoint does: payload.login() mints the token, we stamp it into the
 * payload-token cookie.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  const p = await getPayload({ config });

  let user;
  try {
    user = await p.create({
      collection: "users",
      data: { email, password, roles: "customer" },
    });
  } catch {
    return NextResponse.json({ message: "Could not create account" }, { status: 400 });
  }

  try {
    const login = await p.login({
      collection: "users",
      data: { email, password },
    });
    if (!login.token) throw new Error("login returned no token");
    const res = NextResponse.json({ user: { id: user.id, email: user.email } });
    res.cookies.set("payload-token", login.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: login.exp ? new Date(login.exp * 1000) : undefined,
    });
    return res;
  } catch {
    // Account created but session failed — the user can still sign in manually.
    return NextResponse.json({ user: { id: user.id, email: user.email } });
  }
}
