import { useEffect, useState } from "react";
import { MapPin, Star } from "lucide-react";
import { promotedProducts as promotedProductsConst, PRODUCT_VERSION } from "@/constants";
import idCardLampungData from "@/pages/idcard_lampung_json.json";

interface ProductItem {
  id: number;
  name: string;
  image: string;
  description?: string;
  price: number;
  category: string;
}

type ProductsByCategory = Record<string, ProductItem[]>;

const groupProductsByCategory = (items: ProductItem[]): ProductsByCategory => {
  return items.reduce<ProductsByCategory>((acc, item) => {
    const key = item.category || "Lainnya";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

const pickRandom = <T,>(arr: T[], count: number): T[] => {
  if (!arr || arr.length === 0) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};

const flattenProducts = (byCategory: ProductsByCategory): ProductItem[] => {
  return Object.values(byCategory).flat();
};

const getFeaturedProduct = (items: ProductItem[]): ProductItem | null => {
  // Prefer a product flagged as bestseller if present in data, fallback random
  const bestsellerCandidates = items.filter((p: any) => (p as any).bestseller);
  if (bestsellerCandidates.length) return bestsellerCandidates[0];
  return items.length ? items[Math.floor(Math.random() * items.length)] : null;
};

const BlogSidebarWidgets = () => {
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({});
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [featured, setFeatured] = useState<ProductItem | null>(null);
  const [randomTwo, setRandomTwo] = useState<ProductItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/products.json?v=${PRODUCT_VERSION}`);
        const data = await res.json();
        // products.json structured by category object; flatten
        const categoryToItems: ProductsByCategory = {};
        if (data && typeof data === 'object') {
          Object.keys(data).forEach((category) => {
            const arr = Array.isArray(data[category]) ? data[category] : [];
            arr.forEach((p: any) => (p.category = p.category || category));
            (categoryToItems as any)[category] = arr as ProductItem[];
          });
        }
        setProductsByCategory(categoryToItems);
        const flattened = flattenProducts(categoryToItems);
        setAllProducts(flattened);
        setFeatured(getFeaturedProduct(flattened));
        setRandomTwo(pickRandom(flattened, 2));
      } catch {
        setProductsByCategory({});
        setAllProducts([]);
        setFeatured(null);
        setRandomTwo([]);
      }
    };
    load();
  }, []);

  const handleOpenOnHome = (product: ProductItem | null) => {
    if (!product) return;
    try {
      localStorage.setItem('openProductId', String(product.id));
    } catch {}
    window.location.href = '/';
  };

  return (
    <div className="space-y-6">
      {/* Featured Product */}
      {featured && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <Star className="h-5 w-5 mr-2 text-[#FF5E01]" />
            Produk Pilihan
          </h3>
          <button onClick={() => handleOpenOnHome(featured)} className="flex items-center gap-4 text-left w-full group">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
              <img src={featured.image} alt={featured.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-gray-900 group-hover:text-[#FF5E01] transition-colors mb-1">{featured.name}</p>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                {typeof (featured as any).rating === 'number' && (
                  <span className="inline-flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                    <span className="text-xs font-medium">{(featured as any).rating}</span>
                  </span>
                )}
                {(featured as any).time && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {(featured as any).time}
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Randomized Two Products */}
      {randomTwo.length > 0 && (
        <div className="bg-background rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Lihat Juga</h3>
          <div className="space-y-3">
            {randomTwo.map((p) => (
              <button key={p.id} onClick={() => handleOpenOnHome(p)} className="flex items-center gap-3 group w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm ring-1 ring-gray-200 group-hover:ring-[#FF5E01] transition-all">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#FF5E01] transition-colors mb-1">{p.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {typeof (p as any).rating === 'number' && (
                      <span className="inline-flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                        {(p as any).rating}
                      </span>
                    )}
                    {(p as any).time && <span>{(p as any).time}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Google Maps */}
      <div className="bg-background rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-[#FF5E01]" />
          Lokasi Toko
        </h3>
        <div className="aspect-video rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.026!2d105.271!3d-5.382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="TIDURLAH GRAFIKA Location"
          />
        </div>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          Perum. Korpri Raya, Blok D3. No. 3, Sukarame, Bandar Lampung
        </p>
      </div>

      {/* ID Card Lampung CTA - Unified Design */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {idCardLampungData.content.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {idCardLampungData.content.h1}
          </p>
        </div>
        
        <div className="text-center">
          <a 
            href={`https://wa.me/${idCardLampungData.buttons.contact.whatsapp.value}?text=Halo, saya ingin konsultasi mengenai pembuatan ID card.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-[#25D366] text-white rounded-lg py-3 px-8 text-sm font-medium hover:bg-[#25D366]/90 transition-colors shadow-sm hover:shadow-md"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M17.6 6.31999C16.2 4.91999 14.2 4.09999 12.1 4.09999C7.79995 4.09999 4.29995 7.59999 4.29995 11.9C4.29995 13.3 4.69995 14.7 5.39995 15.9L4.19995 19.9L8.29995 18.7C9.49995 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.79999 19 7.79999 17.6 6.31999ZM12.1 18.3C10.9 18.3 9.69995 17.9 8.69995 17.2L8.39995 17L5.99995 17.7L6.69995 15.4L6.39995 15.1C5.59995 14 5.19995 13 5.19995 11.9C5.19995 8.09999 8.29995 5.09999 12 5.09999C13.8 5.09999 15.5 5.79999 16.7 6.99999C17.9 8.19999 18.6 9.89999 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.89995 11.5C9.89995 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.79995 9.19999 9.59995 8.79999C9.39995 8.39999 9.19995 8.39999 8.99995 8.39999C8.89995 8.39999 8.69995 8.39999 8.49995 8.39999C8.29995 8.39999 7.99995 8.49999 7.79995 8.79999C7.59995 9.09999 7.09995 9.49999 7.09995 10.4C7.09995 11.3 7.79995 12.2 7.89995 12.4C8.09995 12.6 9.69995 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z" fill="white"/>
            </svg>
            {idCardLampungData.content.cta}
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlogSidebarWidgets;


