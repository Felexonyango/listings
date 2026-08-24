"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { AuthView, LoginFormState, ResetFormState } from "@/components/dashboard/dashboard-utils";

export function AuthScreen({
  authView,
  loadingLogin,
  error,
  loginForm,
  recoveryEmail,
  resetForm,
  onAuthViewChange,
  setLoginForm,
  setRecoveryEmail,
  setResetForm,
  onLogin,
  onRequestRecovery,
  onPasswordReset
}: {
  authView: AuthView;
  loadingLogin: boolean;
  error: string | null;
  loginForm: LoginFormState;
  recoveryEmail: string;
  resetForm: ResetFormState;
  onAuthViewChange: Dispatch<SetStateAction<AuthView>>;
  setLoginForm: Dispatch<SetStateAction<LoginFormState>>;
  setRecoveryEmail: Dispatch<SetStateAction<string>>;
  setResetForm: Dispatch<SetStateAction<ResetFormState>>;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onRequestRecovery: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordReset: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 font-semibold tracking-[0.18em] text-slate-700">
              MA
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-slate-900">Mouv Africa</div>
              <div className="text-sm text-slate-500">Assessment workspace</div>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Sign in to continue.</h1>
            <p className="mx-auto max-w-sm text-sm leading-7 text-slate-600">
              {/* Use your Firebase credentials to open the dashboard or recover access if you forgot your password. */}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                authView === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => onAuthViewChange("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                authView === "recover" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => onAuthViewChange("recover")}
            >
              Recover
            </button>
            <button
              type="button"
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                authView === "reset" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => onAuthViewChange("reset")}
            >
              Reset
            </button>
          </div>

          {authView === "login" ? (
            <form className="mt-6 grid gap-4" onSubmit={onLogin}>
              <label className="grid gap-2">
                <span className="text-sm text-slate-600">Email</span>
                <input
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  autoComplete="email"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-600">Password</span>
                <input
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  type="password"
                  placeholder="Your password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  autoComplete="current-password"
                />
              </label>

              <button
                className="mt-1 h-12 rounded-xl bg-blue-600 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loadingLogin}
              >
                {loadingLogin ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : null}

          {authView === "recover" ? (
            <form className="mt-6 grid gap-4" onSubmit={onRequestRecovery}>
              <label className="grid gap-2">
                <span className="text-sm text-slate-600">Email</span>
                <input
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  type="email"
                  placeholder="you@example.com"
                  value={recoveryEmail}
                  onChange={(event) => setRecoveryEmail(event.target.value)}
                  autoComplete="email"
                />
              </label>

              <button
                className="mt-1 h-12 rounded-xl bg-blue-600 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loadingLogin}
              >
                {loadingLogin ? "Sending..." : "Send reset email"}
              </button>
            </form>
          ) : null}

          {authView === "reset" ? (
            <form className="mt-6 grid gap-4" onSubmit={onPasswordReset}>
              <label className="grid gap-2">
                <span className="text-sm text-slate-600">Reset code</span>
                <input
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  type="text"
                  placeholder="Paste code from email"
                  value={resetForm.oobCode}
                  onChange={(event) => setResetForm((current) => ({ ...current, oobCode: event.target.value }))}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-600">New password</span>
                <input
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  type="password"
                  placeholder="New password"
                  value={resetForm.newPassword}
                  onChange={(event) => setResetForm((current) => ({ ...current, newPassword: event.target.value }))}
                />
              </label>

              <button
                className="mt-1 h-12 rounded-xl bg-blue-600 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loadingLogin}
              >
                {loadingLogin ? "Updating..." : "Reset password"}
              </button>
            </form>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

