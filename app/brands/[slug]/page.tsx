"use client";

import { useState, useEffect, use } from "react";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import ProductCard from "@/components/product/ProductCard";
import Spinner from "@/components/ui/Spinner";
import { getProductsPaginated } from "@/lib/firestore";
import { Product } from "@/types";

export default function BrandPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(paramsPromise);
  const brandSlug = params.slug;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const PAGE_LIMIT = 10;

  // Clean up the slug for display (e.g., "air-jordan" -> "Air Jordan")
  const displayBrand = brandSlug.replace(/-/g, " ");

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const { products: initialProducts, lastDoc: initialLastDoc } =
          await getProductsPaginated({
            brand: displayBrand, // Query by the brand name
            pageSize: PAGE_LIMIT,
          });

        setProducts(initialProducts);
        setLastDoc(initialLastDoc);
        if (initialProducts.length < PAGE_LIMIT) setHasMore(false);
      } catch (err) {
        console.error("Failed to load brand products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [brandSlug, displayBrand]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const { products: nextBatch, lastDoc: nextDoc } =
        await getProductsPaginated({
          brand: displayBrand,
          lastVisible: lastDoc,
          pageSize: PAGE_LIMIT,
        });

      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...nextBatch]);
        setLastDoc(nextDoc);
        if (nextBatch.length < PAGE_LIMIT) setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <main className="p-6 max-w-7xl mx-auto min-h-screen">
      <header className="mb-10 border-b border-gray-100 pb-8 text-center">
        <span className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">
          Official Selection
        </span>
        <h1 className="text-5xl font-black tracking-tighter text-gray-900 uppercase mt-2">
          {displayBrand}
        </h1>
        <p className="text-gray-500 mt-4 max-w-md mx-auto text-sm">
          Browse the latest authentic arrivals from {displayBrand}.
        </p>
      </header>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div key={product.id} className="animate-fade-up">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-16 flex flex-col items-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-12 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-20"
              >
                {loadingMore ? "Loading..." : "View More Items"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center">
          <p className="text-gray-400 italic">
            No products currently listed under {displayBrand}.
          </p>
        </div>
      )}
    </main>
  );
}
