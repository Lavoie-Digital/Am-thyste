"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { submitContact } from "@/lib/actions/contact";
import { Field, inputClass } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const { dict } = useLocale();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  // Anti-spam: honeypot field (bots fill it, humans never see it) + the moment
  // the form became interactive (set on mount to avoid an SSR hydration gap).
  const [honeypot, setHoneypot] = useState("");
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const res = await submitContact({ ...form, company: honeypot, startedAt: startedAt.current });
    setSending(false);
    if (res.ok) {
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    }
  };

  if (sent) {
    return (
      <div className="surface rounded-2xl p-8 text-center text-gold">
        {dict.contact.sent}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Honeypot: hidden off-screen; real users never fill it, bots do. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
        <label>
          Company
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={dict.common.name}><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} /></Field>
        <Field label={dict.common.email}><input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} /></Field>
      </div>
      <Field label={dict.contact.message}>
        <textarea required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className={inputClass.replace("h-12", "min-h-32 py-3")} />
      </Field>
      <Button type="submit" disabled={sending} size="lg">{sending ? dict.common.sending : dict.common.send}</Button>
    </form>
  );
}
