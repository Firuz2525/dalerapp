export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[]; // Change 'image' to 'images' (plural array)
  brand: string;
  category: string;
  gender: "male" | "female";
  sizes: string[];
}
export type CreateProduct = {
  name: string;
  price: string;
  image: File | null; // ✅ form input
  brand: string;
  category: string;
  gender: "male" | "female";
  sizes: string[];
};
