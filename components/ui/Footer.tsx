import Link from "next/link";
import {
  FaTelegramPlane,
  FaFacebookF,
  FaInstagram,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { SiLine } from "react-icons/si";

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
              Adidas
            </h2>
            <p className="text-sm leading-relaxed max-w-xs text-gray-400">
              Yaponiyadan brend poyabzal va kiyimlarni kafolatlangan holda
              yetkazib beramiz.{" "}
            </p>
          </div>

          {/* Address & Phone */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Contact Us
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
              Follow Our Channel
            </h3>
            <div className="flex items-center gap-2">
              <a
                href="https://t.me/yourchannel"
                target="_blank"
                className={socialLinkStyle}
                aria-label="Telegram"
              >
                <FaTelegramPlane size={20} />
              </a>
              <a
                href="https://line.me/ti/p/yourid"
                target="_blank"
                className={socialLinkStyle}
                aria-label="Line"
              >
                <SiLine size={20} />
              </a>
              <a
                href="https://facebook.com/yourpage"
                target="_blank"
                className={socialLinkStyle}
                aria-label="Facebook"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="https://instagram.com/yourprofile"
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
