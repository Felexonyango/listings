import { fetchListings, MouvApiError } from "@/lib/api/mouv";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const skey = typeof body.skey === "string" ? body.skey.trim() : "";
    const listingStatus = typeof body.listingStatus === "string" ? body.listingStatus.trim() : "";
    const furnishStatus = typeof body.furnishStatus === "string" ? body.furnishStatus.trim() : "";

    const result = await fetchListings(skey, { listingStatus, furnishStatus });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof MouvApiError ? error.message : "Unable to fetch listings.";
    const status = error instanceof MouvApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
