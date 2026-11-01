import React from "react";
import { MessageSquare, ArrowRight } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/constants";

interface BlogWhatsAppCtaProps {
  postTitle?: string;
  category?: string;
  postSlug?: string;
}

export const BlogWhatsAppCta: React.FC<BlogWhatsAppCtaProps> = ({
  postTitle
}) => {
  const defaultText = postTitle
    ? `Halo admin Tidurlah Grafika, saya membaca artikel "${postTitle}" dan ingin konsultasi / tanya harga cetak.`
    : `Halo admin Tidurlah Grafika, saya ingin konsultasi kebutuhan cetak ID Card, Lanyard, atau Merchandise.`;

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultText)}`;

  return (
    <div
      role="note"
      aria-label="Konsultasi WhatsApp"
      className="my-8 rounded-lg border border-border bg-muted/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-foreground">
            Konsultasi & Pemesanan Cetak
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Punya pertanyaan mengenai file desain, ukuran custom, atau estimasi pengerjaan kilat?
          </p>
        </div>
      </div>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
      >
        <span>Chat WhatsApp</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

export default BlogWhatsAppCta;
