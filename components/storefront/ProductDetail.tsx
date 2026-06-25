"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick, cn } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";
import { PriceTag } from "./PriceTag";
import { AddToCartButton } from "./AddToCartButton";

type Tab = "description" | "ritual" | "ingredients";

export function ProductDetail({ product }: { product: ProductDTO }) {
  const { dict, locale } = useLocale();
  const [activeImage, setActiveImage] = useState(0);
  const [sizeId, setSizeId] = useState(product.sizes[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>("description");

  const tabs = (
    [
      { key: "description", label: dict.shop.details, content: pick(product.description, locale) },
      { key: "ritual", label: dict.shop.ritual, content: product.ritual ? pick(product.ritual, locale) : undefined },
      { key: "ingredients", label: dict.shop.ingredients, content: product.ingredients ? pick(product.ingredients, locale) : undefined },
    ] as { key: Tab; label: string; content?: string }[]
  ).filter((t) => t.content);

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      {/* Gallery */}
      <div>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[4/5] overflow-hidden bg-night-800"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={product.images[activeImage]}
                alt={pick(product.name, locale)}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {product.images.length > 1 && (
          <div className="mt-4 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "relative h-20 w-20 overflow-hidden transition-opacity",
                  i === activeImage ? "opacity-100 ring-1 ring-amethyst-300/60" : "opacity-50 hover:opacity-90",
                )}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <p className="eyebrow">{dict.brand.subtitle}</p>
        <h1 className="mt-4 heading text-4xl sm:text-5xl">{pick(product.name, locale)}</h1>
        <p className="mt-5 text-lg leading-relaxed text-amethyst-200/70">
          {pick(product.shortDesc, locale)}
        </p>

        <div className="mt-6">
          <PriceTag marketPrice={product.marketPrice} resellerPrice={product.resellerPrice} size="lg" />
        </div>

        {/* Sizes */}
        {product.sizes.length > 1 && (
          <div className="mt-8">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-amethyst-300/70">
              {dict.shop.sizeLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSizeId(s.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-all",
                    s.id === sizeId
                      ? "border-amethyst-300/60 bg-amethyst-500/15 text-white"
                      : "border-amethyst-300/20 text-amethyst-100/70 hover:border-amethyst-300/40",
                  )}
                >
                  {pick(s.label, locale)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + add */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-full border border-amethyst-300/25">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-3 text-amethyst-100 hover:text-white" aria-label="−">−</button>
            <span className="min-w-8 text-center text-white">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="px-4 py-3 text-amethyst-100 hover:text-white" aria-label="+">+</button>
          </div>
          <AddToCartButton product={product} sizeId={sizeId} quantity={quantity} className="flex-1" />
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="mt-12 border-t border-amethyst-300/15 pt-8">
            <div className="flex gap-6">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "pb-2 text-sm tracking-wide transition-colors",
                    tab === t.key
                      ? "border-b-2 border-amethyst-300 text-white"
                      : "text-amethyst-200/60 hover:text-white",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-5 leading-relaxed text-amethyst-200/80"
              >
                {tabs.find((t) => t.key === tab)?.content}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
