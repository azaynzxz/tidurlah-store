
import FoodCard from "./FoodCard";

interface FoodItem {
  id: number;
  name: string;
  image: string;
  price: number;
  time: string;
  rating: number;
  category: string;
  additionalImages?: string[];
  description?: string;
}

interface FoodGridProps {
  foods: FoodItem[];
  activeFilter: string;
  onAddToCart: (food: FoodItem) => void;
  onViewDetails: (food: FoodItem) => void;
}

const FoodGrid = ({ foods, activeFilter, onAddToCart, onViewDetails }: FoodGridProps) => {
  const filteredFoods = foods.filter(
    (food) => activeFilter === "All" || food.category === activeFilter
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {filteredFoods.map((food) => (
        <FoodCard 
          key={food.id} 
          food={food} 
          onAddToCart={onAddToCart} 
          onViewDetails={() => onViewDetails(food)} 
        />
      ))}
    </div>
  );
};

export default FoodGrid;
