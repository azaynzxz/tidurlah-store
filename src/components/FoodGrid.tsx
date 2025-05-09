
import FoodCard from "./FoodCard";

interface FoodItem {
  id: number;
  name: string;
  image: string;
  price: number;
  time: string;
  rating: number;
  category: string;
}

interface FoodGridProps {
  foods: FoodItem[];
  activeFilter: string;
  onAddToCart: (food: FoodItem) => void;
}

const FoodGrid = ({ foods, activeFilter, onAddToCart }: FoodGridProps) => {
  const filteredFoods = foods.filter(
    (food) => activeFilter === "All" || food.category === activeFilter
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {filteredFoods.map((food) => (
        <FoodCard key={food.id} food={food} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default FoodGrid;
