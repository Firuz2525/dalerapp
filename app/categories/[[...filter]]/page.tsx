"use client";

import { useState, useEffect, use } from "react";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import ProductCard from "@/components/product/ProductCard";
import Spinner from "@/components/ui/Spinner";
import { getProductsPaginated, getCategories } from "@/lib/firestore"; // Import getCategories
import { Product } from "@/types";
import { notFound } from "next/navigation";

// Keep Genders hardcoded as requested
const GENDERS = ["male", "female"];

export default function CategoryPage({
  params: paramsPromise,
}: {
  params: Promise<{ filter?: string[] }>;
}) {
  const params = use(paramsPromise);
  const filter = params.filter || [];

  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const PAGE_LIMIT = 10;

  // --- 1. Parse URL segments ---
  let gender: string | undefined = undefined;
  let categorySlug: string | undefined = undefined;

  if (filter.length >= 2) {
    gender = filter[0].toLowerCase();
    categorySlug = filter[1];
  } else if (filter.length === 1) {
    if (GENDERS.includes(filter[0].toLowerCase())) {
      gender = filter[0].toLowerCase();
    } else {
      categorySlug = filter[0];
    }
  }

  const decodedCategory = categorySlug?.replace(/-/g, " ");

  // --- 2. Initial Fetch (Categories + Products) ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch Categories from DB
        const categoriesData = await getCategories();
        setDbCategories(categoriesData);

        // --- Validation Logic using DB Categories ---
        const isGenderInvalid = gender && !GENDERS.includes(gender);
        const isCategoryInvalid =
          decodedCategory &&
          !categoriesData.some(
            (c) => c.name.toLowerCase() === decodedCategory.toLowerCase()
          );

        if (isGenderInvalid || isCategoryInvalid) {
          // If we are on the client, we can't easily trigger Next.js notFound()
          // mid-render, so we just stop loading and show an empty state or redirect.
          setLoading(false);
          return;
        }

        // Fetch Products
        const { products: initialProducts, lastDoc: initialLastDoc } =
          await getProductsPaginated({
            gender,
            category: decodedCategory,
            lastVisible: null,
          });

        setProducts(initialProducts);
        setLastDoc(initialLastDoc);
        if (initialProducts.length < PAGE_LIMIT) setHasMore(false);
      } catch (err) {
        console.error("Failed to load category data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [gender, decodedCategory]);

  // --- 3. Pagination Logic ---
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { products: nextBatch, lastDoc: nextDoc } =
        await getProductsPaginated({
          gender,
          category: decodedCategory,
          lastVisible: lastDoc,
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

  // Handle case where validation failed after categories loaded
  const isValid =
    (!gender || GENDERS.includes(gender)) &&
    (!decodedCategory ||
      dbCategories.some(
        (c) => c.name.toLowerCase() === decodedCategory.toLowerCase()
      ));

  if (!isValid && !loading) return notFound();

  return (
    <main className="p-6 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-4xl font-extrabold capitalize mb-6">
        {gender ? `${gender}'s ` : ""}
        {decodedCategory || "Collection"}
      </h1>

      {/* Grid rendering same as before */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-black text-white px-8 py-3 uppercase text-xs font-bold tracking-widest"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </main>
  );
}
