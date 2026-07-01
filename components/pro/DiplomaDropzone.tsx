"use client";

import { useRef, useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const ACCEPT = "application/pdf,image/*";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Captures the applicant's hairdressing diploma (image or PDF). The file is held
 * locally and only uploaded to Storage once the account exists — see ProSignupForm.
 */
export function DiplomaDropzone({
  value,
  onChange,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
}) {
  const { dict } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value && value.type.startsWith("image/")) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [value]);

  const accept = (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError(dict.pro.diplomaBrowse);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Max 10 MB.");
      return;
    }
    setError("");
    onChange(file);
  };

  return (
    <div>
      {!value ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
            dragging ? "border-ink/15 bg-amethyst-500/10" : "border-ink/10 hover:border-ink/12",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files && accept(e.target.files)}
          />
          <p className="text-sm text-ink/70">{dict.pro.diplomaDrop}</p>
          <p className="mt-1 text-xs text-ink/45">{dict.pro.diplomaBrowse}</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-ink/10" />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink/[0.04] text-[10px] font-medium uppercase tracking-wider text-ink/50">
              PDF
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-ink/80">{value.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            title="Retirer"
            className="shrink-0 text-xs text-red-300 hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
