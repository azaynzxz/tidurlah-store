import { BlogPostData } from "../index";
import { Check, Gift, Crown, Shield, Trophy, Receipt, Megaphone, CheckCircle2, Banknote } from "lucide-react";
const EasterPromoContent = () => {
  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto font-sans">
      {/* Intro Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Paket Sponsorship Event
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Pilih paket yang paling sesuai dengan kebutuhan event kampus atau komunitas Anda. Kami memberikan dukungan penuh dengan harga khusus dan bonus merchandise eksklusif.
        </p>
      </div>

      {/* Pricing Table */}
      <div className="overflow-x-auto pb-4">
        <div className="w-full min-w-[600px] md:min-w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 md:p-6 bg-slate-50 border-b border-r border-slate-200 w-1/3 md:w-1/4 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  <span className="text-sm md:text-lg font-bold text-slate-800">Item Benefit</span>
                </th>
                <th className="p-6 border-b border-slate-200 border-l border-slate-100 bg-white text-center w-1/4">
                  <div className="w-12 h-12 mx-auto bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="text-xl font-bold text-slate-900">Silver</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Order 1 - 49 pcs</div>
                </th>
                <th className="p-6 border-b border-amber-300 border-l border-slate-100 bg-gradient-to-b from-amber-50 to-amber-100/50 text-center w-1/4 relative">
                  <div className="absolute top-0 inset-x-0 h-1 bg-amber-400"></div>
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg tracking-wider">POPULER</div>
                  <div className="w-12 h-12 mx-auto bg-amber-200/50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="text-xl font-bold text-amber-900">Gold</div>
                  <div className="text-xs font-medium text-amber-700/70 mt-1">Order 50 - 100 pcs</div>
                </th>
                <th className="p-6 border-b border-slate-800 border-l border-slate-100 bg-slate-900 text-center w-1/4 relative text-white">
                  <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500"></div>
                  <div className="w-12 h-12 mx-auto bg-white/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div className="text-xl font-bold text-white">Platinum</div>
                  <div className="text-xs font-medium text-slate-400 mt-1">Order 101 - 150 pcs</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-3 md:p-5 font-semibold text-slate-700 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm">Lanyard 2 Sisi</td>
                <td className="p-3 md:p-5 text-center border-r border-slate-100 text-slate-600 text-xs md:text-sm"><s>20k</s> <span className="font-bold text-slate-900 ml-1">19k</span></td>
                <td className="p-3 md:p-5 text-center bg-amber-50/30 border-r border-slate-100 text-slate-600 text-xs md:text-sm"><s>20k</s> <span className="font-bold text-amber-900 ml-1">18k</span></td>
                <td className="p-3 md:p-5 text-center bg-slate-900 text-slate-400 text-xs md:text-sm"><s>20k</s> <span className="font-bold text-white ml-1">17k</span></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-3 md:p-5 font-semibold text-slate-700 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm">Lanyard 1 Sisi</td>
                <td className="p-3 md:p-5 text-center border-r border-slate-100 text-slate-600 text-xs md:text-sm"><s>17k</s> <span className="font-bold text-slate-900 ml-1">16k</span></td>
                <td className="p-3 md:p-5 text-center bg-amber-50/30 border-r border-slate-100 text-slate-600 text-xs md:text-sm"><s>17k</s> <span className="font-bold text-amber-900 ml-1">16k</span></td>
                <td className="p-3 md:p-5 text-center bg-slate-900 text-slate-400 text-xs md:text-sm"><s>17k</s> <span className="font-bold text-white ml-1">15k</span></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-3 md:p-5 font-semibold text-slate-700 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm">Stiker A3</td>
                <td className="p-3 md:p-5 text-center border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-slate-900">15k</span></td>
                <td className="p-3 md:p-5 text-center bg-amber-50/30 border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-amber-900">13k</span></td>
                <td className="p-3 md:p-5 text-center bg-slate-900 text-slate-400 text-xs md:text-sm"><span className="font-bold text-white">15k</span><br /><span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] md:text-xs font-bold rounded">FREE 1 LBR</span></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-3 md:p-5 font-semibold text-slate-700 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm">Ganci Akrilik</td>
                <td className="p-3 md:p-5 text-center border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-slate-900">9k</span> / pcs</td>
                <td className="p-3 md:p-5 text-center bg-amber-50/30 border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-amber-900">8k</span> / pcs</td>
                <td className="p-3 md:p-5 text-center bg-slate-900 text-slate-400 text-xs md:text-sm"><span className="font-bold text-white">7k</span> / pcs<br /><span className="text-[10px] md:text-xs text-indigo-300">Premium UV</span></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-3 md:p-5 font-semibold text-slate-700 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm">Tumblr</td>
                <td className="p-3 md:p-5 text-center border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-slate-900">27k</span> / pcs</td>
                <td className="p-3 md:p-5 text-center bg-amber-50/30 border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-amber-900">25k</span> / pcs</td>
                <td className="p-3 md:p-5 text-center bg-slate-900 text-slate-400 text-xs md:text-sm"><span className="font-bold text-white">24k</span> / pcs<br /><span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] md:text-xs font-bold rounded">FREE 1 PCS</span></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-3 md:p-5 font-semibold text-slate-700 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm">Mug</td>
                <td className="p-3 md:p-5 text-center border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-slate-900">28k</span> / pcs</td>
                <td className="p-3 md:p-5 text-center bg-amber-50/30 border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-amber-900">26k</span> / pcs</td>
                <td className="p-3 md:p-5 text-center bg-slate-900 text-slate-400 text-xs md:text-sm"><span className="font-bold text-white">25k</span> / pcs</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-3 md:p-5 font-semibold text-slate-700 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm">Plakat Premium</td>
                <td className="p-3 md:p-5 text-center border-r border-slate-100 text-slate-600 text-xs md:text-sm"><s>130k</s> <span className="font-bold text-slate-900 ml-1">120k</span></td>
                <td className="p-3 md:p-5 text-center bg-amber-50/30 border-r border-slate-100 text-slate-600 text-xs md:text-sm"><s>130k</s> <span className="font-bold text-amber-900 ml-1">105k</span><br /><span className="text-[10px] md:text-xs text-amber-700/70">Premium UV</span></td>
                <td className="p-3 md:p-5 text-center bg-slate-900 text-slate-400 text-xs md:text-sm"><span className="font-bold text-white">130k</span><br /><span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] md:text-xs font-bold rounded">FREE 1 PCS</span></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-3 md:p-5 font-semibold text-slate-700 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm">Banner</td>
                <td className="p-3 md:p-5 text-center border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-slate-900">20k</span> / m</td>
                <td className="p-3 md:p-5 text-center bg-amber-50/30 border-r border-slate-100 text-slate-600 text-xs md:text-sm"><span className="font-bold text-amber-900">20k</span> / m<br /><span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-700 text-[10px] md:text-xs font-bold rounded whitespace-nowrap">FREE 1 M</span></td>
                <td className="p-3 md:p-5 text-center bg-slate-900 text-slate-400 text-xs md:text-sm"><span className="font-bold text-white">20k</span> / m<br /><span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] md:text-xs font-bold rounded whitespace-nowrap">FREE 3 M</span></td>
              </tr>
              <tr className="border-t-2 border-slate-100 group">
                <td className="p-3 md:p-5 font-bold text-slate-900 border-r border-slate-200 bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm"><div className="flex items-center gap-1 md:gap-2"><Gift className="w-4 h-4 text-emerald-500 shrink-0" /> Cashback</div></td>
                <td className="p-3 md:p-5 text-center border-r border-slate-100 text-slate-500 bg-slate-50">-</td>
                <td className="p-3 md:p-5 text-center bg-amber-100/40 border-r border-slate-100 text-slate-500">-</td>
                <td className="p-3 md:p-5 text-center bg-slate-800 text-emerald-400 font-bold"><div className="flex items-center justify-center gap-1 md:gap-2"><Banknote className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> <span className="text-xs md:text-sm">5% Keseluruhan</span></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Syarat & Ketentuan */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Receipt className="w-6 h-6 text-slate-700" />
          <h3 className="text-xl font-bold text-slate-900">Syarat & Ketentuan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <Megaphone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-600 font-medium">Penyebutan nama brand oleh MC pada saat acara pembukaan.</span>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-600 font-medium">Follow akun sosial media kami (Instagram/Tiktok).</span>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-600 font-medium">Logo kami wajib dicantumkan di banner dan materi promosi event.</span>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-600 font-medium">Membuat 2 video promosi (Format Feed dan Reels).</span>
          </div>
        </div>
      </div>

      {/* Sponsorship Action */}
      <div className="pt-8 text-center border-t border-slate-200 mt-8">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Tertarik dengan Paket Sponsorship Ini?
        </h3>
        <p className="text-slate-600 mb-6 max-w-lg mx-auto">
          Segera hubungi tim kami untuk mendiskusikan kebutuhan event Anda dan dapatkan penawaran spesial ini.
        </p>
        <a
          href="https://wa.me/6285172157808?text=Halo, saya ingin mengajukan proposal sponsorship untuk event berdasarkan Promo Easter."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-[#25D366] text-white rounded-lg py-3 px-8 font-medium hover:bg-[#25D366]/90 transition-colors shadow-sm hover:shadow"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M17.6 6.31999C16.2 4.91999 14.2 4.09999 12.1 4.09999C7.79995 4.09999 4.29995 7.59999 4.29995 11.9C4.29995 13.3 4.69995 14.7 5.39995 15.9L4.19995 19.9L8.29995 18.7C9.49995 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.79999 19 7.79999 17.6 6.31999ZM12.1 18.3C10.9 18.3 9.69995 17.9 8.69995 17.2L8.39995 17L5.99995 17.7L6.69995 15.4L6.39995 15.1C5.59995 14 5.19995 13 5.19995 11.9C5.19995 8.09999 8.29995 5.09999 12 5.09999C13.8 5.09999 15.5 5.79999 16.7 6.99999C17.9 8.19999 18.6 9.89999 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.89995 11.5C9.89995 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.79995 9.19999 9.59995 8.79999C9.39995 8.39999 9.19995 8.39999 8.99995 8.39999C8.89995 8.39999 8.69995 8.39999 8.49995 8.39999C8.29995 8.39999 7.99995 8.49999 7.79995 8.79999C7.59995 9.09999 7.09995 9.49999 7.09995 10.4C7.09995 11.3 7.79995 12.2 7.89995 12.4C8.09995 12.6 9.69995 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z" fill="white" />
          </svg>
          Ajukan Sponsorship
        </a>
      </div>
    </div>
  );
};

export const blogPost: BlogPostData = {
  id: 21,
  slug: "easter-2026",
  title: "Promo Spesial Sponsorship Event & Kampus",
  subtitle: "Penawaran menarik Paket Silver, Gold, dan Platinum khusus event kampus/komunitas dengan bonus merchandise",
  author: "ID Card Lampung",
  date: "2024-04-02",
  tags: ["Promo", "Sponsorship", "Event", "Merchandise", "ID Card"],
  readTime: "3 menit",
  views: 0,
  image: "/blog-thumbnail/easter-promo.png",
  category: "special",
  content: EasterPromoContent,
  relatedProducts: ["ID Card & Lanyard", "Stiker & Label", "Tumbler Custom"]
};
