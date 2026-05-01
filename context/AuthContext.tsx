// "use client";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { auth, db } from "@/lib/firebase"; // Make sure db is exported from your firebase config
// import { doc, getDoc } from "firebase/firestore";

// // Added 'role' to the context type definition
// const AuthContext = createContext<{
//   user: User | null;
//   role: string | null;
//   loading: boolean;
// }>({
//   user: null,
//   role: null,
//   loading: true,
// });

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         setUser(firebaseUser);

//         // Fetch the user's role from the 'users' collection
//         try {
//           const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
//           if (userDoc.exists()) {
//             setRole(userDoc.data().role || "staff"); // Default to staff if no role found
//           } else {
//             setRole("staff");
//           }
//         } catch (error) {
//           console.error("Error fetching user role:", error);
//           setRole(null);
//         }
//       } else {
//         setUser(null);
//         setRole(null);
//       }

//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, role, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
