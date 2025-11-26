import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

const SEO = ({
    title,
    description,
    keywords,
    image = 'https://tidurlah.com/product-image/web-preview.jpg',
    url = window.location.href,
    type = 'website'
}: SEOProps) => {
    const siteTitle = 'Tidurlah Grafika';
    const fullTitle = title ? `${title} | ${siteTitle}` : 'Cetak ID Card & Lanyard Lampung - Tidurlah Grafika';
    const defaultDescription = 'Spesialis ID Card, Lanyard, dan Merchandise Custom di Lampung. Cetak cepat, hasil berkualitas, harga terjangkau.';

    return (
        <Helmet>
            {/* Basic Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
