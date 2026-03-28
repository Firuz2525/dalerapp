// import ProductCard from "@/components/product/ProductCard";
// import { products } from "@/data/products";
// import { CATEGORIES } from "@/lib/constants";
// import { notFound } from "next/navigation";

// interface CategoryPageProps {
//   params: Promise<{ slug: string }>;
// }

// export default async function CategoryPage({ params }: CategoryPageProps) {
//   const { slug } = await params;

//   if (!slug) return notFound();

//   // Convert "running-shoes" back to "running shoes"
//   const decodedCategory = slug.replace(/-/g, " ");

//   // Validate against your CATEGORIES constant
//   const isValidCategory = CATEGORIES.some(
//     (cat) => cat.toLowerCase() === decodedCategory.toLowerCase()
//   );

//   if (!isValidCategory) {
//     notFound();
//   }

//   const filteredProducts = products.filter(
//     (product) =>
//       product.category.toLowerCase() === decodedCategory.toLowerCase()
//   );

//   return (
//     <main className="p-6 max-w-7xl mx-auto min-h-screen">
//       <div className="mb-10 border-b border-gray-100 pb-6">
//         <nav className="text-xs text-gray-400 uppercase tracking-widest mb-2">
//           Catalog / {decodedCategory}
//         </nav>
//         <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 capitalize">
//           {decodedCategory}
//         </h1>
//         <p className="text-gray-500 mt-2">
//           Discover our collection of {decodedCategory}.
//         </p>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {filteredProducts.map((product, index) => (
//           <div
//             key={product.id}
//             className="animate-fade-up"
//             style={{
//               animationDelay: `${index * 0.05}s`,
//               animationFillMode: "both",
//             }}
//           >
//             <ProductCard product={product} />
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }

// import ProductCard from "@/components/product/ProductCard";
// import { products } from "@/data/products";
// import { CATEGORIES, GENDERS } from "@/lib/constants";
// import { notFound } from "next/navigation";

// export default async function CategoryPage({
//   params,
// }: {
//   params: Promise<{ filter: string[] }>;
// }) {
//   const { filter } = await params;

//   let gender: string | null = null;
//   let categorySlug: string;

//   // URL: /categories/male/running-shoes -> filter = ["male", "running-shoes"]
//   // URL: /categories/running-shoes -> filter = ["running-shoes"]
//   if (filter.length === 2) {
//     gender = filter[0];
//     categorySlug = filter[1];
//   } else {
//     categorySlug = filter[0];
//   }

//   const decodedCategory = categorySlug.replace(/-/g, " ");

//   // Validation
//   if (gender && !GENDERS.includes(gender as any)) return notFound();
//   if (!CATEGORIES.includes(decodedCategory as any)) return notFound();

//   // The Master Filter
//   const filteredProducts = products.filter((p) => {
//     const categoryMatch =
//       p.category.toLowerCase() === decodedCategory.toLowerCase();
//     const genderMatch = gender
//       ? p.gender.toLowerCase() === gender.toLowerCase()
//       : true;
//     return categoryMatch && genderMatch;
//   });

//   return (
//     <main className="p-6 max-w-7xl mx-auto min-h-screen">
//       <div className="mb-10 border-b border-gray-100 pb-6">
//         <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 capitalize">
//           {gender ? `${gender}'s ` : ""}
//           {decodedCategory}
//         </h1>
//         <p className="text-gray-500 mt-2">
//           Showing {filteredProducts.length} items
//         </p>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//         {filteredProducts.map((product, index) => (
//           <div
//             key={product.id}
//             className="animate-fade-up"
//             style={{
//               animationDelay: `${index * 0.05}s`,
//               animationFillMode: "both",
//             }}
//           >
//             <ProductCard product={product} />
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }

import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { CATEGORIES, GENDERS } from "@/lib/constants";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ filter?: string[] }>;
}) {
  const { filter = [] } = await params;

  let gender: string | null = null;
  let categorySlug: string | null = null;

  /**
   * Logic for filter array:
   * [] -> All Products
   * ["men"] -> All Men's products
   * ["men", "shoes"] -> Men's Shoes
   * ["shoes"] -> All shoes (unisex/mixed)
   */
  if (filter.length >= 2) {
    gender = filter[0];
    categorySlug = filter[1];
  } else if (filter.length === 1) {
    // Check if the single segment is a gender or a category
    if (GENDERS.some((g) => g.toLowerCase() === filter[0].toLowerCase())) {
      gender = filter[0];
    } else {
      categorySlug = filter[0];
    }
  }

  const decodedCategory = categorySlug?.replace(/-/g, " ");

  // 1. Validation: If a gender is provided, must be valid.
  // If a category is provided, must exist in CATEGORIES.
  if (gender && !GENDERS.some((g) => g.toLowerCase() === gender?.toLowerCase()))
    return notFound();
  if (
    decodedCategory &&
    !CATEGORIES.some((c) => c.toLowerCase() === decodedCategory.toLowerCase())
  )
    return notFound();

  // 2. The Master Filter
  const filteredProducts = products.filter((p) => {
    const categoryMatch = decodedCategory
      ? p.category.toLowerCase() === decodedCategory.toLowerCase()
      : true;

    // Matches if no gender selected, OR if product gender matches,
    // OR if product is "unisex"
    const genderMatch = gender
      ? p.gender.toLowerCase() === gender.toLowerCase() ||
        p.gender.toLowerCase() === "unisex"
      : true;

    return categoryMatch && genderMatch;
  });

  // 3. UI Title Logic
  const displayTitle = () => {
    if (gender && decodedCategory) return `${gender}'s ${decodedCategory}`;
    if (gender) return `${gender}'s Collection`;
    if (decodedCategory) return decodedCategory;
    return "All Products";
  };

  return (
    <main className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 capitalize">
          {displayTitle()}
        </h1>
        <p className="text-gray-500 mt-2">
          {filteredProducts.length === 0
            ? "No items found in this section."
            : `Showing ${filteredProducts.length} items`}
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
      ) : (
        <div className="py-20 text-center text-gray-400">
          <p>Try checking another category or gender.</p>
        </div>
      )}
    </main>
  );
}
