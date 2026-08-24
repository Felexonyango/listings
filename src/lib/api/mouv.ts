import { env } from "@/lib/env";
import type {
  FirebaseLoginResponse,
  ListingFilters,
  ListingsEnvelope,
  RecordDetailsEnvelope,
  UserDetailsEnvelope
} from "@/types/mouv";
import { normalizeArrayResponse, normalizeObjectResponse } from "./response-normalizer";

export class MouvApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "MouvApiError";
    this.status = status;
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function postJson<T>(
  url: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const payload = await readResponseBody(response);

  if (!response.ok) {
    const message =
      (typeof payload === "object" && payload
        ? String(
            (payload as Record<string, unknown>).error ??
              (payload as Record<string, unknown>).message ??
              (payload as Record<string, unknown>).Message ??
              response.statusText
          )
        : undefined) ?? (typeof payload === "string" ? payload : response.statusText) ?? "Request failed";

    throw new MouvApiError(message, response.status);
  }

  return payload as T;
}

function compactListingFilters(filters: Omit<ListingFilters, "searchTerm" | "skey"> = {}) {
  const body: Record<string, unknown> = {};

  if (filters.listingStatus?.trim()) {
    body.listingStatus = filters.listingStatus.trim();
  }

  if (filters.furnishStatus?.trim()) {
    body.furnishStatus = filters.furnishStatus.trim();
  }

  return body;
}

export async function loginWithFirebase(email: string, password: string): Promise<FirebaseLoginResponse> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.firebaseApiKey}`;

  return postJson<FirebaseLoginResponse>(url, { email, password, returnSecureToken: true });
}

export async function sendPasswordResetEmail(email: string): Promise<{ email: string; requestType: string }> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${env.firebaseApiKey}`;

  return postJson<{ email: string; requestType: string }>(url, {
    requestType: "PASSWORD_RESET",
    email
  });
}

export async function confirmPasswordReset(oobCode: string, newPassword: string): Promise<{ email: string; requestType: string }> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${env.firebaseApiKey}`;

  return postJson<{ email: string; requestType: string }>(url, {
    oobCode,
    newPassword
  });
}

export async function fetchUserDetails(skey: string): Promise<UserDetailsEnvelope> {
  const raw = await postJson<unknown>(`${env.coreBaseUrl}/getuserdetails`, {}, { SKEY: skey });
  return {
    user: normalizeObjectResponse(raw),
    raw
  };
}

export async function fetchListings(
  skey?: string,
  filters: Omit<ListingFilters, "searchTerm" | "skey"> = {}
): Promise<ListingsEnvelope> {
  const headers: Record<string, string> | undefined = skey ? { SKEY: skey } : undefined;
  const raw = await postJson<unknown>(`${env.coreBaseUrl}/listClientListings`, compactListingFilters(filters), headers);
  const items = normalizeArrayResponse(raw);
  return {
    items,
    count: items.length,
    raw
  };
}

export async function fetchListingDetails(skey: string | undefined, id: string): Promise<RecordDetailsEnvelope> {
  const headers: Record<string, string> | undefined = skey ? { SKEY: skey } : undefined;
  const raw = await postJson<unknown>(`${env.coreBaseUrl}/listClientListings`, { _id: id }, headers);
  return {
    record: normalizeObjectResponse(raw),
    raw
  };
}

export async function searchListings(
  skey: string | undefined,
  searchTerm: string,
  filters: Omit<ListingFilters, "searchTerm" | "skey"> = {},
  fieldsToSearchFor: Array<{ field: string }> = [
    { field: "description" },
    { field: "furnishStatus" },
    { field: "listingStatus" },
    { field: "name" }
  ]
): Promise<ListingsEnvelope> {
  const headers: Record<string, string> | undefined = skey ? { SKEY: skey } : undefined;
  const raw = await postJson<unknown>(
    `${env.coreBaseUrl}/listClientListings`,
    {
      fieldsToSearchFor,
      searchTerm,
      ...compactListingFilters(filters)
    },
    headers
  );

  const items = normalizeArrayResponse(raw);

  return {
    items,
    count: items.length,
    raw
  };
}
