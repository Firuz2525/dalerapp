import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { BRANDS } from "@/lib/constants";
import { notFound } from "next/navigation";

// Use Promise for params in Next.js 15/16
interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  // Await the params before accessing slug
  const { slug } = await params;

  if (!slug) return notFound();

  // Find matching brand from your constants
  const currentBrand = BRANDS.find(
    (b) => b.toLowerCase() === slug.toLowerCase()
  );

  if (!currentBrand) {
    notFound();
  }

  const filteredProducts = products.filter(
    (product) => product.brand.toLowerCase() === currentBrand.toLowerCase()
  );

  return (
    <main className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 border-b border-gray-100 pb-6">
        <nav className="text-xs text-gray-400 uppercase tracking-widest mb-2">
          Brands / {currentBrand}
        </nav>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          {currentBrand}
        </h1>
        <p className="text-gray-500 mt-2">
          Showing {filteredProducts.length} items from {currentBrand}.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-up"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationFillMode: "both",
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </main>
  );
}
