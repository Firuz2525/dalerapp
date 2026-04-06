import { useState, useEffect } from "react";
import {
  deleteSliderSlot,
  SliderImage,
  subscribeToSlider,
  updateSliderSlot,
} from "@/lib/firestore";
// Import your firestore functions here:
// import { subscribeToCollection, updateSliderSlot, deleteSliderSlot } from "@/lib/firestore";

export default function SliderManagement() {
  const [dbImages, setImages] = useState<any[]>([]);
  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);

  // Real-time listener: Fetches current images
  useEffect(() => {
    const unsubscribe = subscribeToSlider((data) => {
      console.log("Slider Data:", data); // Check if 'url' exists here!
      setImages(data);
    });
    return () => unsubscribe();
  }, []);

  // Returns the image object {id, url} if a slot has data
  const getImgForSlot = (id: string) => dbImages.find((img) => img.id === id);

  const handleUpload = async (
    slotId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0]) return;
    setLoadingSlot(slotId);
    try {
      await updateSliderSlot(slotId, e.target.files[0]);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoadingSlot(null);
    }
  };

  const handleDelete = async (image: SliderImage) => {
    if (confirm("Haqiqatan ham ushbu rasmni o'chirishni xohlaysizmi?")) {
      setLoadingSlot(image.id); // Use the id for the loading state
      await deleteSliderSlot(image); // Pass the whole object here
      setLoadingSlot(null);
    }
  };

  return (
    <div className="max-w-4xl bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
      {/* Reduced size Header */}
      <h2 className="text-lg font-black uppercase tracking-tight mb-1 text-gray-900">
        Slayder (Slotli Boshqaruv)
      </h2>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">
        Tanlangan rasm avvalgisini almashtiradi ({dbImages.length}/3)
      </p>

      {/* 1. The 3 Compact Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {["slot_1", "slot_2", "slot_3"].map((slotId, index) => {
          const isSlotLoaded = !!getImgForSlot(slotId);

          return (
            <div key={slotId} className="space-y-1.5 relative">
              <label htmlFor={slotId} className="block cursor-pointer">
                {/* Visual Label (e.g. Slayd 1) */}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                  Slayd {index + 1}
                </span>

                {/* The "Text Input Shape" button */}
                <div
                  className={`w-full flex items-center justify-center p-3 border rounded-lg text-sm transition-all duration-150 ${
                    isSlotLoaded
                      ? "bg-black text-white border-black hover:bg-gray-800"
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:border-black"
                  }`}
                >
                  {loadingSlot === slotId ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="font-bold uppercase text-[10px] tracking-widest">
                      {isSlotLoaded ? "Almashtirish" : "Yuklash"}
                    </span>
                  )}
                </div>
              </label>

              {/* Real Input (Hidden) */}
              <input
                type="file"
                id={slotId}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleUpload(slotId, e)}
                disabled={!!loadingSlot}
              />
            </div>
          );
        })}
      </div>

      {/* 2. The Current Images Grid (Compact) */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">
          Hozirda Active Rasmlar
        </h3>

        {dbImages.length === 0 ? (
          <div className="border border-dashed border-gray-100 rounded-lg p-6 text-center text-gray-300 text-xs font-medium">
            Slayderga hech qanday rasm yuklanmagan
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
            {dbImages.map((img) => (
              <div
                key={img.id}
                className="border border-gray-100 p-2.5 rounded-xl flex gap-4 items-center group relative overflow-hidden transition-all hover:border-gray-200 hover:shadow-inner bg-gray-50/50"
              >
                {/* Thumbnail */}
                <img
                  src={img.url}
                  alt="Active Slider"
                  className="w-16 h-12 object-cover rounded-md"
                />

                {/* Details */}
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900 tracking-tight capitalize">
                    {img.id.replace("_", " ")}
                  </p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                    Rasm Yuklangan
                  </p>
                </div>

                {/* Compact Delete Button */}
                <button
                  onClick={() => handleDelete(img)}
                  className="bg-black/5 text-gray-400 hover:text-white hover:bg-red-600 transition-colors p-2 rounded-full active:scale-95"
                  title="O'chirish"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
