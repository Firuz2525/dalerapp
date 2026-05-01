"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/orders"); // Redirect to admin after success
    } catch (err: any) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            onChange={(e: any) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="Password"
            type="password"
            onChange={(e: any) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit">Login</Button>
        </form>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth, db } from "@/lib/firebase";
// import { doc, setDoc } from "firebase/firestore";
// import { useAuth } from "@/context/AuthContext";
// import toast from "react-hot-toast";

// export default function StaffManager() {
//   const { role } = useAuth();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Block non-admins from even seeing the logic
//   // if (role !== "admin") return null;

//   const handleCreateStaff = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // 1. Create the user in Firebase Auth
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const newUser = userCredential.user;

//       // 2. Create the role document in Firestore
//       await setDoc(doc(db, "users", newUser.uid), {
//         email: newUser.email,
//         role: "staff", // Force role as staff
//         createdAt: new Date().toISOString(),
//       });

//       toast.success("Yangi xodim muvaffaqiyatli qo'shildi!");
//       setEmail("");
//       setPassword("");
//     } catch (err: any) {
//       console.error(err);
//       toast.error("Xatolik: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mt-10 p-6 border-4 border-black bg-gray-50">
//       <h2 className="font-black uppercase text-lg mb-4">
//         Yangi Xodim Qo'shish
//       </h2>
//       <form onSubmit={handleCreateStaff} className="space-y-4">
//         <input
//           type="email"
//           placeholder="Xodim emaili"
//           className="w-full p-2 border-2 border-black"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Parol"
//           className="w-full p-2 border-2 border-black"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-black text-white py-3 font-black uppercase hover:bg-zinc-800 disabled:bg-gray-400"
//         >
//           {loading ? "YUKLANMOQDA..." : "XODIMNI RO'YXATDAN O'TKAZISH"}
//         </button>
//       </form>
//     </div>
//   );
// }
// import InputField from "@/components/ui/InputField";
// import Button from "@/components/ui/Button";

// export default function LoginPage() {
//   return (
//     <div className="flex items-center justify-center min-h-[80vh] px-4">
//       <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-sm">
//         <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

//         <form className="space-y-4">
//           <InputField
//             label="Email"
//             type="email"
//             placeholder="Enter your email"
//           />

//           <InputField
//             label="Password"
//             type="password"
//             placeholder="Enter your password"
//           />

//           <Button type="submit">Login</Button>
//         </form>
//       </div>
//     </div>
//   );
// }
