"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const SLIDES = [
  { id: 1, src: "/a1.jpeg", alt: "New Spring Collection" },
  { id: 2, src: "/a2.jpeg", alt: "Minimalist Essentials" },
  { id: 3, src: "/a3.jpeg", alt: "Limited Edition Drop" },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }, []);

  // Auto-move logic (5 seconds)
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-gray-100">
      {/* Images Container */}
      {SLIDES.map(
        (
          slide,
          index // Line 34: Opening map
        ) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover"
            />
          </div>
        )
      )}
      {/* Fixed: Correct closing for the map function */}
      {/* Control Area: Bottom Left, Vertical Stack */}
      <div className="absolute bottom-10 left-10 flex flex-col bg-black/10 backdrop-blur-sm z-20">
        {/* Prev Button (Top Square) */}
        <button
          onClick={prevSlide}
          className="w-10 h-10 flex items-center justify-center border border-black text-black hover:bg-black hover:text-white transition-all"
          aria-label="Previous slide"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>

        {/* Next Button (Bottom Square) */}
        <button
          onClick={nextSlide}
          className="w-10 h-10 flex items-center justify-center border border-black border-t-0 text-black hover:bg-black hover:text-white transition-all"
          aria-label="Next slide"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
      {/* Slide Counter Overlay */}
      <div className="absolute bottom-10 left-24 text-[10px] font-bold tracking-[0.3em] text-black uppercase">
        0{current + 1} / 0{SLIDES.length}
      </div>
    </section>
  );
}
