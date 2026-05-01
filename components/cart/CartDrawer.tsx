"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/context/useCartStore";
import { HiOutlineX, HiOutlineTrash } from "react-icons/hi";
import OrderForm from "./OrderForm";
import Image from "next/image";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                Savat
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <HiOutlineX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-gray-400 mt-10 italic">
                  Savat bo'sh...
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4 group">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-gray-900 leading-tight">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <HiOutlineTrash size={18} />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">
                          {item.brand}
                        </p>
                      </div>

                      <div className="flex justify-between items-end">
                        {/* 🔢 Quantity Indicator */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Soni:
                          </span>
                          <span className="bg-gray-100 px-2 py-0.5 text-xs font-mono font-bold rounded">
                            {item.quantity}
                          </span>
                        </div>

                        {/* 💰 Price Calculation */}
                        <div className="text-right">
                          {/* <p className="text-xs text-gray-400 line-through">
                            ${item.price}
                          </p> */}
                          <p className="text-sm font-black text-black">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div className="p-6 bg-gray-50">
                <div className="flex justify-between mb-4 font-bold">
                  <span>Jami:</span>
                  <span>
                    $
                    {items.reduce(
                      (acc, item) => acc + item.price * item.quantity,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between mb-4 font-bold">
                  <span className="text-gray-500 uppercase text-xs tracking-widest">
                    Umumiy summa:
                  </span>
                  <span className="text-xl font-black">
                    $
                    {items.reduce(
                      (acc, item) => acc + item.price * item.quantity,
                      0
                    )}
                  </span>
                </div>

                {/* Replace the old button with the new Form */}
                {items.length > 0 && <OrderForm />}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
