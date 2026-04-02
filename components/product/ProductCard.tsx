"use client";

import Image from "next/image";
import { useZoom } from "@/context/ZoomContext";
import { Product } from "@/types";

type Props = {
  product: Product;
  priority?: boolean; // Add this
};

export default function ProductCard({ product, priority = false }: Props) {
  const { setZoomedImages } = useZoom(); // Updated name
  // 1. Safety Check: Get the first image URL or a placeholder if it's missing/empty
  const displayImage = product.images?.[0] || "/shoe.jpg";

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        setZoomedImages(product.images);
      }}
      className="bg-white border border-gray-100 cursor-zoom-in group transition-all duration-300 hover:shadow-md hover:border-gray-300 overflow-hidden"
    >
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        {/* 2. Defensive rendering: Only render Image if displayImage isn't an empty string */}
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            // ✅ Change this line to prioritize the first 4 items in the grid
            priority={priority}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase font-bold">
            No Image
          </div>
        )}
      </div>

      <div className="p-3 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 leading-none">
          {product.brand}
        </p>

        <h2 className="text-sm font-medium text-gray-900 line-clamp-1 leading-tight">
          {product.name}
        </h2>

        <p className="text-sm font-bold text-black pt-0.5">${product.price}</p>
      </div>
    </div>
  );
}
