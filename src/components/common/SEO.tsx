import { Helmet } from "react-helmet-async";
import { SITE_ORIGIN, toAbsoluteAssetUrl } from "@/utils/productSeo";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SEO = ({
  title,
  description,
  keywords,
  image = `${SITE_ORIGIN}/product-image/web-preview.jpg`,
  url,
  type = "website",
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const siteTitle = "ID Card Lampung";
  const fullTitle = title
    ? title.includes(siteTitle)
      ? title
      : `${title} - ${siteTitle}`
    : "Cetak ID Card, Lanyard & Merchandise Terdekat di Bandar Lampung & Metro - ID Card Lampung";

  const defaultDescription =
    "Pusat cetak ID card PVC tebal setara KTP, tali lanyard custom, nametag, gantungan kunci akrilik, mug custom, dan plakat tanpa minimum order di Bandar Lampung (Tanjung Karang, Kedaton, Rajabasa, Sukarame), Way Hui, hingga Kota Metro.";

  const resolvedUrl =
    url ||
    (typeof window !== "undefined"
      ? `${SITE_ORIGIN}${window.location.pathname}`
      : `${SITE_ORIGIN}/`);

  const resolvedImage = toAbsoluteAssetUrl(image);
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={resolvedUrl} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:locale" content="id_ID" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* Structured Data (JSON-LD) */}
      {schemas.map((schemaObj, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(schemaObj)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
