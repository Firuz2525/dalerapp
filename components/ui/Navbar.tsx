"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { subscribeToCollection, FirestoreItem } from "@/lib/firestore";

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState<
    "male" | "female" | "brands" | null
  >(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real-time Data State
  const [dbBrands, setDbBrands] = useState<FirestoreItem[]>([]);
  const [dbCategories, setDbCategories] = useState<FirestoreItem[]>([]);

  // Fetch from Firestore
  useEffect(() => {
    const unsubBrands = subscribeToCollection("brands", setDbBrands);
    const unsubCats = subscribeToCollection("categories", setDbCategories);
    return () => {
      unsubBrands();
      unsubCats();
    };
  }, []);

  const linkStyle =
    "px-5 text-sm font-bold tracking-widest uppercase text-gray-800 hover:text-black transition-colors flex items-center gap-1 h-full cursor-pointer";
  const dropdownStyle =
    "absolute top-full left-0 w-56 bg-white shadow-2xl border border-gray-100 py-3 z-[60] rounded-b-xl animate-fade-up grid grid-cols-1";

  const closeMobile = () => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  };

  // Helper to format URL strings
  const formatSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" onClick={closeMobile}>
            <h1 className="text-xl font-black tracking-tighter text-gray-900">
              Tokyo<b className="text-red-600">Brands</b>
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center h-full">
          {/* MEN Dropdown */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setActiveMenu("male")}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className={linkStyle}>
              Men <span className="text-[10px] opacity-30">▼</span>
            </button>
            {activeMenu === "male" && (
              <div className={dropdownStyle}>
                {dbCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/male/${formatSlug(cat.name)}`}
                    className="block px-6 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-black capitalize"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* WOMEN Dropdown */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setActiveMenu("female")}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className={linkStyle}>
              Women <span className="text-[10px] opacity-30">▼</span>
            </button>
            {activeMenu === "female" && (
              <div className={dropdownStyle}>
                {dbCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/female/${formatSlug(cat.name)}`}
                    className="block px-6 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-black capitalize"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* BRANDS Dropdown - Filtering both genders */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setActiveMenu("brands")}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className={linkStyle}>
              Brands <span className="text-[10px] opacity-30">▼</span>
            </button>
            {activeMenu === "brands" && (
              <div className={dropdownStyle}>
                {dbBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${formatSlug(brand.name)}`}
                    className="block px-6 py-2.5 text-xs font-black text-gray-800 hover:bg-gray-50 hover:text-red-600 uppercase tracking-tighter"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200 mx-2" />
          <Link
            href="/#footer"
            className="px-4 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black"
          >
            Contact
          </Link>
        </nav>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-[100] bg-white animate-fade-up overflow-y-auto p-6 space-y-8 pb-32">
          {/* Brands (Mobile) */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4">
              Top Brands
            </h3>
            <div className="flex flex-wrap gap-2">
              {dbBrands.map((brand) => (
                <Link
                  key={brand.id}
                  onClick={closeMobile}
                  href={`/shop?brand=${formatSlug(brand.name)}`}
                  className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </section>

          {/* Men's (Mobile) */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
              Men's Collection
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {dbCategories.map((cat) => (
                <Link
                  key={cat.id}
                  onClick={closeMobile}
                  href={`/shop/male?category=${formatSlug(cat.name)}`}
                  className="text-sm font-bold capitalize text-gray-700"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>

          {/* Women's (Mobile) */}
          <section className="pt-4 border-t border-gray-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
              Women's Collection
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {dbCategories.map((cat) => (
                <Link
                  key={cat.id}
                  onClick={closeMobile}
                  href={`/shop/female?category=${formatSlug(cat.name)}`}
                  className="text-sm font-bold capitalize text-gray-700"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </header>
  );
}
