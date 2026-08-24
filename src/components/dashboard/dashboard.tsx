"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, UIEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  FirebaseLoginResponse,
  ListingsEnvelope,
  LoginSession,
  RecordDetailsEnvelope,
  UserDetailsEnvelope
} from "@/types/mouv";
import {
  ListingsSection,
  OverviewSection,
  PublicListingsPage,
  PublicRawPage,
  RawSection,
  SearchSection
} from "./dashboard-sections";
import { AuthScreen } from "@/components/session/auth-screen";
import { ProfileSection } from "@/components/profiles/profile-section";
import {
  buildListingWindow,
  createDashboardSummary,
  getPrimaryId,
  NAV_ITEMS,
  type AuthView,
  type DashboardListingFilters,
  type LoginFormState,
  type ResetFormState,
  type ViewKey,
  VIEW_ROUTES,
  normalizeListingFilters,
  viewFromPathname
} from "./dashboard-utils";

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(payload?.message || "Request failed.");
  }

  return payload;
}

export function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<LoginSession | null>(null);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [loginForm, setLoginForm] = useState<LoginFormState>({ email: "", password: "" });
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetForm, setResetForm] = useState<ResetFormState>({ oobCode: "", newPassword: "" });
  const [listingStatus, setListingStatus] = useState("");
  const [furnishStatus, setFurnishStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userDetails, setUserDetails] = useState<UserDetailsEnvelope | null>(null);
  const [listings, setListings] = useState<ListingsEnvelope | null>(null);
  const [listingScrollTop, setListingScrollTop] = useState(0);
  const [listingViewportHeight, setListingViewportHeight] = useState(0);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeView = useMemo(() => viewFromPathname(pathname), [pathname]);
  const publicListingsLoaded = useRef(false);
  const listingViewportRef = useRef<HTMLDivElement>(null);

  const listingItems = useMemo(() => listings?.items ?? [], [listings?.items]);
  const summary = useMemo(() => createDashboardSummary(selected, listings?.count ?? 0), [listings?.count, selected]);
  const rawPreview = useMemo(() => {
    if (selected) {
      return JSON.stringify(selected, null, 2);
    }

    if (listings?.raw) {
      return JSON.stringify(listings.raw, null, 2);
    }

    return "";
  }, [listings?.raw, selected]);
  const listingWindow = useMemo(
    () => buildListingWindow(listingItems, listingScrollTop, listingViewportHeight),
    [listingItems, listingScrollTop, listingViewportHeight]
  );

  const loadUserAndListings = useCallback(async (skey?: string, filters: DashboardListingFilters = {}) => {
    const nextFilters = normalizeListingFilters(filters);
    setLoadingData(true);
    setError(null);

    try {
      const listingsResult = nextFilters.searchTerm
        ? await postJson<ListingsEnvelope>("/api/listings/search", {
            skey,
            searchTerm: nextFilters.searchTerm,
            listingStatus: nextFilters.listingStatus,
            furnishStatus: nextFilters.furnishStatus
          })
        : await postJson<ListingsEnvelope>("/api/listings", {
            skey,
            listingStatus: nextFilters.listingStatus,
            furnishStatus: nextFilters.furnishStatus
          });

      if (skey) {
        const userResult = await postJson<UserDetailsEnvelope>("/api/user/details", { skey });
        setUserDetails(userResult);
      } else {
        setUserDetails(null);
      }

      setListings(listingsResult);
      setSelected(listingsResult.items[0] ?? null);
      setListingScrollTop(0);
      if (listingViewportRef.current) {
        listingViewportRef.current.scrollTop = 0;
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong.");
      setUserDetails(null);
      setListings(null);
      setSelected(null);
      setListingScrollTop(0);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const navigateTo = useCallback(
    (view: ViewKey) => {
      router.push(VIEW_ROUTES[view]);
    },
    [router]
  );

  const resetWorkspace = useCallback(() => {
    setSession(null);
    setUserDetails(null);
    setListings(null);
    setSelected(null);
    setListingScrollTop(0);
    setListingViewportHeight(0);
    setSearchTerm("");
    setListingStatus("");
    setFurnishStatus("");
    router.push(VIEW_ROUTES.overview);
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingLogin(true);
    setError(null);

    try {
      const payload = await postJson<{ session: LoginSession; raw: FirebaseLoginResponse }>("/api/auth/login", {
        email: loginForm.email.trim(),
        password: loginForm.password
      });

      setSession(payload.session);
      await loadUserAndListings(payload.session.idToken);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to authenticate.");
      setSession(null);
      setUserDetails(null);
      setListings(null);
      setSelected(null);
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handleRequestRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingLogin(true);
    setError(null);

    try {
      await postJson<{ email: string; requestType: string }>("/api/auth/recovery/request", {
        email: recoveryEmail.trim()
      });
      setError("Password reset email sent. Check the inbox for the reset link.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send password reset email.");
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingLogin(true);
    setError(null);

    try {
      await postJson<{ email: string; requestType: string }>("/api/auth/recovery/reset", {
        oobCode: resetForm.oobCode.trim(),
        newPassword: resetForm.newPassword
      });

      setError("Password updated. You can sign in with the new password.");
      setAuthView("login");
      setResetForm({ oobCode: "", newPassword: "" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reset password.");
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handleRefresh() {
    await loadUserAndListings(session?.idToken, {
      listingStatus,
      furnishStatus,
      searchTerm
    });
  }

  async function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await loadUserAndListings(session?.idToken, {
      listingStatus,
      furnishStatus,
      searchTerm
    });
  }

  async function handleSelectListing(item: Record<string, unknown>) {
    const id = getPrimaryId(item);
    if (!id) {
      setSelected(item);
      navigateTo("raw");
      return;
    }

    setLoadingData(true);
    setError(null);

    try {
      const result = await postJson<RecordDetailsEnvelope>(`/api/listings/${id}`, {
        skey: session?.idToken,
        id
      });

      setSelected(result.record ?? item);
      navigateTo("raw");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to open listing details.");
      setSelected(item);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (session || activeView !== "listings") {
      publicListingsLoaded.current = false;
      return;
    }

    if (publicListingsLoaded.current || listings || loadingData) {
      return;
    }

    publicListingsLoaded.current = true;
    void loadUserAndListings(undefined);
  }, [activeView, loadUserAndListings, listings, loadingData, session]);

  useEffect(() => {
    if (activeView !== "listings") {
      setListingScrollTop(0);
      setListingViewportHeight(0);
      return;
    }

    const element = listingViewportRef.current;
    if (!element) {
      return;
    }

    const updateViewportHeight = () => {
      setListingViewportHeight(element.clientHeight);
    };

    updateViewportHeight();

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateViewportHeight) : null;
    observer?.observe(element);
    window.addEventListener("resize", updateViewportHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, [activeView, listingItems.length]);

  const handleListingScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setListingScrollTop(event.currentTarget.scrollTop);
  }, []);

  if (!session && activeView === "listings") {
    return (
      <PublicListingsPage error={error}>
        <ListingsSection
          loadingData={loadingData}
          searchTerm={searchTerm}
          listingStatus={listingStatus}
          furnishStatus={furnishStatus}
          onSearchTermChange={setSearchTerm}
          onListingStatusChange={setListingStatus}
          onFurnishStatusChange={setFurnishStatus}
          onSubmit={handleApplyFilters}
          onRefresh={handleRefresh}
          listingWindow={listingWindow}
          listingViewportRef={listingViewportRef}
          onListingScroll={handleListingScroll}
          onSelectListing={handleSelectListing}
        />
      </PublicListingsPage>
    );
  }

  if (!session && activeView === "raw") {
    return (
      <PublicRawPage error={error} onBackToListings={() => navigateTo("listings")} onSignIn={() => navigateTo("overview")}>
        <RawSection selected={selected} rawPreview={rawPreview} />
      </PublicRawPage>
    );
  }

  if (!session) {
    return (
      <AuthScreen
        authView={authView}
        loadingLogin={loadingLogin}
        error={error}
        loginForm={loginForm}
        recoveryEmail={recoveryEmail}
        resetForm={resetForm}
        onAuthViewChange={setAuthView}
        setLoginForm={setLoginForm}
        setRecoveryEmail={setRecoveryEmail}
        setResetForm={setResetForm}
        onLogin={handleLogin}
        onRequestRecovery={handleRequestRecovery}
        onPasswordReset={handlePasswordReset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1480px] gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="grid content-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white font-semibold tracking-[0.18em] text-slate-700">
              MA
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-slate-900">Mouv Africa Dashboard</div>
              <div className="text-sm text-slate-500">{session?.email ?? "Signed in"}</div>
            </div>
          </div>

          <nav className="grid gap-2" aria-label="Workspace">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                  activeView === item.key ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
                onClick={() => navigateTo(item.key)}
              >
                <span className="block text-base font-medium text-slate-900">{item.label}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{item.description}</span>
              </button>
            ))}
          </nav>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Session</div>
            <div className="mt-2 text-sm font-medium text-slate-900">{session?.email ?? "Authenticated"}</div>
            <div className="mt-1 text-sm text-slate-500">{listings?.count ?? 0} records loaded</div>
          </div>
        </aside>

        <main className="grid min-w-0 gap-4">
          <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs tracking-[0.16em] text-slate-600">
                Assessment workspace
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Open sections from the sidebar.
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                type="button"
                onClick={handleRefresh}
                disabled={loadingData}
              >
                {loadingData ? "Refreshing..." : "Refresh"}
              </button>
              <button
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                type="button"
                onClick={resetWorkspace}
              >
                Sign out
              </button>
            </div>
          </header>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</div>
          ) : null}

          {activeView === "overview" ? (
            <OverviewSection
              summary={summary}
              searchTerm={searchTerm}
              loadingData={loadingData}
              activeView={activeView}
              listings={listings}
              onRefresh={handleRefresh}
              onNavigate={navigateTo}
              onSelectListing={handleSelectListing}
            />
          ) : null}

          {activeView === "listings" ? (
            <ListingsSection
              loadingData={loadingData}
              searchTerm={searchTerm}
              listingStatus={listingStatus}
              furnishStatus={furnishStatus}
              onSearchTermChange={setSearchTerm}
              onListingStatusChange={setListingStatus}
              onFurnishStatusChange={setFurnishStatus}
              onSubmit={handleApplyFilters}
              onRefresh={handleRefresh}
              listingWindow={listingWindow}
              listingViewportRef={listingViewportRef}
              onListingScroll={handleListingScroll}
              onSelectListing={handleSelectListing}
            />
          ) : null}

          {activeView === "profile" ? <ProfileSection userDetails={userDetails} /> : null}

          {activeView === "search" ? (
            <SearchSection
              loadingData={loadingData}
              sessionActive={Boolean(session)}
              searchTerm={searchTerm}
              listingStatus={listingStatus}
              furnishStatus={furnishStatus}
              onSearchTermChange={setSearchTerm}
              onListingStatusChange={setListingStatus}
              onFurnishStatusChange={setFurnishStatus}
              onSubmit={handleApplyFilters}
            />
          ) : null}

          {activeView === "raw" ? <RawSection selected={selected} rawPreview={rawPreview} /> : null}
        </main>
      </div>
    </div>
  );
}
