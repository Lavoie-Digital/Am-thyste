"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";
import { PriceTag } from "./PriceTag";
import { AddToCartButton } from "./AddToCartButton";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductCard({ product, index = 0 }: { product: ProductDTO; index?: number }) {
  const { locale } = useLocale();

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, delay: index * 0.07, ease }}
      className="group flex h-full flex-col"
    >
      <Link href={`/boutique/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-sm bg-bone ring-1 ring-ink/[0.04]">
        <Image
          src={product.images[0]}
          alt={pick(product.name, locale)}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="img-zoom object-cover"
          unoptimized={product.images[0]?.startsWith("data:")}
        />
        {product.sizes[0] && (
          <span className="absolute bottom-3 left-3 rounded-full border border-ink/5 bg-ivory/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink/75 backdrop-blur-sm">
            {pick(product.sizes[0].label, locale)}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <Link href={`/boutique/${product.slug}`}>
          <h3 className="font-display text-base tracking-wide text-ink transition-colors group-hover:text-amethyst-700">
            {pick(product.name, locale)}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/55">
          {pick(product.shortDesc, locale)}
        </p>
        <PriceTag
          marketPrice={product.marketPrice}
          resellerPrice={product.resellerPrice}
          size="sm"
          className="mt-auto pt-4"
        />
        <div className="mt-4">
          <AddToCartButton product={product} tone="line" fullWidth />
        </div>
      </div>
    </motion.article>
  );
}
