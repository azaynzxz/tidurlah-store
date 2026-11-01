import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/product";
import { getInitialCatalogSync, loadCatalogWithSWR } from "@/services/products";
import { generateProductSlug } from "@/utils/product";

interface BlogRelatedProductsProps {
  relatedItems?: string[];
  title?: string;
  subtitle?: string;
}

export default function BlogRelatedProducts({
  relatedItems = [],
  title = "Produk Terkait",
  subtitle = "Pesan langsung cetak berkualitas tanpa minimum order di Tidurlah Store."
}: BlogRelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  const extractAndFilterProducts = useCallback(
    (catalog: Record<string, Product[]>) => {
      const allProducts = Object.values(catalog).flat();
      if (!allProducts.length) return;

      if (!relatedItems || relatedItems.length === 0) {
        setProducts(allProducts.slice(0, 3));
        return;
      }

      const matched: Product[] = [];
      const lowerQueries = relatedItems.map((item) => item.toLowerCase());

      for (const p of allProducts) {
        const pName = p.name.toLowerCase();
        const pCat = (p.category || "").toLowerCase();
        const isMatch = lowerQueries.some((q) => pName.includes(q) || pCat.includes(q));
        if (isMatch && !matched.some((m) => m.id === p.id)) {
          matched.push(p);
        }
        if (matched.length >= 3) break;
      }

      if (matched.length < 3) {
        for (const p of allProducts) {
          if (!matched.some((m) => m.id === p.id)) {
            matched.push(p);
          }
          if (matched.length >= 3) break;
        }
      }

      setProducts(matched.slice(0, 3));
    },
    [relatedItems]
  );

  useEffect(() => {
    const initialCatalog = getInitialCatalogSync();
    if (initialCatalog) {
      extractAndFilterProducts(initialCatalog);
    }

    const unsubscribe = loadCatalogWithSWR((catalog) => {
      extractAndFilterProducts(catalog);
    });

    return () => {
      unsubscribe();
    };
  }, [extractAndFilterProducts]);

  if (products.length === 0) {
    return null;
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="my-8 pt-6 border-t border-border">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Semua Produk</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {products.map((product) => {
          const slug = generateProductSlug(product.name);
          const hasWholesale = product.priceThresholds && product.priceThresholds.length > 0;
          const lowestWholesale = hasWholesale
            ? Math.min(...product.priceThresholds!.map((t) => t.price))
            : null;

          return (
            <Link
              key={product.id}
              to={`/product/${slug}`}
              className="group flex flex-col rounded-md border border-border bg-card p-2.5 hover:bg-muted/40 transition-colors"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded bg-muted/20 border border-border/50">
                <img
                  src={product.image}
                  alt={product.imageAlt || product.name}
                  loading="lazy"
                  className="h-full w-full object-contain p-2"
                />
              </div>

              <div className="pt-2 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[10px] text-muted-foreground block">
                    {product.category}
                  </span>
                  <h4 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                  </h4>
                </div>

                <div className="mt-2 pt-1.5 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">Mulai</span>
                  <span className="font-semibold text-foreground">
                    {formatRupiah(lowestWholesale || product.price)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
