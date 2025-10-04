import { Button } from "@/components/ui/button";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 p-2 bg-secondary/30 rounded-lg overflow-x-auto">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "secondary"}
          size="sm"
          className={`shrink-0 transition-all duration-200 ${
            activeCategory === category 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "bg-secondary hover:bg-secondary-hover"
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}