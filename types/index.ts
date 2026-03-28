export type Product = {
  id: string;
  name: string;
  price: number;
  image: string; // ✅ final stored URL
  brand: string;
  category: string;
  gender: "male" | "female";
  sizes: string[];
};

export type CreateProduct = {
  name: string;
  price: string;
  image: File | null; // ✅ form input
  brand: string;
  category: string;
  gender: "male" | "female";
  sizes: string[];
};
