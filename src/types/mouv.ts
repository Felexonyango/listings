export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface FirebaseLoginResponse {
  idToken: string;
  refreshToken?: string;
  expiresIn?: string;
  localId?: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  [key: string]: unknown;
}

export interface LoginSession {
  idToken: string;
  email?: string;
  localId?: string;
  displayName?: string;
  photoUrl?: string;
  expiresIn?: string;
}

export interface ApiEnvelope<T> {
  data: T;
  raw: unknown;
}

export interface ListingsEnvelope {
  items: Record<string, unknown>[];
  count: number;
  raw: unknown;
}

export interface UserDetailsEnvelope {
  user: Record<string, unknown> | null;
  raw: unknown;
}

export interface RecordDetailsEnvelope {
  record: Record<string, unknown> | null;
  raw: unknown;
}

export interface ListingFilters {
  listingStatus?: string;
  furnishStatus?: string;
  searchTerm?: string;
  skey?: string;
}
