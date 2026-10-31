import React from "react";
import { MapPin, Building2, HelpCircle, CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { STOREFRONT_FAQS, SERVICE_AREAS } from "@/utils/schema";

const TRUSTED_CLIENTS = [
  "ITERA (Institut Teknologi Sumatera)",
  "UIN Raden Intan Lampung",
  "Universitas Lampung (Unila)",
  "Universitas Malahayati",
  "SMA/SMK Bandar Lampung & Metro",
  "Instansi BUMN & Perbankan",
  "PT BISI International",
  "Komunitas & Event Organizer Lampung",
];

export const BetaSeoFaqSection: React.FC = () => {
  return (
    <section
      aria-labelledby="seo-faq-heading"
      className="pt-6 sm:pt-8 border-t border-[#E7E5E4] space-y-6"
    >
      {/* Top Grid: Client Trust Summary + Service Area Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Trusted Institutions Card */}
        <div className="lg:col-span-7 bg-white border border-[#E7E5E4] rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E8590C]/10 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-[#E8590C]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#18181B] leading-tight">
                Dipercaya Kampus, Sekolah & Instansi di Lampung Sejak 2021
              </h2>
              <p className="text-[11px] text-[#71717A]">
                Rating kepuasan pelanggan 4.9/5.0 untuk ketepatan waktu dan presisi warna cetak
              </p>
            </div>
          </div>

          <p className="text-xs text-[#52525B] leading-relaxed">
            ID Card Lampung (Tidurlah Grafika) melayani cetak ID card PVC tebal setara KTP, pembuatan nametag karyawan, kartu pelajar, tali lanyard printing sublime, gantungan kunci akrilik, mug custom, plakat akrilik UV, hingga spanduk acara baik satuan maupun ribuan pcs.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {TRUSTED_CLIENTS.map((client) => (
              <span
                key={client}
                className="inline-flex items-center gap-1 text-[11px] text-[#3F3F46] bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-1 rounded-md"
              >
                <CheckCircle2 className="w-3 h-3 text-[#E8590C] shrink-0" />
                <span>{client}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Regional Delivery Coverage Card */}
        <div className="lg:col-span-5 bg-white border border-[#E7E5E4] rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E8590C]/10 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#E8590C]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#18181B] leading-tight">
                  Cakupan Pengiriman Cepat Lampung
                </h2>
                <p className="text-[11px] text-[#71717A]">
                  Ambil di workshop Belwis Way Hui, Kurir Instan, atau Travel/Ekspedisi
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SERVICE_AREAS.map((area) => (
                <span
                  key={area}
                  className="text-[11px] font-medium text-[#52525B] bg-[#F5F5F4] px-2 py-0.5 rounded"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[#71717A] leading-relaxed pt-2 border-t border-[#F0EFEB]">
            Pesan online 24 jam dari rumah atau kantor, konsultasi desain gratis via WhatsApp CS sebelum naik cetak.
          </p>
        </div>
      </div>

      {/* Collapsible Shadcn FAQ Accordion */}
      <div className="bg-white border border-[#E7E5E4] rounded-xl p-4 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-[#E8590C] shrink-0" />
          <h2 id="seo-faq-heading" className="text-sm sm:text-base font-semibold text-[#18181B]">
            Pertanyaan Umum Seputar Cetak ID Card, Lanyard & Merchandise
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full divide-y divide-[#F0EFEB]">
          {STOREFRONT_FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border-b-0">
              <AccordionTrigger className="py-3 text-left text-xs sm:text-sm font-medium text-[#18181B] hover:no-underline hover:text-[#E8590C]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-[13px] text-[#52525B] leading-relaxed pb-3.5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default BetaSeoFaqSection;

