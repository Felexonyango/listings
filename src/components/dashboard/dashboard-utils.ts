import { formatValue } from "@/lib/format";
import type { ListingFilters } from "@/types/mouv";

export type ViewKey = "overview" | "listings" | "profile" | "search" | "raw";
export type AuthView = "login" | "recover" | "reset";

export interface DashboardSummary {
  total: number;
  selected: string;
  id: string;
  listingStatus: string;
  furnishStatus: string;
  type: string;
  location: string;
  price: string;
}

export interface LoginFormState {
  email: string;
  password: string;
}

export interface ResetFormState {
  oobCode: string;
  newPassword: string;
}

export type DashboardListingFilters = Omit<ListingFilters, "skey">;
export type ListingHighlight = Array<[string, unknown]>;

export const LISTING_STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Any listing status", value: "" },
  { label: "Sale", value: "SALE" },
  { label: "Rent", value: "RENT" }
];

export const FURNISH_STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Any furnish status", value: "" },
  { label: "Furnished", value: "FURNISHED" },
  { label: "Unfurnished", value: "UNFURNISHED" }
];

export const LISTINGS_CARD_HEIGHT = 448;
export const LISTINGS_ROW_GAP = 16;
export const LISTINGS_CARDS_PER_ROW = 2;
export const LISTINGS_ROW_HEIGHT = LISTINGS_CARD_HEIGHT + LISTINGS_ROW_GAP;
export const LISTINGS_OVERSCAN = 4;
export const LISTINGS_MIN_WINDOW_ROWS = 25;

export const VIEW_ROUTES: Record<ViewKey, string> = {
  overview: "/",
  listings: "/listings",
  profile: "/profile",
  search: "/search",
  raw: "/raw"
};

export const NAV_ITEMS: Array<{ key: ViewKey; label: string; description: string }> = [
  { key: "overview", label: "Overview", description: "Workspace snapshot" },
  { key: "listings", label: "Listings", description: "Browse inventory" },
  { key: "profile", label: "Profile", description: "View user payload" },
  { key: "search", label: "Search", description: "Search the index" },
  { key: "raw", label: "Raw data", description: "Inspect payloads" }
];

export interface ListingWindow {
  rowCount: number;
  startRow: number;
  visibleRows: Array<Record<string, unknown>[]>;
  topSpacer: number;
  bottomSpacer: number;
  rangeLabel: string;
  itemCount: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getFirstStringValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getNestedValue(item: Record<string, unknown>, path: string[]) {
  let current: unknown = item;

  for (const segment of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function getNestedRecord(item: Record<string, unknown>, path: string[]) {
  const value = getNestedValue(item, path);
  return isRecord(value) ? value : null;
}

export function getPrimaryLabel(item: Record<string, unknown>) {
  const candidates = ["name", "title", "listingTitle", "propertyName", "subject"];
  for (const candidate of candidates) {
    const value = item[candidate];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "Untitled listing";
}

export function getPrimaryDescription(item: Record<string, unknown>) {
  const candidates = ["description", "summary", "shortDescription", "listingDescription"];
  for (const candidate of candidates) {
    const value = item[candidate];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "No description provided.";
}

export function getPrimaryId(item: Record<string, unknown>) {
  const candidates = ["_id", "id", "listingId"];
  for (const candidate of candidates) {
    const value = item[candidate];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

export function getImageUrl(item: Record<string, unknown>) {
  const candidates = ["image", "thumbnail", "coverImage", "imageUrl", "photo", "banner"];
  for (const candidate of candidates) {
    const value = item[candidate];
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  }

  const imageCollections = ["images", "photos", "gallery"];
  for (const collectionName of imageCollections) {
    const collection = item[collectionName];

    if (!Array.isArray(collection)) {
      continue;
    }

    for (const entry of collection) {
      if (typeof entry === "string" && entry.trim()) {
        return entry.trim();
      }

      if (isRecord(entry)) {
        const nestedUrl = getFirstStringValue(entry.url, entry.imageUrl, entry.src, entry.path);
        if (nestedUrl) {
          return nestedUrl;
        }
      }
    }
  }

  return "";
}

export function getListingStatus(item: Record<string, unknown>) {
  return getFirstStringValue(item.listingStatus).toUpperCase();
}

export function getFurnishStatus(item: Record<string, unknown>) {
  return getFirstStringValue(item.furnishStatus).toUpperCase();
}

export function getListingLocation(item: Record<string, unknown>) {
  const location = getNestedRecord(item, ["location"]);
  if (!location) {
    return "";
  }

  return getFirstStringValue(
    location.buildingName,
    location.streetAddress,
    location.cityTown,
    location.neighborhood,
    location.countyState,
    location.country
  );
}

export function getListingType(item: Record<string, unknown>) {
  const propertyTypeName = getNestedValue(item, ["propertyType", "name"]);
  const listingTypeProductType = getNestedValue(item, ["listingType", "productType"]);
  const listingTypeProduct = getNestedValue(item, ["listingType", "product"]);

  return getFirstStringValue(propertyTypeName, listingTypeProductType, listingTypeProduct, item.product);
}

export function getListingCurrency(item: Record<string, unknown>) {
  const currency = getNestedRecord(item, ["currency"]);
  if (!currency) {
    return "";
  }

  return getFirstStringValue(currency._id, currency.name, currency.prefix).toUpperCase();
}

export function getListingPriceLabel(item: Record<string, unknown>) {
  const pricing = getNestedRecord(item, ["pricing"]);
  const premium = getNestedRecord(item, ["premium"]);
  const currency = getListingCurrency(item);

  const value =
    pricing?.nightlyPrice ??
    pricing?.weekendPrice ??
    premium?.basicPremium ??
    item.price ??
    item.amount ??
    item.rent;

  if (value === undefined || value === null || value === "") {
    return "";
  }

  const period =
    pricing && pricing.nightlyPrice !== undefined
      ? " / night"
      : pricing && pricing.weekendPrice !== undefined
        ? " / weekend"
        : "";

  const price = formatValue(value);
  return currency ? `${currency} ${price}${period}` : `${price}${period}`;
}

export function buildListingHighlights(item: Record<string, unknown>): ListingHighlight {
  const highlights: ListingHighlight = [];
  const add = (label: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== "") {
      highlights.push([label, value]);
    }
  };

  const location = getListingLocation(item);
  const price = getListingPriceLabel(item);
  const type = getListingType(item);
  const currency = getListingCurrency(item);
  const listingStatus = getListingStatus(item);
  const furnishStatus = getFurnishStatus(item);
  const details = getNestedRecord(item, ["details"]);
  const images = Array.isArray(item.images) ? item.images.length : undefined;

  add("Listing ID", getPrimaryId(item));
  add("Name", getPrimaryLabel(item));
  add("Listing Status", listingStatus);
  add("Furnish Status", furnishStatus);
  add("Type", type);
  add("Location", location);
  add("Price", price);
  add("Bedrooms", details?.bedrooms);
  add("Bathrooms", details?.bathrooms);
  add("Half Bathrooms", details?.halfBathrooms);
  add("Currency", currency);
  add("Images", images);
  add("Check In", item.checkIn);
  add("Check Out", item.checkOut);
  add("Updated", item._utimestamp ?? item._timestamp);

  return highlights;
}

export function badgeTone(value: unknown) {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "SALE") return "border-blue-200 bg-blue-50 text-blue-700";
  if (normalized === "RENT") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (normalized === "FURNISHED") return "border-violet-200 bg-violet-50 text-violet-700";
  if (normalized === "UNFURNISHED") return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function viewFromPathname(pathname: string | null): ViewKey {
  switch (pathname) {
    case "/listings":
      return "listings";
    case "/profile":
      return "profile";
    case "/search":
      return "search";
    case "/raw":
      return "raw";
    default:
      return "overview";
  }
}

export function normalizeListingFilters(filters: DashboardListingFilters = {}) {
  return {
    listingStatus: filters.listingStatus?.trim() || "",
    furnishStatus: filters.furnishStatus?.trim() || "",
    searchTerm: filters.searchTerm?.trim() || ""
  };
}

export function createDashboardSummary(
  selected: Record<string, unknown> | null,
  total: number
): DashboardSummary {
  return {
    total,
    selected: selected ? getPrimaryLabel(selected) : "None",
    id: selected ? getPrimaryId(selected) || "-" : "-",
    listingStatus: selected ? getListingStatus(selected) || "-" : "-",
    furnishStatus: selected ? getFurnishStatus(selected) || "-" : "-",
    type: selected ? getListingType(selected) || "-" : "-",
    location: selected ? getListingLocation(selected) || "-" : "-",
    price: selected ? getListingPriceLabel(selected) || "-" : "-"
  };
}

export function buildListingWindow(
  listingItems: Record<string, unknown>[],
  listingScrollTop: number,
  listingViewportHeight: number
): ListingWindow {
  const rowCount = Math.ceil(listingItems.length / LISTINGS_CARDS_PER_ROW);
  const visibleRowCount = Math.max(1, Math.ceil(listingViewportHeight / LISTINGS_ROW_HEIGHT));
  const windowRowCount = Math.max(visibleRowCount + LISTINGS_OVERSCAN * 2, LISTINGS_MIN_WINDOW_ROWS);
  const startRow = Math.max(0, Math.floor(listingScrollTop / LISTINGS_ROW_HEIGHT) - LISTINGS_OVERSCAN);
  const endRow = Math.min(rowCount, startRow + windowRowCount);
  const visibleRows = Array.from({ length: endRow - startRow }, (_, rowOffset) => {
    const rowIndex = startRow + rowOffset;
    const startItemIndex = rowIndex * LISTINGS_CARDS_PER_ROW;
    return listingItems.slice(startItemIndex, startItemIndex + LISTINGS_CARDS_PER_ROW);
  });
  const topSpacer = startRow * LISTINGS_ROW_HEIGHT;
  const bottomSpacer = Math.max(0, (rowCount - endRow) * LISTINGS_ROW_HEIGHT);
  const startItemIndex = startRow * LISTINGS_CARDS_PER_ROW;
  const endItemIndex = Math.min(listingItems.length, endRow * LISTINGS_CARDS_PER_ROW);
  const rangeLabel = listingItems.length
    ? `Showing ${startItemIndex + 1}-${endItemIndex} of ${listingItems.length}`
    : "No listings loaded";

  return {
    rowCount,
    startRow,
    visibleRows,
    topSpacer,
    bottomSpacer,
    rangeLabel,
    itemCount: listingItems.length
  };
}
