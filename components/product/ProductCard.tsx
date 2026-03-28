"use client";

import Image from "next/image";
import { useZoom } from "@/context/ZoomContext";
import { Product } from "@/types";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { setZoomedImage } = useZoom();

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        setZoomedImage(product.image);
      }}
      // Removed p-2 to allow image to touch the borders
      className="bg-white border border-gray-100 cursor-zoom-in group transition-all duration-300 hover:shadow-md hover:border-gray-300 overflow-hidden"
    >
      {/* Image Container: Removed rounded corners and padding */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={product.id === "1"}
          sizes="(max-width: 768px) 50vw, 25vw"
          // CHANGED: object-cover fills the entire space (No gaps!)
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Content Section: Added padding here so text isn't touching the edge */}
      <div className="p-3 space-y-1">
        {/* Brand Name - Separated for better hierarchy */}
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 leading-none">
          {product.brand}
        </p>

        {/* Product Title */}
        <h2 className="text-sm font-medium text-gray-900 line-clamp-1 leading-tight">
          {product.name}
        </h2>

        {/* Price */}
        <p className="text-sm font-bold text-black pt-0.5">${product.price}</p>

        {/* Sizes Section - Minimalist labels */}
        <div className="flex flex-wrap gap-1 pt-1.5">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="text-[9px] font-bold text-gray-300 border border-gray-100 px-1.5 py-0.5 rounded-sm uppercase"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
