"use client";

import type { Dispatch, FormEvent, ReactNode, RefObject, SetStateAction, UIEvent } from "react";
import type { ListingsEnvelope } from "@/types/mouv";
import { formatDate, formatValue, prettifyKey, truncate } from "@/lib/format";
import {
  badgeTone,
  buildListingHighlights,
  FURNISH_STATUS_OPTIONS,
  getImageUrl,
  getFurnishStatus,
  getListingLocation,
  getListingPriceLabel,
  getListingStatus,
  getListingType,
  getPrimaryDescription,
  getPrimaryId,
  getPrimaryLabel,
  LISTING_STATUS_OPTIONS,
  NAV_ITEMS,
  type DashboardSummary,
  type ListingWindow,
  type ViewKey,
} from "./dashboard-utils";

function SectionHeader({
  title,
  copy,
  action
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{copy}</p>
      </div>
      {action}
    </div>
  );
}

function ListingFiltersForm({
  searchTerm,
  listingStatus,
  furnishStatus,
  onSearchTermChange,
  onListingStatusChange,
  onFurnishStatusChange,
  onSubmit,
  submitLabel,
  busyLabel,
  disabled
}: {
  searchTerm: string;
  listingStatus: string;
  furnishStatus: string;
  onSearchTermChange: (value: string) => void;
  onListingStatusChange: (value: string) => void;
  onFurnishStatusChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  busyLabel: string;
  disabled: boolean;
}) {
  return (
    <form className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px_auto]" onSubmit={onSubmit}>
      <input
        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        placeholder="Search listings by description or name"
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
      />
      <select
        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        value={listingStatus}
        onChange={(event) => onListingStatusChange(event.target.value)}
      >
        {LISTING_STATUS_OPTIONS.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        value={furnishStatus}
        onChange={(event) => onFurnishStatusChange(event.target.value)}
      >
        {FURNISH_STATUS_OPTIONS.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        className="h-12 rounded-xl bg-blue-600 px-4 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={disabled}
      >
        {disabled ? busyLabel : submitLabel}
      </button>
    </form>
  );
}

export function PublicListingsPage({
  error,
  children
}: {
  error: string | null;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1480px] gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function PublicRawPage({
  error,
  children,
  onBackToListings,
  onSignIn
}: {
  error: string | null;
  children: ReactNode;
  onBackToListings: () => void;
  onSignIn: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1480px] gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs tracking-[0.16em] text-slate-600">
              Public access
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Listing details</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Opened from the public listings view. You can inspect the selected record without signing in.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              type="button"
              onClick={onBackToListings}
            >
              Back to listings
            </button>
            <button
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              type="button"
              onClick={onSignIn}
            >
              Sign in
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}

export function OverviewSection({
  summary,
  searchTerm,
  loadingData,
  activeView,
  listings,
  onRefresh,
  onNavigate,
  onSelectListing
}: {
  summary: DashboardSummary;
  searchTerm: string;
  loadingData: boolean;
  activeView: ViewKey;
  listings: ListingsEnvelope | null;
  onRefresh: () => void;
  onNavigate: (view: ViewKey) => void;
  onSelectListing: (item: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Listings returned</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{summary.total}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">Based on the current filter or search result.</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Selected listing</div>
          <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{summary.selected}</div>
          <div className="mt-2 text-sm text-slate-600">{summary.id}</div>
          <div className="mt-1 text-sm text-slate-500">Listing: {summary.listingStatus}</div>
          <div className="mt-1 text-sm text-slate-500">Furnish: {summary.furnishStatus}</div>
          <div className="mt-1 text-sm text-slate-500">{summary.type}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Price</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{summary.price}</div>
          <div className="mt-2 text-sm text-slate-600">{summary.location}</div>
          <div className="mt-1 text-sm text-slate-500">{searchTerm ? `Search: ${searchTerm}` : "No search applied"}</div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Quick actions"
          copy="Move between the main areas using the navigation on the left."
          action={
            <button
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={onRefresh}
              disabled={loadingData}
            >
              {loadingData ? "Refreshing..." : "Refresh"}
            </button>
          }
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                activeView === item.key ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <span className="block text-base font-medium text-slate-900">{item.label}</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">{item.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Recent listings"
          copy="Select a listing to inspect the full record."
          action={
            <button
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              type="button"
              onClick={() => onNavigate("listings")}
            >
              Open listings
            </button>
          }
        />
        {listings?.items.length ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {listings.items.slice(0, 4).map((item, index) => {
              const id = getPrimaryId(item) || String(index);
              const imageUrl = getImageUrl(item);
              const listingStatusValue = getListingStatus(item);
              const furnishStatusValue = getFurnishStatus(item);
              const locationLabel = getListingLocation(item);
              const typeLabel = getListingType(item);
              const priceLabel = getListingPriceLabel(item);

              return (
                <article key={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="relative min-h-48 bg-slate-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={getPrimaryLabel(item)} className="absolute inset-0 h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-medium text-slate-900">{getPrimaryLabel(item)}</h3>
                      <div className="flex flex-wrap justify-end gap-2">
                        {listingStatusValue ? (
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeTone(listingStatusValue)}`}>
                            {formatValue(listingStatusValue)}
                          </span>
                        ) : null}
                        {furnishStatusValue ? (
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeTone(furnishStatusValue)}`}>
                            {formatValue(furnishStatusValue)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{truncate(getPrimaryDescription(item), 140)}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                        {id || "No id"}
                      </span>
                      {locationLabel ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                          {truncate(locationLabel, 36)}
                        </span>
                      ) : null}
                      {typeLabel ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                          {truncate(typeLabel, 24)}
                        </span>
                      ) : null}
                      {priceLabel ? (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                          {priceLabel}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">
                        {item.createdAt ? formatDate(item.createdAt) : "No created date"}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectListing(item)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
            No records loaded yet.
          </div>
        )}
      </section>
    </div>
  );
}

export function ListingsSection({
  loadingData,
  searchTerm,
  listingStatus,
  furnishStatus,
  onSearchTermChange,
  onListingStatusChange,
  onFurnishStatusChange,
  onSubmit,
  onRefresh,
  listingWindow,
  listingViewportRef,
  onListingScroll,
  onSelectListing
}: {
  loadingData: boolean;
  searchTerm: string;
  listingStatus: string;
  furnishStatus: string;
  onSearchTermChange: Dispatch<SetStateAction<string>>;
  onListingStatusChange: Dispatch<SetStateAction<string>>;
  onFurnishStatusChange: Dispatch<SetStateAction<string>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void;
  listingWindow: ListingWindow;
  listingViewportRef: RefObject<HTMLDivElement>;
  onListingScroll: (event: UIEvent<HTMLDivElement>) => void;
  onSelectListing: (item: Record<string, unknown>) => void;
}) {
  const { visibleRows, topSpacer, bottomSpacer, rangeLabel } = listingWindow;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader
        title="Listings"
        copy="Search, filter, and open individual listings."
        action={
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={onRefresh}
            disabled={loadingData}
          >
            {loadingData ? "Refreshing..." : "Refresh"}
          </button>
        }
      />

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <ListingFiltersForm
          searchTerm={searchTerm}
          listingStatus={listingStatus}
          furnishStatus={furnishStatus}
          onSearchTermChange={onSearchTermChange}
          onListingStatusChange={onListingStatusChange}
          onFurnishStatusChange={onFurnishStatusChange}
          onSubmit={onSubmit}
          submitLabel="Apply filters"
          busyLabel="Loading..."
          disabled={loadingData}
        />
      </div>

      {visibleRows.length ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="text-sm text-slate-600">{rangeLabel}</div>
            <div className="text-sm text-slate-500">{listingWindow.itemCount} cards</div>
          </div>
          <div ref={listingViewportRef} onScroll={onListingScroll} className="h-[72vh] overflow-auto">
            <div className="px-4 py-4">
              {topSpacer > 0 ? <div aria-hidden="true" style={{ height: topSpacer }} /> : null}
              <div className="flex flex-col gap-4">
                {visibleRows.map((rowItems, rowOffset) => {
                  const rowIndex = listingWindow.startRow + rowOffset;

                  return (
                    <div key={`${rowOffset}`} className="flex gap-4">
                      {rowItems.map((item, itemOffset) => {
                        const id = getPrimaryId(item) || String(rowIndex * 2 + itemOffset);
                        const imageUrl = getImageUrl(item);
                        const listingStatusValue = getListingStatus(item);
                        const furnishStatusValue = getFurnishStatus(item);
                        const locationLabel = getListingLocation(item);
                        const typeLabel = getListingType(item);
                        const priceLabel = getListingPriceLabel(item);

                        return (
                          <article
                            key={id}
                            className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            style={{ height: 448 }}
                          >
                            <div className="relative h-48 flex-none bg-slate-100">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={getPrimaryLabel(item)}
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="flex min-h-0 flex-1 flex-col space-y-3 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-base font-medium text-slate-900">{getPrimaryLabel(item)}</h3>
                                <div className="flex flex-wrap justify-end gap-2">
                                  {listingStatusValue ? (
                                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeTone(listingStatusValue)}`}>
                                      {formatValue(listingStatusValue)}
                                    </span>
                                  ) : null}
                                  {furnishStatusValue ? (
                                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeTone(furnishStatusValue)}`}>
                                      {formatValue(furnishStatusValue)}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <p
                                className="text-sm leading-6 text-slate-600"
                                style={{
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 3,
                                  overflow: "hidden"
                                }}
                              >
                                {getPrimaryDescription(item)}
                              </p>
                              <div className="flex flex-wrap gap-2 overflow-hidden">
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                                  {id || "No id"}
                                </span>
                                {locationLabel ? (
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                                    {truncate(locationLabel, 42)}
                                  </span>
                                ) : null}
                                {typeLabel ? (
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                                    {truncate(typeLabel, 24)}
                                  </span>
                                ) : null}
                                {priceLabel ? (
                                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                                    {priceLabel}
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-auto flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                  {item.createdAt ? formatDate(item.createdAt) : "No created date"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onSelectListing(item)}
                                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                                >
                                  View details
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                      {rowItems.length === 1 ? <div aria-hidden="true" className="flex-1 min-w-0" /> : null}
                    </div>
                  );
                })}
              </div>
              {bottomSpacer > 0 ? <div aria-hidden="true" style={{ height: bottomSpacer }} /> : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
          No results yet. Try a different filter or search term.
        </div>
      )}
    </section>
  );
}

export function SearchSection({
  loadingData,
  sessionActive,
  searchTerm,
  listingStatus,
  furnishStatus,
  onSearchTermChange,
  onListingStatusChange,
  onFurnishStatusChange,
  onSubmit
}: {
  loadingData: boolean;
  sessionActive: boolean;
  searchTerm: string;
  listingStatus: string;
  furnishStatus: string;
  onSearchTermChange: (value: string) => void;
  onListingStatusChange: (value: string) => void;
  onFurnishStatusChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader title="Search" copy="Search is wired to the listing index through the local API route." />
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <ListingFiltersForm
          searchTerm={searchTerm}
          listingStatus={listingStatus}
          furnishStatus={furnishStatus}
          onSearchTermChange={onSearchTermChange}
          onListingStatusChange={onListingStatusChange}
          onFurnishStatusChange={onFurnishStatusChange}
          onSubmit={onSubmit}
          submitLabel="Search"
          busyLabel="Searching..."
          disabled={!sessionActive || loadingData}
        />
      </div>
    </section>
  );
}

export function RawSection({
  selected,
  rawPreview
}: {
  selected: Record<string, unknown> | null;
  rawPreview: string;
}) {
  const selectedHighlights = selected ? buildListingHighlights(selected) : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader title="Raw data" copy="Useful for checking the payload returned by the upstream API." />
      {selected ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Selected listing</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{getPrimaryLabel(selected)}</div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{getPrimaryDescription(selected)}</p>

          {selectedHighlights.length ? (
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {selectedHighlights.slice(0, 10).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{prettifyKey(key)}</div>
                  <div className="mt-2 break-words text-sm leading-6 text-slate-900">{formatValue(value)}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {rawPreview ? (
        <pre className="mt-4 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
          {rawPreview}
        </pre>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
          Nothing selected yet.
        </div>
      )}
    </section>
  );
}
