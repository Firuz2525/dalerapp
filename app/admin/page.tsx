"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getProducts,
  deleteProduct,
  addProductWithGallery,
  FirestoreItem,
} from "@/lib/firestore";
import { subscribeToCollection, addItem, deleteItem } from "@/lib/firestore";
// Components
import AdminHeader from "@/components/admin/AdminHeader";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import Toast from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";

// Constants & Types
import { Product, CreateProduct } from "@/types";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dbBrands, setDbBrands] = useState<FirestoreItem[]>([]);
  const [dbCategories, setDbCategories] = useState<FirestoreItem[]>([]);
  // State for Product Management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDelToast, setShowDelToast] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
  // Fetch Brands in Real-time
  useEffect(() => {
    const unsubscribe = subscribeToCollection("brands", (data) => {
      setDbBrands(data);
    });
    return () => unsubscribe();
  }, []);
  // Fetch Categories in Real-time
  useEffect(() => {
    const unsubscribe = subscribeToCollection("categories", (data) => {
      setDbCategories(data);
    });
    return () => unsubscribe();
  }, []);
  // Load products from Firebase on page load
  useEffect(() => {
    const loadData = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    loadData();
  }, []);

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
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]); // Append new images
    }
  };
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newProductData = { ...form, price: Number(form.price) };

      const savedProduct = await addProductWithGallery(
        newProductData,
        imageFiles
      );

      // KEY STEP: Add the new product to the START of the array
      // This is the functional equivalent of 'unshift' but safe for React state
      setProducts((prevProducts) => [savedProduct as Product, ...prevProducts]);

      setForm({
        name: "",
        price: "",
        brand: "",
        category: "",
        gender: "male",
        sizes: [],
        image: null, // <--- ADD THIS to satisfy the 'CreateProduct' type
      });

      // Also clear your separate gallery state
      setImageFiles([]);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (product: Product) => {
    // Accept whole product
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      setDeletingId(product.id);

      try {
        // Pass the product object so we have the image URLs
        await deleteProduct(product);

        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setShowDelToast(true);
        setTimeout(() => setShowDelToast(false), 3000);
      } catch (err) {
        console.error(err);
        alert("Delete failed. Check console for details.");
      } finally {
        setDeletingId(null);
      }
    }
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
      <div className="p-8 space-y-2 bg-white">
        <ManagementSection
          title="Categories"
          collectionName="categories"
          placeholder="e.g. krasovka"
        />
        <hr className="border-gray-100" />
        <ManagementSection
          title="Brands"
          collectionName="brands"
          placeholder="e.g. adidas"
        />
      </div>
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

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BRAND SELECT */}
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
                  {dbBrands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORY SELECT */}
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
                  {dbCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
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

            {/* <div className="space-y-3">
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
            </div> */}
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Product Gallery ({imageFiles.length})
              </label>

              <input
                type="file"
                multiple // ALLOW MULTIPLE
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-black file:text-white hover:file:bg-gray-800"
              />

              {/* Preview Grid */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {imageFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478 48.784 48.784 0 00-3.622-.477V19.5a3 3 0 01-3 3h-9a3 3 0 01-3-3V6.216a48.74 48.74 0 00-3.622.477.75.75 0 11-.256-1.478 48.825 48.825 0 013.878-.512V4.478c0-1.333.772-2.52 2-2.972a48.19 48.19 0 017 0c1.228.452 2 1.639 2 2.972zM9 3.75a46.68 46.68 0 016 0v.151a47.16 47.16 0 00-6 0V3.75zm11.385 6.13a.75.75 0 01-.111 1.054l-.3.26a48.094 48.094 0 00-11.948 0l-.3-.26a.75.75 0 11.943-1.165l.3.26a46.59 46.59 0 0111.948 0l.3-.26a.75.75 0 011.054.111z"
                          clipRule="evenodd"
                        />
                        <path d="M9.504 19.725a.75.75 0 001.053-.11l1.75-2a.75.75 0 10-1.126-.99l-1.75 2a.75.75 0 00.111 1.054zm5.103-2.11a.75.75 0 10-1.126.99l1.75 2a.75.75 0 101.126-.99l-1.75-2z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* <div className="space-y-3">
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
            </div> */}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="group flex items-center justify-between p-2 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* 1. SMALL FIXED IMAGE (40x40) */}
                    <div className="w-10 h-10 bg-gray-50 rounded flex-shrink-0 overflow-hidden border border-gray-50">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[8px] text-gray-400 font-bold uppercase">
                          No Img
                        </div>
                      )}
                    </div>

                    {/* 2. COMPACT TEXT (Truncated to prevent breaking layout) */}
                    <div className="truncate">
                      <h3 className="text-[11px] font-bold text-gray-900 truncate uppercase tracking-tight">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium text-gray-500">
                          ${p.price}
                        </span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                          {p.brand || "Japan"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. ACTION BUTTONS */}
                  <div className="flex items-center gap-1 pl-2">
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30"
                      title="Delete Product"
                    >
                      {deletingId === p.id ? (
                        <div className="w-3 h-3 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {showToast && <Toast message="Product added successfully!" />}
      {showDelToast && <Toast message="Product deleted successfully!" />}
    </div>
  );
}

interface ManagementSectionProps {
  title: string;
  collectionName: string;
  placeholder: string;
}

function ManagementSection({
  title,
  collectionName,
  placeholder,
}: ManagementSectionProps) {
  // Use the interface we created above for the state
  const [items, setItems] = useState<FirestoreItem[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // Real-time listener
  useEffect(() => {
    const unsubscribe = subscribeToCollection(collectionName, (data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, [collectionName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue) return;

    setLoading(true);
    try {
      await addItem(collectionName, inputValue);
      setInputValue("");
    } catch (error) {
      console.error("Error adding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(`Are you sure you want to delete this ${title.slice(0, -1)}?`)
    ) {
      try {
        await deleteItem(collectionName, id);
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-1 text-gray-800">
        {title} Management
      </h2>

      {/* Form styled exactly like your snippet */}
      <form onSubmit={handleSubmit} className=" mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              New {title.slice(0, -1)} Name
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none transition-all"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Adding..." : `Add ${title.slice(0, -1)}`}
            </button>
          </div>
        </div>
      </form>

      {/* Real-time List Display */}
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-2 py-2 rounded-full group hover:border-black transition-all"
          >
            <span className="text-sm font-medium text-gray-700">
              {item.name}
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-gray-400 hover:text-red-600 transition-colors"
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
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            No {title.toLowerCase()} added yet.
          </p>
        )}
      </div>
    </div>
  );
}
