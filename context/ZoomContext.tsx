"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Image from "next/image";

const ZoomContext = createContext<
  { setZoomedImage: (url: string | null) => void } | undefined
>(undefined);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Block scrolling when zoom is active
  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [zoomedImage]);

  return (
    <ZoomContext.Provider value={{ setZoomedImage }}>
      {children}

      {zoomedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative w-[90vw] h-[80vh] flex items-center justify-center">
            <button className="absolute -top-10 right-0 text-white text-4xl">
              &times;
            </button>
            <Image
              src={zoomedImage}
              alt="Zoomed Product"
              fill
              className="object-contain animate-in zoom-in-95 duration-300"
              priority
            />
          </div>
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
