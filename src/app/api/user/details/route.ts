import { fetchUserDetails, MouvApiError } from "@/lib/api/mouv";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const skey = typeof body.skey === "string" ? body.skey.trim() : "";

    if (!skey) {
      return NextResponse.json({ message: "SKEY is required." }, { status: 400 });
    }

    const result = await fetchUserDetails(skey);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof MouvApiError ? error.message : "Unable to fetch user details.";
    const status = error instanceof MouvApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
