// "use client";

// import { useState, useEffect } from "react";
// import { doc, onSnapshot } from "firebase/firestore";
// import { db } from "@/lib/firestore";
// import { uploadSliderImage, deleteSliderImage } from "@/lib/firestore";

// export default function SliderManager() {
//   const [sliderData, setSliderData] = useState<any>({});
//   const [loadingSlot, setLoadingSlot] = useState<number | null>(null);

//   // Listen to slider settings in real-time
//   useEffect(() => {
//     const unsub = onSnapshot(doc(db, "settings", "slider"), (doc) => {
//       if (doc.exists()) setSliderData(doc.data());
//     });
//     return () => unsub();
//   }, []);

//   const handleFileChange = async (
//     slot: number,
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setLoadingSlot(slot);
//     try {
//       await uploadSliderImage(slot, file);
//     } catch (error) {
//       console.error("Upload failed:", error);
//     } finally {
//       setLoadingSlot(null);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
//       <h2 className="text-xl font-black uppercase tracking-tighter mb-6">
//         Hero Slider <span className="text-red-600">Management</span>
//       </h2>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {[1, 2, 3].map((slot) => (
//           <div key={slot} className="space-y-4 border p-4 rounded-xl relative">
//             <div className="flex justify-between items-center">
//               <span className="text-xs font-bold uppercase text-gray-400">
//                 Slot {slot}
//               </span>
//               {sliderData[`image${slot}`] && (
//                 <button
//                   onClick={() => deleteSliderImage(slot)}
//                   className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 font-bold uppercase"
//                 >
//                   Delete
//                 </button>
//               )}
//             </div>

//             {/* Preview Area */}
//             <div className="aspect-[16/9] w-full bg-gray-50 rounded-lg overflow-hidden border border-dashed border-gray-200 flex items-center justify-center">
//               {sliderData[`image${slot}`] ? (
//                 <img
//                   src={sliderData[`image${slot}`]}
//                   alt={`Slot ${slot}`}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <span className="text-gray-300 text-xs uppercase font-medium">
//                   Empty
//                 </span>
//               )}
//             </div>

//             {/* Upload Input */}
//             <label className="block">
//               <span className="sr-only">Choose file</span>
//               <input
//                 type="file"
//                 accept="image/*"
//                 disabled={loadingSlot === slot}
//                 onChange={(e) => handleFileChange(slot, e)}
//                 className="block w-full text-xs text-gray-500
//                   file:mr-4 file:py-2 file:px-4
//                   file:rounded-full file:border-0
//                   file:text-xs file:font-semibold
//                   file:bg-black file:text-white
//                   hover:file:bg-gray-800 cursor-pointer
//                   disabled:opacity-50"
//               />
//             </label>

//             {loadingSlot === slot && (
//               <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
//                 <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
