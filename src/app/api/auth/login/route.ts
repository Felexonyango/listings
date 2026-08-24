import { loginWithFirebase, MouvApiError } from "@/lib/api/mouv";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const result = await loginWithFirebase(email, password);

    return NextResponse.json({
      session: {
        idToken: result.idToken,
        email: result.email,
        localId: result.localId,
        displayName: result.displayName,
        photoUrl: result.photoUrl,
        expiresIn: result.expiresIn
      },
      raw: result
    });
  } catch (error) {
    const message = error instanceof MouvApiError ? error.message : "Unable to authenticate.";
    const status = error instanceof MouvApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
