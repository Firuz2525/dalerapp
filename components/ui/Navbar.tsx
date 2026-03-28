"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState<"male" | "female" | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkStyle =
    "px-5 text-sm font-bold tracking-widest uppercase text-gray-800 hover:text-black transition-colors flex items-center gap-1 h-full cursor-pointer";
  const dropdownStyle =
    "absolute top-full left-0 w-56 bg-white shadow-2xl border border-gray-100 py-3 z-[60] rounded-b-xl animate-fade-up";

  const closeMobile = () => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" onClick={closeMobile}>
            <h1 className="text-xl font-black tracking-tighter text-gray-900">
              Adidas
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden min-[451px]:flex items-center h-full">
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
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/categories/male/${cat
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="block px-6 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-black capitalize transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/categories/female/${cat
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="block px-6 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-black capitalize transition-colors"
                  >
                    {cat}
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

        {/* Mobile Toggle */}
        <div className="flex min-[451px]:hidden">
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

      {/* Mobile Menu */}
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-[100] bg-white animate-fade-up overflow-y-auto">
          <div className="p-6 space-y-8 pb-32">
            {" "}
            {/* Added pb-32 so bottom items are reachable */}
            {/* Contact Section */}
            <div className="flex flex-col gap-4">
              <Link
                onClick={closeMobile}
                href="/#footer"
                className="text-xl font-bold border-b pb-2 text-gray-900 uppercase tracking-tighter"
              >
                Contact Us
              </Link>
            </div>
            {/* Men's Collection */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                Men's Collection
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    onClick={closeMobile}
                    href={`/categories/male/${cat
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="text-lg font-bold capitalize text-gray-700 active:text-black"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            {/* Women's Collection */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                Women's Collection
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    onClick={closeMobile}
                    href={`/categories/female/${cat
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="text-lg font-bold capitalize text-gray-700 active:text-black"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// {isMobileMenuOpen && (
//     <div className="min-[451px]:hidden bg-white border-t border-gray-100 animate-fade-up p-6 space-y-8 h-screen overflow-y-auto">
//       {/* Restored Login/Admin Section */}
//       <div className="flex flex-col gap-4">
//         <Link
//           onClick={closeMobile}
//           href="#footer"
//           className="text-xl font-bold border-b pb-2 text-gray-900"
//         >
//           Contact
//         </Link>
//       </div>

//       <div>
//         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
//           Men's Collection
//         </h3>
//         <div className="grid grid-cols-1 gap-4">
//           {CATEGORIES.map((cat) => (
//             <Link
//               key={cat}
//               onClick={closeMobile}
//               href={`/categories/male/${cat
//                 .toLowerCase()
//                 .replace(/\s+/g, "-")}`}
//               className="text-lg font-bold capitalize text-gray-700"
//             >
//               {cat}
//             </Link>
//           ))}
//         </div>
//       </div>

//       <div className="pt-4 border-t border-gray-50">
//         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
//           Women's Collection
//         </h3>
//         <div className="grid grid-cols-1 gap-4">
//           {CATEGORIES.map((cat) => (
//             <Link
//               key={cat}
//               onClick={closeMobile}
//               href={`/categories/female/${cat
//                 .toLowerCase()
//                 .replace(/\s+/g, "-")}`}
//               className="text-lg font-bold capitalize text-gray-700"
//             >
//               {cat}
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   )}
