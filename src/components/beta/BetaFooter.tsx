import React from "react";
import { Phone, Mail, Clock, MapPin, ExternalLink } from "lucide-react";

export interface BetaFooterProps {
  variant?: "default" | "minimal";
}

export const BetaFooter: React.FC<BetaFooterProps> = ({ variant = "default" }) => {
  if (variant === "minimal") {
    return (
      <footer className="bg-white border-t border-[#E7E5E4] mt-auto text-[#71717A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} ID Card Lampung • Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-[#18181B] transition-colors">Katalog</a>
            <span>•</span>
            <a href="/classic" className="hover:text-[#18181B] transition-colors">Versi Klasik</a>
            <span>•</span>
            <a href="/loker" className="hover:text-[#18181B] transition-colors">Lowongan Kerja</a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-[#E7E5E4] mt-auto text-[#52525B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/Logo id card lampung 1x1 transparan.png"
                alt="ID Card Lampung"
                className="w-8 h-8 object-contain"
              />
              <div className="leading-none">
                <span className="font-semibold text-base text-[#18181B] tracking-tight block">
                  ID Card Lampung
                </span>
                <span className="text-xs text-[#71717A]">Percetakan & Merchandise Lampung</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#71717A]">
              Pusat cetak ID Card Terdekat berkualitas, tali lanyard custom premium, plakat akrilik, dan aneka merchandise event di Bandar Lampung. Melayani pesanan satuan hingga ribuan pcs tanpa minimum order.
            </p>
          </div>

          {/* Column 2: Kontak & Layanan (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-semibold text-sm text-[#18181B] tracking-tight">Kontak & Layanan</h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#E8590C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#18181B] block">WhatsApp CS</span>
                  <a
                    href="https://wa.me/6285172157808"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E8590C] transition-colors"
                  >
                    +62 851-7215-7808
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#E8590C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#18181B] block">Email</span>
                  <a
                    href="mailto:cs@idcardlampung.com"
                    className="hover:text-[#E8590C] transition-colors"
                  >
                    cs@idcardlampung.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#E8590C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#18181B] block">Jam Operasional</span>
                  <span>Senin – Sabtu: 08.00 – 17.30 WIB</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 3: Google Maps Embed (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#18181B] tracking-tight flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#E8590C]" />
                <span>Lokasi Percetakan</span>
              </h3>
              <a
                href="https://maps.app.goo.gl/XVJYoKbzU5FRwVuJA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#E8590C] hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Google Maps Embed Frame */}
            <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-[#E7E5E4] bg-[#F5F5F4] shadow-xs">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248.27629567866182!2d105.31613618779917!3d-5.35258469048837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40dbe8e9453b63%3A0xb5127739986bb77f!2sID%20Card%20Lampung!5e0!3m2!1sen!2sid!4v1791358860628!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Peta Lokasi Percetakan ID Card Lampung Belwis"
                className="w-full h-full"
              />
            </div>

            <p className="text-[11px] sm:text-xs text-[#71717A] leading-relaxed">
              Perumahan Pemda (Belwis), Way Hui, Kec. Jati Agung, Lampung Selatan 35365
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-[#E7E5E4] mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
          <p>© {new Date().getFullYear()} ID Card Lampung • Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <a href="/classic" className="hover:text-[#18181B] transition-colors">Versi Klasik</a>
            <span>•</span>
            <a href="/loker" className="hover:text-[#18181B] transition-colors">Lowongan Kerja</a>
            <span>•</span>
            <a href="/hello" className="hover:text-[#18181B] transition-colors">Kontak</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BetaFooter;
