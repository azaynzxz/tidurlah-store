import { Button } from "@/components/ui/button";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 p-2 bg-orange-50 rounded-lg overflow-x-auto">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "secondary"}
          size="sm"
          className={`shrink-0 transition-all duration-200 ${
            activeCategory === category
              ? "bg-[#FF5E01] text-white shadow-md hover:bg-[#e54d00]"
              : "bg-background text-foreground hover:bg-orange-50 border border-gray-200"
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
