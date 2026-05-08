import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { ZoomProvider } from "@/context/ZoomContext";
import HeroSlider from "@/components/ui/HeroSilder";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import CartDrawer from "@/components/cart/CartDrawer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TokyoBrand",
  description: "Premium-Class Mahsulotlar",
  openGraph: {
    title: "TokyoBrand",
    description: "Premium-Class Mahsulotlar",
    url: "https://tokyobrand.vercel.app/",
    siteName: "TokyoBrand",
    images: [
      {
        url: "https://tokyobrand.vercel.app/a1.jpeg", // Must be an absolute URL
        width: 1200,
        height: 630,
        alt: "Premium Mahsulotlar",
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-gray-50 text-gray-900">
        {/* min-h-screen ensures the page is at least the height of the window */}
        <div className="flex flex-col min-h-screen">
          <ZoomProvider>
            {/* flex-grow pushes the footer to the bottom if content is short */}
            <AuthProvider>
              <Navbar />
              <Toaster position="bottom-right" reverseOrder={false} />
              <CartDrawer />
              <main className="flex-grow">{children}</main>
            </AuthProvider>
            <Footer />
          </ZoomProvider>
        </div>
      </body>
    </html>
  );
}
