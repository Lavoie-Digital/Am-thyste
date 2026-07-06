"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getClientStorage, getClientAuth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

const MAX_DIM = 1600; // px — longest edge
const QUALITY = 0.85;

/** Resize + compress an image File into a JPEG Blob before upload. */
function compress(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no-canvas"));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("no-blob"))),
          "image/jpeg",
          QUALITY,
        );
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageDropzone({
  value,
  onChange,
}: {
  value: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!list.length) return;

      const storage = getClientStorage();
      const auth = getClientAuth();
      if (!storage) {
        setError("Firebase Storage n'est pas configuré.");
        return;
      }

      setBusy(true);
      setError("");
      try {
        const uid = auth?.currentUser?.uid ?? "anon";
        const uploaded: string[] = [];
        for (const file of list) {
          const blob = await compress(file);
          // Unique path under the product images folder.
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
          const dest = storageRef(storage, `products/${uid}/${name}`);
          await uploadBytes(dest, blob, { contentType: "image/jpeg" });
          uploaded.push(await getDownloadURL(dest));
        }
        onChange([...value, ...uploaded]);
      } catch (err) {
        console.error("[upload] failed:", err);
        setError("Échec du téléversement. Vérifiez les règles de Storage.");
      } finally {
        setBusy(false);
      }
    },
    [value, onChange],
  );

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const makePrimary = (i: number) => {
    if (i === 0) return;
    const next = [...value];
    const [moved] = next.splice(i, 1);
    next.unshift(moved);
    onChange(next);
  };

  return (
    <div>
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
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-ink/15 bg-amethyst-500/10" : "border-ink/10 hover:border-ink/12",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <p className="text-sm text-ink/70">
          {busy ? "Téléversement…" : "Glissez vos images ici"}
        </p>
        <p className="mt-1 text-xs text-ink/45">ou cliquez pour parcourir · JPEG/PNG</p>
      </div>

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}

      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((src, i) => (
            <div key={src + i} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-ink/10">
              <Image src={src} alt="" fill sizes="120px" className="object-cover" unoptimized={src.startsWith("data:")} />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ivory/90 px-2 py-0.5 text-[9px] uppercase tracking-wider text-gold shadow-sm">
                  Principale
                </span>
              )}

              {/* Retirer — toujours visible (fonctionne au toucher sur mobile) */}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Retirer l'image"
                title="Retirer l'image"
                className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/90 text-red-500 shadow-sm ring-1 ring-ink/10 transition-colors hover:bg-red-500 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
                </svg>
              </button>

              {/* Définir comme image principale — toujours visible */}
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makePrimary(i)}
                  aria-label="Définir comme image principale"
                  title="Définir comme image principale"
                  className="absolute bottom-1.5 left-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-sm ring-1 ring-ink/10 transition-colors hover:bg-ink hover:text-ivory"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
