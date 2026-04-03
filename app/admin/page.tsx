"use client";
import { doc, onSnapshot } from "firebase/firestore";
import { uploadSliderImage, deleteSliderImage } from "@/lib/firestore";
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
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dbBrands, setDbBrands] = useState<FirestoreItem[]>([]);
  const [dbCategories, setDbCategories] = useState<FirestoreItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDelToast, setShowDelToast] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateProduct>({
    name: "",
    price: "",
    image: null,
    brand: "",
    category: "",
    gender: "male",
    sizes: [] as string[],
  });

  // Real-time listeners for the Product Form selects
  useEffect(() => {
    const unsubBrands = subscribeToCollection("brands", setDbBrands);
    const unsubCats = subscribeToCollection("categories", setDbCategories);
    return () => {
      unsubBrands();
      unsubCats();
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);
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
      setProducts((prevProducts) => [savedProduct as Product, ...prevProducts]);
      setForm({
        name: "",
        price: "",
        brand: "",
        category: "",
        gender: "male",
        sizes: [],
        image: null,
      });
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
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      setDeletingId(product.id);
      try {
        await deleteProduct(product);
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setShowDelToast(true);
        setTimeout(() => setShowDelToast(false), 3000);
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (authLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminHeader />
      <div className="p-8 space-y-8 bg-white border-b border-gray-100">
        <ManagementSection
          title="Categories"
          collectionName="categories"
          placeholder="e.g. Sneakers"
          isCategorySection={true} // Special flag for gendered buttons
        />
        <ManagementSection
          title="Brands"
          collectionName="brands"
          placeholder="e.g. Nike"
          isCategorySection={false}
        />
      </div>

      <main className="max-w-3xl mx-auto p-6 mt-10">
        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
          <header className="mb-8 border-b border-gray-100 pb-4">
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Add New Product
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Product Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <InputField
                label="Price ($)"
                name="price"
                type="number"
                value={form.price}
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
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none"
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

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  {dbCategories
                    .filter((c: any) => c.gender === form.gender) // Filters based on selected gender above
                    .map((c) => (
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
                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Product Gallery ({imageFiles.length})
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-black file:text-white"
              />
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
                      >
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
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
  isCategorySection?: boolean;
}

function ManagementSection({
  title,
  collectionName,
  placeholder,
  isCategorySection,
}: ManagementSectionProps) {
  const [items, setItems] = useState<FirestoreItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(collectionName, (data) =>
      setItems(data)
    );
    return () => unsubscribe();
  }, [collectionName]);

  // Modified to accept gender
  // const handleAddItem = async (gender?: "male" | "female") => {
  //   if (!inputValue) return;
  //   setLoading(true);
  //   try {
  //     // If category section, pass gender, otherwise pass undefined
  //     await addItem(collectionName, inputValue, gender);
  //     setInputValue("");
  //   } catch (error) {
  //     console.error("Error adding:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleAddItem = async (gender?: "male" | "female") => {
    if (!inputValue) return;
    setLoading(true);
    try {
      // This will now accept "male", "female", or undefined (for Brands)
      await addItem(collectionName, inputValue, gender);
      setInputValue("");
    } catch (error) {
      console.error("Error adding:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (confirm(`Delete this ${title.slice(0, -1)}?`)) {
      try {
        await deleteItem(collectionName, id);
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-gray-900">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-6">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            New {title.slice(0, -1)} Name
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none transition-all"
          />
        </div>

        <div className="flex gap-2">
          {isCategorySection ? (
            <>
              <button
                type="button"
                onClick={() => handleAddItem("male")}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 disabled:bg-gray-300"
              >
                + Male
              </button>
              <button
                type="button"
                onClick={() => handleAddItem("female")}
                disabled={loading}
                className="bg-pink-600 text-white px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-pink-700 disabled:bg-gray-300"
              >
                + Female
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleAddItem()}
              disabled={loading}
              className="bg-black text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-300"
            >
              {loading ? "Adding..." : `Add ${title.slice(0, -1)}`}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item: any) => (
          <div
            key={item.id}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-full group transition-all ${
              item.gender === "female"
                ? "border-pink-100 bg-pink-50"
                : item.gender === "male"
                ? "border-blue-100 bg-blue-50"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <span className="text-s text-gray-700 tracking-tight">
              {item.name}{" "}
              {item.gender && (
                <span className="opacity-30 ml-1">({item.gender[0]})</span>
              )}
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-gray-400 hover:text-red-600"
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
    </div>
  );
}
