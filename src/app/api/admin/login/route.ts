import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123456";

  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured." }, { status: 500 });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  await setAdminSession(username);
  return NextResponse.redirect(new URL("/admin", request.url));
}
