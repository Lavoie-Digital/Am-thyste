"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { approvePro, rejectPro } from "@/lib/actions/pro";
import type { AppUser } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProApprovalTable({ initial }: { initial: AppUser[] }) {
  const { dict, locale } = useLocale();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const act = (uid: string, kind: "approve" | "reject") => {
    setBusyId(uid);
    startTransition(async () => {
      const res = kind === "approve" ? await approvePro(uid) : await rejectPro(uid);
      if (res.ok) {
        setRows((r) =>
          r.map((u) => (u.uid === uid ? { ...u, proStatus: kind === "approve" ? "approved" : "rejected" } : u)),
        );
      }
      setBusyId(null);
    });
  };

  const fmtDate = (ms?: number) =>
    ms ? new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium" }).format(ms) : "—";

  const statusStyle: Record<string, string> = {
    pending: "bg-amethyst-500/20 text-amethyst-100",
    approved: "bg-gold/15 text-gold-soft",
    rejected: "bg-red-500/15 text-red-300",
    none: "bg-white/5 text-amethyst-200/60",
  };

  if (rows.length === 0) {
    return <p className="rounded-2xl glass p-10 text-center text-amethyst-200/60">{dict.admin.noPros}</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl glass">
      <div className="grid grid-cols-[1.5fr_1.5fr_1fr_auto] gap-4 border-b border-amethyst-300/15 px-6 py-4 text-xs uppercase tracking-[0.15em] text-amethyst-300/70">
        <span>{dict.admin.business}</span>
        <span>{dict.common.email}</span>
        <span>{dict.admin.status}</span>
        <span className="text-right">Actions</span>
      </div>
      {rows.map((u) => (
        <div key={u.uid} className="grid grid-cols-[1.5fr_1.5fr_1fr_auto] items-center gap-4 border-b border-white/5 px-6 py-4 text-sm last:border-0">
          <div>
            <p className="font-medium text-amethyst-50">{u.proProfile?.businessName || u.displayName}</p>
            <p className="text-xs text-amethyst-200/50">{u.proProfile?.phone}</p>
            <p className="text-xs text-amethyst-200/40">{dict.admin.appliedOn} {fmtDate(u.createdAt)}</p>
          </div>
          <span className="truncate text-amethyst-200/80">{u.email}</span>
          <span>
            <span className={cn("rounded-full px-3 py-1 text-xs", statusStyle[u.proStatus] ?? statusStyle.none)}>
              {u.proStatus}
            </span>
          </span>
          <div className="flex justify-end gap-2">
            {u.proStatus !== "approved" && (
              <button
                onClick={() => act(u.uid, "approve")}
                disabled={pending && busyId === u.uid}
                className="rounded-full bg-[#c2a878] px-4 py-1.5 text-xs uppercase tracking-[0.12em] text-[#0b0810] transition-colors hover:bg-[#d8c4a0] disabled:opacity-50"
              >
                {dict.admin.approve}
              </button>
            )}
            {u.proStatus !== "rejected" && (
              <button
                onClick={() => act(u.uid, "reject")}
                disabled={pending && busyId === u.uid}
                className="rounded-full border border-red-400/30 px-4 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                {dict.admin.reject}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
