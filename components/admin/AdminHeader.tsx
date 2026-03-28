"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminHeader() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="w-full bg-gray-900 text-white py-2 px-6 flex justify-between items-center sticky top-16 z-40 shadow-md">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Admin Mode
        </span>
        <div className="h-3 w-px bg-gray-700" />

        <Link
          href="/"
          className="text-xs font-bold hover:text-gray-300 transition-colors"
        >
          View Store
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="text-[10px] font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-all"
      >
        Logout
      </button>
    </div>
  );
}
