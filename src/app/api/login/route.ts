import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "arda-proto-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const secret = process.env.SHARED_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured: no SHARED_SECRET set" },
      { status: 500 }
    );
  }

  if (body.password === secret) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
