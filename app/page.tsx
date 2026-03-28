import ProductCard from "@/components/product/ProductCard";
import HeroSlider from "@/components/ui/HeroSilder";
import { products } from "@/data/products";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <main className="p-4 md:p-8  backgc mx-auto min-h-screen">
        <div className="mb-10 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            New Arrivals
          </h1>
          <p className="text-gray-500 mt-2">
            Explore our latest collection from Japan.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-2">
          {products.map((product, index) => (
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
    </>
  );
}
