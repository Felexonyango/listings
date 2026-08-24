import { MouvApiError, sendPasswordResetEmail } from "@/lib/api/mouv";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const result = await sendPasswordResetEmail(email);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof MouvApiError ? error.message : "Unable to send password reset email.";
    const status = error instanceof MouvApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
