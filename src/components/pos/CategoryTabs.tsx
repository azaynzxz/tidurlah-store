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

  if (cat.includes('semua') || cat.includes('all')) return <LayoutGrid className="size-3.5" />;
  if (cat.includes('bunga') || cat.includes('flower')) return <Flower2 className="size-3.5" />;
  if (cat.includes('jasa') || cat.includes('layanan') || cat.includes('service')) return <HandHeart className="size-3.5" />;
  if (cat.includes('id card') || cat.includes('lanyard')) return <CreditCard className="size-3.5" />;
  if (cat.includes('stiker') || cat.includes('sticker')) return <Sticker className="size-3.5" />;
  if (cat.includes('banner') || cat.includes('cetak') || cat.includes('print')) return <Printer className="size-3.5" />;
  if (cat.includes('baju') || cat.includes('kaos') || cat.includes('t-shirt') || cat.includes('shirt') || cat.includes('polo')) return <Shirt className="size-3.5" />;
  if (cat.includes('ganci') || cat.includes('gantungan') || cat.includes('key')) return <Key className="size-3.5" />;
  if (cat.includes('buku') || cat.includes('book') || cat.includes('nota') || cat.includes('yasin')) return <Book className="size-3.5" />;
  if (cat.includes('pulpen') || cat.includes('pen')) return <PenTool className="size-3.5" />;
  if (cat.includes('merchandise') || cat.includes('souvenir') || cat.includes('akrilik') || cat.includes('plakat') || cat.includes('mug') || cat.includes('pin')) return <Gift className="size-3.5" />;

  return <Tag className="size-3.5" />;
};

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border w-max">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-foreground text-background shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"
              }`}
            >
              {getCategoryIcon(category)}
              <span className="tracking-tight">{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}