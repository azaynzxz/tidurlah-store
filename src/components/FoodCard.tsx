
import { useState } from "react";
import { Heart, Plus } from "lucide-react";

interface FoodItem {
  id: number;
  name: string;
  image: string;
  price: number;
  time: string;
  rating: number;
}

interface FoodCardProps {
  food: FoodItem;
  onAddToCart: (food: FoodItem) => void;
}

const FoodCard = ({ food, onAddToCart }: FoodCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden relative mb-4">
      <button
        className="absolute top-3 right-3 bg-white rounded-full p-2"
        onClick={() => setIsFavorite(!isFavorite)}
      >
        <Heart
          className={`h-5 w-5 ${isFavorite ? "fill-current text-red-500" : ""}`}
        />
      </button>
      <div className="p-4">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
        <h3 className="font-bold text-lg">{food.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-600">{food.time}</span>
          <div className="flex items-center">
            <svg
              className="h-4 w-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1">{food.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold">${food.price.toFixed(2)}</span>
          <button
            className="bg-green-500 text-white p-2 rounded-full"
            onClick={() => onAddToCart(food)}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
