"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isAuthorized: boolean;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isStaff: false,
  isAuthorized: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- SINGLE SOURCE OF TRUTH FOR PERMISSIONS ---
  const ADMIN_EMAILS = ["daler@gmail.com"];
  const STAFF_EMAILS = ["staff1@gmail.com", "staff2@gmail.com"];

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email);
  const isStaff = !!user?.email && STAFF_EMAILS.includes(user.email);
  // Optional: isAnyStaff includes admins too
  const isAuthorized = isAdmin || isStaff;
  const logout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will automatically
      // set the user to null and trigger a re-render.
    } catch (error) {
      console.error("Logout hatosi:", error);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, isStaff, isAuthorized, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
