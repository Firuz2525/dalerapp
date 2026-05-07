"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // Adjust based on your firebase config path
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useCartStore } from "@/context/useCartStore";
import toast from "react-hot-toast";

export default function OrderForm() {
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    social: "", // Instagram/Telegram
    city: "",
    address: "",
    size: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("customer_info");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    localStorage.setItem("customer_info", JSON.stringify(newData));
  };

  //   const handleSubmitOrder = async () => {
  //     if (!formData.name || !formData.phone || !formData.address) {
  //       toast.error("Iltimos, barcha maydonlarni to'ldiring!");
  //       return;
  //     }

  //     setLoading(true);
  //     try {
  //       const orderData = {
  //         customer: formData,
  //         // Map items to include the thumbnail image
  //         items: items.map((item) => ({
  //           id: item.id,
  //           name: item.name,
  //           price: item.price,
  //           quantity: item.quantity,
  //           brand: item.brand,
  //           // ✅ Add the thumbnail link here
  //           thumbnail:
  //             item.images && item.images.length > 0
  //               ? item.images[0]
  //               : "/placeholder.jpg",
  //         })),
  //         totalAmount: items.reduce(
  //           (acc, item) => acc + item.price * item.quantity,
  //           0
  //         ),
  //         status: "pending",
  //         createdAt: serverTimestamp(),
  //         localDate: new Date().toLocaleString("uz-UZ"),
  //       };

  //       await addDoc(collection(db, "orders"), orderData);

  //       toast.success("Buyurtmangiz qabul qilindi!");
  //       clearCart();
  //     } catch (error) {
  //       console.error("Order error:", error);
  //       toast.error("Xatolik yuz berdi.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  const handleSubmitOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    setLoading(true);
    try {
      // We create an array of promises, one for each product in the cart
      const orderPromises = items.map((item) => {
        const individualOrder = {
          customer: formData,
          // Individual product details
          productName: item.name,
          productBrand: item.brand,
          productPrice: item.price,
          productQuantity: item.quantity,
          productThumbnail: item.images?.[0] || "/placeholder.jpg",
          productId: item.id,
          productBts: "",

          // Metadata
          status: "pending",
          createdAt: serverTimestamp(),
          localDate: new Date().toLocaleString("uz-UZ"),
          // Total for THIS specific item (price * quantity)
          itemTotal: item.price * item.quantity,
        };

        return addDoc(collection(db, "orders"), individualOrder);
      });

      // Execute all submissions at once
      await Promise.all(orderPromises);

      toast.success("Buyurtmalaringiz qabul qilindi!");
      clearCart();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };
  const inputClass =
    "w-full bg-white border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors";

  return (
    <div className="space-y-3 mt-6 border-t pt-6">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
        Ma'lumotlaringiz
      </h3>

      <input
        name="name"
        placeholder="Ismingiz"
        value={formData.name}
        onChange={handleChange}
        className={inputClass}
        autoComplete="name"
      />
      <input
        name="phone"
        placeholder="Telefon raqamingiz"
        value={formData.phone}
        onChange={handleChange}
        className={inputClass}
        autoComplete="tel"
      />
      <input
        name="size"
        placeholder="o'lcham"
        value={formData.size}
        onChange={handleChange}
        className={inputClass}
        autoComplete="size"
      />
      <input
        name="social"
        placeholder="Instagram yoki Telegram"
        value={formData.social}
        onChange={handleChange}
        className={inputClass}
        autoComplete="telegram"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          name="city"
          placeholder="Shahar"
          value={formData.city}
          onChange={handleChange}
          className={inputClass}
          autoComplete="city"
        />
        <input
          name="address"
          placeholder="Manzil"
          value={formData.address}
          onChange={handleChange}
          className={inputClass}
          autoComplete="address-level2"
        />
      </div>

      <button
        disabled={loading || items.length === 0}
        onClick={handleSubmitOrder}
        className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 relative overflow-hidden"
      >
        {loading ? "Yuborilmoqda..." : "Rasmiylashtirish"}
      </button>
    </div>
  );
}
