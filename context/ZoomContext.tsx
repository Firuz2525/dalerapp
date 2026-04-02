"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Image from "next/image";

type ZoomContextType = {
  setZoomedImages: (images: string[] | null) => void;
};

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<string[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBigImageLoaded, setIsBigImageLoaded] = useState(false);

  // Manage body scroll
  useEffect(() => {
    if (images) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [images]);

  // Reset loading state whenever the active index changes
  useEffect(() => {
    setIsBigImageLoaded(false);
  }, [activeIndex]);

  return (
    <ZoomContext.Provider value={{ setZoomedImages: setImages }}>
      {children}

      {images && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button
            className="absolute top-6 right-8 text-white/50 hover:text-white text-5xl z-50 transition-colors"
            onClick={() => setImages(null)}
          >
            &times;
          </button>

          {/* MAIN BIG IMAGE CONTAINER */}
          <div className="relative w-[90vw] h-[60vh] md:h-[70vh] flex items-center justify-center">
            {/* THE SPINNER */}
            {!isBigImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}

            <Image
              src={images[activeIndex]}
              alt="Zoomed Product"
              fill
              sizes="90vw"
              // ✅ FIXED: Changed from onLoadingComplete to onLoad
              onLoad={() => setIsBigImageLoaded(true)}
              className={`object-contain transition-all duration-500 ${
                isBigImageLoaded
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
              priority
            />
          </div>

          {/* THUMBNAILS */}
          <div className="mt-8 flex gap-3 p-4 max-w-full overflow-x-auto no-scrollbar">
            {images.map((url, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
                className={`relative w-16 h-16 md:w-20 md:h-20 cursor-pointer overflow-hidden rounded-md border-2 transition-all ${
                  activeIndex === idx
                    ? "border-white scale-110 shadow-lg"
                    : "border-transparent opacity-40 hover:opacity-100"
                }`}
              >
                <Image
                  src={url}
                  alt={`Thumb ${idx}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div
            className="absolute inset-0 -z-10"
            onClick={() => setImages(null)}
          />
        </div>
      )}
    </ZoomContext.Provider>
  );
}

export const useZoom = () => {
  const context = useContext(ZoomContext);
  if (!context) throw new Error("useZoom must be used within a ZoomProvider");
  return context;
};
