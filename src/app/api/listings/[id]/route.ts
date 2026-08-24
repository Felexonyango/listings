import { fetchListingDetails, MouvApiError } from "@/lib/api/mouv";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const skey = typeof body.skey === "string" ? body.skey.trim() : "";
    const id = typeof body.id === "string" ? body.id.trim() : params.id;

    if (!id) {
      return NextResponse.json({ message: "Listing id is required." }, { status: 400 });
    }

    const result = await fetchListingDetails(skey, id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof MouvApiError ? error.message : "Unable to fetch listing details.";
    const status = error instanceof MouvApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
