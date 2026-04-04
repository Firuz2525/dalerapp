import {
  FaTelegramPlane,
  FaInstagram,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  // Style for social icons on dark background
  const socialLinkStyle =
    "p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300";

  return (
    <footer
      id="footer"
      className="bg-[#152238] pt-12 pb-8 text-gray-300 scroll-mt-20"
    >
      {/* <footer id="footer" className="bg-[#152238] pt-12 pb-8 text-gray-300"> */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Section: Info & Message */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & Message */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Tokyo<b className="text-red-600">Brands</b>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs text-gray-400">
              Yaponiyadan faqat original mahsulotlarni yetkazib beramiz. Ishonch
              va sifat kafolatlanadi.
            </p>
            <p className="text-sm leading-relaxed max-w-xs text-gray-400">
              Отправляем из Японии только оригинальные товары. Гарантия качества
              и надежности.
            </p>
          </div>

          {/* Address & Phone */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <FaMapMarkerAlt className="mt-1 text-blue-400" />
                <p>
                  Ikebukuro, Toshimaku <br />
                  Tokyo, Japan
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FaPhoneAlt className="text-blue-400" />
                <p>+81 70 8415 4432</p>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Kanalimiz
            </h3>
            <div className="flex items-center gap-2">
              <a
                href="https://t.me/Daler095"
                target="_blank"
                className={socialLinkStyle}
                aria-label="Telegram"
              >
                <FaTelegramPlane size={20} />
              </a>
              <a
                href="https://www.instagram.com/tokyobrands?igsh=cDR5d3g0bWozbmIz&utm_source=qr"
                target="_blank"
                className={socialLinkStyle}
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
