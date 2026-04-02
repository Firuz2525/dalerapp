import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { ZoomProvider } from "@/context/ZoomContext";
import HeroSlider from "@/components/ui/HeroSilder";
import { AuthProvider } from "@/context/AuthContext";
export const metadata = {
  title: "E-Commerce App",
  description: "Modern e-commerce built with Next.js",
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
            {" "}
            <Navbar />
            {/* flex-grow pushes the footer to the bottom if content is short */}
            <AuthProvider>
              <main className="flex-grow">{children}</main>
            </AuthProvider>
            <Footer />
          </ZoomProvider>
        </div>
      </body>
    </html>
  );
}
