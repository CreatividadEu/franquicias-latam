import { NextResponse } from "next/server";
import { TW_TOKEN_COOKIE, tottoWayCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(TW_TOKEN_COOKIE, "", tottoWayCookieOptions(0));
  return response;
}
