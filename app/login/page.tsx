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
      router.push("/admin"); // Redirect to admin after success
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
