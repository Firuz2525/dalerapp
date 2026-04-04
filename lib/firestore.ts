// import { storage, db } from "./firebase";
// import {
//   serverTimestamp,
//   addDoc,
//   deleteDoc,
//   doc,
//   updateDoc,
//   collection,
//   query,
//   orderBy,
//   limit,
//   getDocs,
//   startAfter,
//   DocumentData,
//   QueryDocumentSnapshot,
//   onSnapshot,
//   where,
// } from "firebase/firestore";
// import { Product } from "@/types";
// import {
//   ref,
//   uploadBytes,
//   getDownloadURL,
//   deleteObject,
// } from "firebase/storage";

// // The 'products/' folder here must match the match /products/ in your rules
// const COLLECTION_NAME = "products";
// // Ensure this points to your firebase config

// // Define an interface for your items
// export interface FirestoreItem {
//   id: string;
//   name: string;
//   createdAt?: Date;
// }

// // Add ': string' to collectionName and ': (items: FirestoreItem[]) => void' to the callback
// export const subscribeToCollection = (
//   collectionName: string,
//   callback: (items: FirestoreItem[]) => void
// ) => {
//   const q = query(collection(db, collectionName), orderBy("name", "asc"));

//   return onSnapshot(q, (snapshot) => {
//     const items = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as FirestoreItem[]; // Cast the result to your interface

//     callback(items);
//   });
// };

// export const addItem = async (collectionName: string, name: string) => {
//   await addDoc(collection(db, collectionName), {
//     name: name.trim(),
//     createdAt: new Date(),
//   });
// };

// export const deleteItem = async (collectionName: string, id: string) => {
//   await deleteDoc(doc(db, collectionName, id));
// };
// // CREATE: Add a new product
// export const addProduct = async (product: Omit<Product, "id">) => {
//   try {
//     const docRef = await addDoc(collection(db, COLLECTION_NAME), product);
//     return { id: docRef.id, ...product };
//   } catch (e) {
//     console.error("Error adding product: ", e);
//     throw e;
//   }
// };

// // Define an interface for the arguments to keep TypeScript happy
// interface GetProductsPaginatedOptions {
//   lastVisible?: QueryDocumentSnapshot<DocumentData> | null;
//   gender?: string;
//   category?: string;
//   brand?: string;
//   pageSize?: number;
// }

// export const getProductsPaginated = async ({
//   lastVisible = null,
//   gender,
//   category,
//   brand,
//   pageSize = 10,
// }: GetProductsPaginatedOptions = {}) => {
//   // Default to empty object
//   const productsRef = collection(db, "products");

//   // 1. Build the base constraints
//   // Note: We MUST orderBy "createdAt" to use startAfter for pagination
//   let constraints: any[] = [orderBy("createdAt", "desc")];

//   // 2. Add dynamic filters if they are provided
//   if (gender) {
//     // This allows "Men" to also show "Unisex" items
//     constraints.push(where("gender", "in", [gender.toLowerCase(), "unisex"]));
//   }

//   if (category) {
//     constraints.push(where("category", "==", category));
//   }
//   if (brand) constraints.push(where("brand", "==", brand)); // Brand Filter
//   // 3. Handle Pagination Bookmark
//   if (lastVisible) {
//     constraints.push(startAfter(lastVisible));
//   }

//   // 4. Set the limit
//   constraints.push(limit(pageSize));

//   // 5. Finalize and run the query
//   const q = query(productsRef, ...constraints);
//   const querySnapshot = await getDocs(q);

//   // Identify the last document for the next page
//   const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

//   // Map and sanitize the data (converting Timestamps to Strings)
//   const products = querySnapshot.docs.map((doc) => {
//     // 1. Tell TS that data is a Product (excluding the id)
//     const data = doc.data() as Omit<Product, "id">;

//     return {
//       ...data, // Now TS knows name, price, images, etc. are here
//       id: doc.id,
//       // 2. Sanitize the timestamp
//       createdAt: (data as any).createdAt?.toDate?.()?.toISOString() || null,
//     };
//   }) as Product[]; // 3. Final cast to the full Product array

//   return { products, lastDoc };
// };

// // export const getProductsPaginated = async (
// //   lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
// // ) => {
// //   const productsRef = collection(db, "products");

// //   // 1. Build the query
// //   let q = query(
// //     productsRef,
// //     orderBy("createdAt", "desc"),
// //     limit(10) // Let's load 8 at a time (2 rows of 4 on desktop)
// //   );

// //   // 2. If we have a 'bookmark', start the next query AFTER it
// //   if (lastVisible) {
// //     q = query(
// //       productsRef,
// //       orderBy("createdAt", "desc"),
// //       startAfter(lastVisible),
// //       limit(10)
// //     );
// //   }

// //   const querySnapshot = await getDocs(q);

// //   // 3. Identify the last document in this batch to use as the next "bookmark"
// //   const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

// //   const products = querySnapshot.docs.map((doc) => ({
// //     id: doc.id,
// //     ...(doc.data() as Omit<Product, "id">),
// //   }));

// //   return { products, lastDoc };
// // };
// // Define an interface for the arguments

// export const getProducts = async () => {
//   const productsRef = collection(db, "products");
//   // Query: Order by 'createdAt' in Descending order (newest at top)
//   const q = query(productsRef, orderBy("createdAt", "desc"));

//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   })) as Product[];
// };
// // export const getProducts = async () => {
// //   const querySnapshot = await getDocs(collection(db, "products"));
// //   return querySnapshot.docs.map((doc) => {
// //     const data = doc.data();
// //     return {
// //       id: doc.id,
// //       ...data,
// //       // Automatically convert any timestamps to strings here
// //       createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
// //     };
// //   });
// // };
// // DELETE: Remove a product
// export const deleteProduct = async (product: Product) => {
//   try {
//     // 1. Delete all images from Firebase Storage
//     if (product.images && product.images.length > 0) {
//       const deleteImagePromises = product.images.map((url) => {
//         // Create a reference to the file using the URL
//         const imageRef = ref(storage, url);
//         return deleteObject(imageRef);
//       });

//       // Wait for all images to be deleted
//       await Promise.all(deleteImagePromises);
//     }

//     // 2. Delete the Firestore document
//     const productRef = doc(db, "products", product.id);
//     await deleteDoc(productRef);
//   } catch (error) {
//     console.error("Error deleting product and images:", error);
//     throw error;
//   }
// };
// // UPDATE: Edit an existing product
// export const editProduct = async (
//   id: string,
//   updatedData: Partial<Product>
// ) => {
//   try {
//     const productRef = doc(db, COLLECTION_NAME, id);
//     await updateDoc(productRef, updatedData);
//   } catch (e) {
//     console.error("Error updating product: ", e);
//     throw e;
//   }
// };

// export const uploadProductGallery = async (files: File[]) => {
//   // Map every file to an upload promise
//   const uploadPromises = files.map(async (file) => {
//     const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
//     const snapshot = await uploadBytes(storageRef, file);
//     return await getDownloadURL(snapshot.ref);
//   });

//   // Run all uploads in parallel
//   const urls = await Promise.all(uploadPromises);
//   return urls; // Returns array of permanent URLs
// };

// export const addProductWithGallery = async (
//   productData: any,
//   imageFiles: File[]
// ) => {
//   const imageUrls = await uploadProductGallery(imageFiles);

//   const docRef = await addDoc(collection(db, "products"), {
//     ...productData,
//     images: imageUrls,
//     createdAt: serverTimestamp(), // This ensures the DB knows exactly when it arrived
//   });

//   // Return the data with a temporary local timestamp for the UI
//   return {
//     id: docRef.id,
//     ...productData,
//     images: imageUrls,
//     createdAt: new Date(),
//   };
// };

// export const getCategories = async () => {
//   const snapshot = await getDocs(collection(db, "categories"));
//   return snapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   })) as { id: string; name: string }[];
// };

import {
  serverTimestamp,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot,
  where,
  setDoc,
} from "firebase/firestore";
import { Product } from "@/types";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

const COLLECTION_NAME = "products";

// --- INTERFACES ---

export interface FirestoreItem {
  id: string;
  name: string;
  gender: "male" | "female";
  createdAt?: Date;
}

// FIX: Define this interface ABOVE the function using it
export interface GetProductsPaginatedOptions {
  lastVisible?: QueryDocumentSnapshot<DocumentData> | null;
  gender?: string;
  category?: string;
  brand?: string;
  pageSize?: number;
}

// --- FUNCTIONS ---

export const subscribeToCollection = (
  collectionName: string,
  callback: (items: FirestoreItem[]) => void
) => {
  const q = query(collection(db, collectionName), orderBy("name", "asc"));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirestoreItem[];
    callback(items);
  });
};

export const addItem = async (
  collectionName: string,
  name: string,
  gender?: "male" | "female" // Add the '?' here
) => {
  // Create the base data object
  const data: any = {
    name: name.trim(),
    createdAt: serverTimestamp(),
  };

  // Only add the gender field if it was actually provided
  if (gender) {
    data.gender = gender;
  }

  await addDoc(collection(db, collectionName), data);
};

export const deleteItem = async (collectionName: string, id: string) => {
  await deleteDoc(doc(db, collectionName, id));
};

export const addProduct = async (product: Omit<Product, "id">) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), product);
    return { id: docRef.id, ...product };
  } catch (e) {
    console.error("Error adding product: ", e);
    throw e;
  }
};

/**
 * Optimized Pagination supporting Gender, Category, and Brand filters
 */
export const getProductsPaginated = async ({
  lastVisible = null,
  gender,
  category,
  brand,
  pageSize = 10,
}: GetProductsPaginatedOptions = {}) => {
  const productsRef = collection(db, "products");

  let constraints: any[] = [orderBy("createdAt", "desc")];

  if (gender) {
    // Matches specific gender or items marked as unisex
    constraints.push(where("gender", "in", [gender.toLowerCase(), "unisex"]));
  }

  if (category) {
    constraints.push(where("category", "==", category));
  }

  if (brand) {
    constraints.push(where("brand", "==", brand));
  }

  if (lastVisible) {
    constraints.push(startAfter(lastVisible));
  }
  constraints.push(limit(pageSize));

  const q = query(productsRef, ...constraints);
  const querySnapshot = await getDocs(q);

  const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  const products = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...(data as Omit<Product, "id">),
      id: doc.id,
      // Convert Timestamp to ISO String for Next.js serialization
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : null,
    } as Product;
  });

  return { products, lastDoc };
};

/**
 * Standard fetch (Updated to fix the Plain Object/Timestamp error)
 */
export const getProducts = async () => {
  const productsRef = collection(db, "products");
  const q = query(productsRef, orderBy("createdAt", "desc"));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...(data as Omit<Product, "id">),
      id: doc.id,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : null,
    } as Product;
  });
};

export const deleteProduct = async (product: Product) => {
  try {
    if (product.images && product.images.length > 0) {
      const deleteImagePromises = product.images.map((url) => {
        const imageRef = ref(storage, url);
        return deleteObject(imageRef);
      });
      await Promise.all(deleteImagePromises);
    }
    const productRef = doc(db, "products", product.id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product and images:", error);
    throw error;
  }
};

export const editProduct = async (
  id: string,
  updatedData: Partial<Product>
) => {
  try {
    const productRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(productRef, updatedData);
  } catch (e) {
    console.error("Error updating product: ", e);
    throw e;
  }
};

export const uploadProductGallery = async (files: File[]) => {
  const uploadPromises = files.map(async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  });
  return await Promise.all(uploadPromises);
};

export const addProductWithGallery = async (
  productData: any,
  imageFiles: File[]
) => {
  const imageUrls = await uploadProductGallery(imageFiles);

  const docRef = await addDoc(collection(db, "products"), {
    ...productData,
    images: imageUrls,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...productData,
    images: imageUrls,
    createdAt: new Date().toISOString(), // Standardize with ISO string
  };
};

export const getCategories = async () => {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as { id: string; name: string }[];
};
