"use client";
import { doc, onSnapshot } from "firebase/firestore";
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
import SliderManagement from "@/components/ui/sliderManagement";

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
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const toggleTab = (tabName: string) => {
    setActiveTab(activeTab === tabName ? null : tabName);
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
      {/* ADMIN NAVIGATION BAR */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex gap-3 sticky top-0 z-20 shadow-sm overflow-x-auto">
        <TabButton
          label="Slider"
          active={activeTab === "slider"}
          onClick={() => toggleTab("slider")}
        />
        <TabButton
          label="Categories"
          active={activeTab === "categories"}
          onClick={() => toggleTab("categories")}
        />
        <TabButton
          label="Brands"
          active={activeTab === "brands"}
          onClick={() => toggleTab("brands")}
        />
        <div className="flex-1" /> {/* Spacer */}
        <TabButton
          label={`View All Products (${products.length})`}
          active={activeTab === "products"}
          onClick={() => toggleTab("products")}
          variant="outline"
        />
      </div>

      {/* TOP MANAGEMENT SECTIONS (Collapsible) */}
      <div className="bg-white border-b border-gray-100">
        {activeTab === "slider" && (
          <div className="p-8">
            <SliderManagement />
          </div>
        )}
        {activeTab === "categories" && (
          <div className="p-8">
            <ManagementSection
              title="Categories"
              collectionName="categories"
              placeholder="e.g. Sneakers"
              isCategorySection
            />
          </div>
        )}
        {activeTab === "brands" && (
          <div className="p-8">
            <ManagementSection
              title="Brands"
              collectionName="brands"
              placeholder="e.g. Nike"
            />
          </div>
        )}
      </div>

      {/* ALWAYS VISIBLE: ADD PRODUCT FORM */}
      <main className="max-w-3xl mx-auto p-6 mt-10">
        {/* ... Your Existing Add Product Form ... */}
      </main>

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
      {/* NEW SECTION: PRODUCT LIST BAR VIEW */}
      {activeTab === "products" && (
        <section className="max-w-5xl mx-auto p-6 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-tight">
              Product Catalog
            </h2>
            <button
              onClick={() => setActiveTab(null)}
              className="text-xs text-gray-400 hover:text-black"
            >
              Close List ✕
            </button>
          </div>

          <div className="space-y-2">
            {products.map((product) => (
              <ProductBarRow
                key={product.id}
                product={product}
                isDeleting={deletingId === product.id}
                onDelete={() => handleDelete(product)}
              />
            ))}
          </div>
        </section>
      )}
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

function TabButton({ label, active, onClick, variant = "default" }: any) {
  const baseStyles =
    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap";
  const activeStyles = active
    ? "bg-black text-white shadow-md scale-105"
    : "bg-gray-100 text-gray-500 hover:bg-gray-200";
  const outlineStyles =
    variant === "outline" && !active
      ? "border border-gray-200 text-gray-600 bg-transparent hover:bg-black hover:text-white"
      : "";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${activeStyles} ${outlineStyles}`}
    >
      {label}
    </button>
  );
}
function ProductBarRow({
  product,
  onDelete,
  isDeleting,
}: {
  product: Product;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-all shadow-sm group">
      {/* Tiny Thumbnail */}
      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
            No Img
          </div>
        )}
      </div>

      {/* Info Block */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div>
          <p className="text-sm font-bold text-gray-900 truncate">
            {product.name}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            {product.brand}
          </p>
        </div>

        <div className="hidden md:block">
          <span
            className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
              product.gender === "male"
                ? "bg-blue-50 text-blue-600"
                : "bg-pink-50 text-pink-600"
            }`}
          >
            {product.gender}
          </span>
        </div>

        <div className="text-right md:text-left">
          <p className="text-sm font-black text-gray-900">${product.price}</p>
        </div>

        {/* Delete Button */}
        <div className="flex justify-end">
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Spinner />
            ) : (
              <svg
                className="w-5 h-5"
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
    </div>
  );
}
