"use client";

import { useState, useEffect } from "react";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import ProductCard from "@/components/product/ProductCard";
import HeroSlider from "@/components/ui/HeroSilder";
import Spinner from "@/components/ui/Spinner";
import { getProductsPaginated } from "@/lib/firestore";
import { Product } from "@/types";
import { SiSpreadshirt } from "react-icons/si";
import { HiOutlineChevronDown } from "react-icons/hi";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const PAGE_LIMIT = 10;

  // Initial Data Fetch
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const { products: initialProducts, lastDoc: initialLastDoc } =
          await getProductsPaginated({});

        setProducts(initialProducts);
        setLastDoc(initialLastDoc);

        // Hide button if we fetched less than our limit
        if (initialProducts.length < PAGE_LIMIT) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  // Pagination Fetch
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const { products: nextBatch, lastDoc: nextDoc } =
        await getProductsPaginated({ lastVisible: lastDoc });

      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...nextBatch]);
        setLastDoc(nextDoc);

        if (nextBatch.length < PAGE_LIMIT) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <HeroSlider />

      <main className="max-w-7xl p-4 md:p-8 mx-auto min-h-screen">
        {/* Header Section */}
        <div className="mb-10 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-gray-200 to-yellow-200">
            Premium-class mahsulotlar
          </h1>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 italic">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-up"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: "both",
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {hasMore && (
          <div className="mt-16 flex flex-col items-center justify-center pb-20">
            <div className="w-10 h-[1px] bg-gray-200 mb-8" />

            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex flex-row items-center group relative px-7 py-2 bg-black text-white transition-all hover:bg-gray-800 disabled:opacity-30 active:scale-95"
            >
              <span
                className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                  loadingMore ? "opacity-0" : "opacity-100"
                }`}
              >
                Yuklash
              </span>
              <HiOutlineChevronDown
                className="text-yellow-600 animate-bounce mt-4"
                size={30}
              />
              {loadingMore && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
            {/* <button
              onClick={loadMore}
              disabled={loadingMore}
              className="group relative px-10 py-4 bg-black text-white transition-all hover:bg-gray-800 disabled:opacity-30 active:scale-95"
            >
              <span
                className={`flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] ${
                  loadingMore ? "opacity-0" : "opacity-100"
                }`}
              >
                Yana yuklash
                <HiOutlineChevronDown
                  className="text-yellow-600 group-hover:translate-y-1 transition-transform"
                  size={18}
                />
              </span>

              {loadingMore && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button> */}
            <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mt-6">
              Yana {products.length}ta Mahsulot
            </p>
          </div>
        )}
      </main>
    </>
  );
}
