// import { products } from "@/data/products";
// import Image from "next/image";

// type Props = {
//   params: Promise<{
//     id: string;
//   }>;
// };

// export default async function ProductDetails({ params }: Props) {
//   const { id } = await params;

//   const product = products.find((p) => p.id === id);

//   if (!product) {
//     return <div className="p-6">Product not found</div>;
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <div className="grid md:grid-cols-2 gap-8">
//         <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
//           <Image
//             // src={product.image}
//             src="shoe.jpg"
//             alt={product.name}
//             width={300}
//             height={200}
//             priority={product.id === "1"}
//             className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
//           />
//         </div>

//         <div>
//           <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

//           <p className="text-xl text-gray-700 mb-4">${product.price}</p>

//           <p className="mb-2">
//             <span className="font-semibold">Brand:</span> {product.brand}
//           </p>

//           <p className="mb-2">
//             <span className="font-semibold">Category:</span> {product.category}
//           </p>

//           <p className="mb-4">
//             <span className="font-semibold">Gender:</span> {product.gender}
//           </p>

//           {/* Sizes */}
//           <div className="mb-6">
//             <p className="font-semibold mb-2">Select Size:</p>
//             <div className="flex gap-2 flex-wrap">
//               {product.sizes.map((size) => (
//                 <button
//                   key={size}
//                   className="border px-3 py-1 rounded hover:bg-black hover:text-white transition"
//                 >
//                   {size}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Add to Cart */}
//           {/* <button className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition">
//             Add to Cart
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// }
