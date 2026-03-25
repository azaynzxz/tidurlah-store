import {
  LayoutGrid,
  CreditCard,
  Sticker,
  Printer,
  Shirt,
  Key,
  Book,
  PenTool,
  Gift,
  Tag,
  Flower2,
  HandHeart
} from "lucide-react";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();

  if (cat.includes('semua') || cat.includes('all')) return <LayoutGrid className="w-3.5 h-3.5" />;
  if (cat.includes('bunga') || cat.includes('flower')) return <Flower2 className="w-3.5 h-3.5" />;
  if (cat.includes('jasa') || cat.includes('layanan') || cat.includes('service')) return <HandHeart className="w-3.5 h-3.5" />;
  if (cat.includes('id card') || cat.includes('lanyard')) return <CreditCard className="w-3.5 h-3.5" />;
  if (cat.includes('stiker') || cat.includes('sticker')) return <Sticker className="w-3.5 h-3.5" />;
  if (cat.includes('banner') || cat.includes('cetak') || cat.includes('print')) return <Printer className="w-3.5 h-3.5" />;
  if (cat.includes('baju') || cat.includes('kaos') || cat.includes('t-shirt') || cat.includes('shirt') || cat.includes('polo')) return <Shirt className="w-3.5 h-3.5" />;
  if (cat.includes('ganci') || cat.includes('gantungan') || cat.includes('key')) return <Key className="w-3.5 h-3.5" />;
  if (cat.includes('buku') || cat.includes('book') || cat.includes('nota') || cat.includes('yasin')) return <Book className="w-3.5 h-3.5" />;
  if (cat.includes('pulpen') || cat.includes('pen')) return <PenTool className="w-3.5 h-3.5" />;
  if (cat.includes('merchandise') || cat.includes('souvenir') || cat.includes('akrilik') || cat.includes('plakat') || cat.includes('mug') || cat.includes('pin')) return <Gift className="w-3.5 h-3.5" />;

  return <Tag className="w-3.5 h-3.5" />;
};

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 -mb-2 pt-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex gap-1 p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 w-max shadow-inner">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 outline-none ${activeCategory === category
              ? "text-white bg-gradient-to-tr from-[#FF5E01] to-[#ff7e33] shadow-md shadow-orange-500/20"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
              }`}
          >
            {getCategoryIcon(category)}
            <span className="tracking-wide">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
