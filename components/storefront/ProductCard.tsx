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
      className="group flex flex-col"
    >
      <Link href={`/boutique/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-night-800">
        <Image
          src={product.images[0]}
          alt={pick(product.name, locale)}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="img-zoom object-cover"
        />
        {product.sizes[0] && (
          <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.2em] text-ivory/80 mix-blend-difference">
            {pick(product.sizes[0].label, locale)}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <Link href={`/boutique/${product.slug}`}>
            <h3 className="font-display text-base tracking-wide text-ivory transition-colors group-hover:text-white">
              {pick(product.name, locale)}
            </h3>
          </Link>
          <PriceTag marketPrice={product.marketPrice} resellerPrice={product.resellerPrice} size="sm" align="right" />
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-amethyst-200/60">
          {pick(product.shortDesc, locale)}
        </p>
        <div className="mt-5">
          <AddToCartButton product={product} tone="line" fullWidth />
        </div>
      </div>
    </motion.article>
  );
}
