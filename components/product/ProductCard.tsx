"use client";

import Image from "next/image";
import { useZoom } from "@/context/ZoomContext";
import { Product } from "@/types";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { useCartStore } from "@/context/useCartStore";
import toast from "react-hot-toast";

type Props = {
  product: Product;
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: Props) {
  const { setZoomedImages } = useZoom();
  const displayImage = product.images?.[0] || "/shoe.jpg";

  // Connect to Zustand store
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents triggering the zoom modal

    // 1. Add to global state
    addItem(product);

    // 2. Show Toast
    toast.success(`${product.name} savatga qo'shildi!`, {
      style: {
        borderRadius: "0px",
        background: "#000",
        color: "#fff",
        fontSize: "12px",
        fontWeight: "bold",
      },
    });

    // 3. Trigger Motion: Open the drawer so user sees the slide effect
    // toggleCart();
  };

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        setZoomedImages(product.images);
      }}
      className="bg-white border border-gray-200 cursor-zoom-in group transition-all duration-300 hover:shadow-lg hover:border-gray-300 overflow-hidden relative"
    >
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
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
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 leading-none">
            {product.brand}
          </p>
          <span className="text-[10px] text-gray-400 font-mono">
            #{product.id?.slice(0, 4)}
          </span>
        </div>

        <h2 className="text-sm font-medium text-gray-900 line-clamp-1 leading-tight">
          {product.name}
        </h2>

        <div className="flex justify-between items-center pt-1">
          <p className="text-sm font-bold text-black">${product.price}</p>

          <button
            onClick={handleAddToCart}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
            aria-label="Add to basket"
          >
            <HiOutlineShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
