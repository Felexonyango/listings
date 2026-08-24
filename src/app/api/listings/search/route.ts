import { searchListings, MouvApiError } from "@/lib/api/mouv";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const skey = typeof body.skey === "string" ? body.skey.trim() : "";
    const searchTerm = typeof body.searchTerm === "string" ? body.searchTerm.trim() : "";
    const listingStatus = typeof body.listingStatus === "string" ? body.listingStatus.trim() : "";
    const furnishStatus = typeof body.furnishStatus === "string" ? body.furnishStatus.trim() : "";

    if (!searchTerm) {
      return NextResponse.json({ message: "Search term is required." }, { status: 400 });
    }

    const result = await searchListings(skey, searchTerm, { listingStatus, furnishStatus });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof MouvApiError ? error.message : "Unable to search listings.";
    const status = error instanceof MouvApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
