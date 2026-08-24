import { MouvApiError, confirmPasswordReset } from "@/lib/api/mouv";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const oobCode = typeof body.oobCode === "string" ? body.oobCode.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!oobCode || !newPassword) {
      return NextResponse.json({ message: "Reset code and new password are required." }, { status: 400 });
    }

    const result = await confirmPasswordReset(oobCode, newPassword);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof MouvApiError ? error.message : "Unable to reset password.";
    const status = error instanceof MouvApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
