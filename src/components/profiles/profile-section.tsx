"use client";

import type { UserDetailsEnvelope } from "@/types/mouv";
import { formatValue, prettifyKey } from "@/lib/format";

export function ProfileSection({
  userDetails
}: {
  userDetails: UserDetailsEnvelope | null;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Profile</h2>
          <p className="text-sm leading-6 text-slate-600">The user payload returned by the API.</p>
        </div>
      </div>
      {userDetails?.user ? (
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {Object.entries(userDetails.user)
            .slice(0, 12)
            .map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{prettifyKey(key)}</div>
                <div className="mt-2 break-words text-sm leading-6 text-slate-900">{formatValue(value)}</div>
              </div>
            ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
          Authenticate to load the profile payload.
        </div>
      )}
    </section>
  );
}

