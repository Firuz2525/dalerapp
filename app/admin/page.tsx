"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Components
import AdminHeader from "@/components/admin/AdminHeader";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import Toast from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";

// Constants & Types
import { Product, CreateProduct } from "@/types";
import { SIZES, CATEGORIES, BRANDS } from "@/lib/constants";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State for Product Management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Form State
  const [form, setForm] = useState<CreateProduct>({
    name: "",
    price: "",
    image: null,
    brand: "",
    category: "",
    gender: "male",
    sizes: [] as string[],
  });

  // 1. Protection Logic: Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Form Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, image: file });
  };

  const handleSizeToggle = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate Database Upload (Replace this with Firebase Firestore later)
    setTimeout(() => {
      let imageUrl = "/sport.jpg";
      if (form.image) {
        imageUrl = URL.createObjectURL(form.image);
      }

      const newProduct: Product = {
        id: Date.now().toString(),
        name: form.name,
        price: Number(form.price),
        image: imageUrl,
        brand: form.brand,
        category: form.category,
        gender: form.gender,
        sizes: form.sizes,
      };

      setProducts((prev) => [newProduct, ...prev]);
      setLoading(false);
      setShowToast(true);

      // Reset Form
      setForm({
        name: "",
        price: "",
        image: null,
        brand: "",
        category: "",
        gender: "male",
        sizes: [],
      });

      setTimeout(() => setShowToast(false), 2000);
    }, 1000);
  };

  // 3. Render Logic
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminHeader />

      <main className="max-w-3xl mx-auto p-6 mt-10">
        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
          <header className="mb-8 border-b border-gray-100 pb-4">
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Add New Product
            </h1>
            <p className="text-gray-400 text-sm">
              Upload details for the Japan collection.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Product Name"
                name="name"
                value={form.name}
                placeholder="e.g. Oversized Cotton Tee"
                onChange={handleChange}
                required
              />
              <InputField
                label="Price ($)"
                name="price"
                type="number"
                value={form.price}
                placeholder="99.00"
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Brand
                </label>
                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                  required
                >
                  <option value="">Select Brand</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
              />
              {form.image && (
                <div className="relative w-32 h-32 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(form.image)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Available Sizes
              </p>
              <div className="flex gap-2">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`w-12 h-10 border text-xs font-bold transition-all ${
                      form.sizes.includes(size)
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-400 border-gray-200 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              {loading ? (
                <Spinner />
              ) : (
                <Button type="submit">Add to Catalog</Button>
              )}
            </div>
          </form>
        </div>

        {/* Real-time Preview Section */}
        <section className="mt-16">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6 border-b pb-2">
            Recently Added Products
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {products.length === 0 && (
              <p className="text-gray-300 italic text-sm text-center py-10">
                No products added yet.
              </p>
            )}
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-100 p-4 flex items-center justify-between rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.image}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-400 uppercase tracking-tighter">
                      {p.brand} • ${p.price}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {p.sizes.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] bg-gray-50 px-1 border border-gray-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showToast && <Toast message="Product added successfully!" />}
    </div>
  );
}
