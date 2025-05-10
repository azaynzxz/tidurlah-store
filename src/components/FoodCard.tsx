
import { useState } from "react";
import { Heart, Plus, Trash2 } from "lucide-react";

interface PriceThreshold {
  minQuantity: number;
  price: number;
}

interface FoodItem {
  id: number;
  name: string;
  image: string;
  price: number;
  time: string;
  rating: number;
  priceThresholds?: PriceThreshold[];
  discountPrice?: number | null;
}

interface FoodCardProps {
  food: FoodItem;
  onAddToCart: (food: FoodItem) => void;
  onViewDetails?: () => void;
}

const FoodCard = ({ food, onAddToCart, onViewDetails }: FoodCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden relative mb-4 flex flex-col h-full">
      <button
        className="absolute top-3 right-3 bg-white rounded-full p-2"
        onClick={() => setIsFavorite(!isFavorite)}
      >
        <Heart
          className={`h-5 w-5 ${isFavorite ? "fill-current text-red-500" : ""}`}
        />
      </button>
      <div 
        className="cursor-pointer" 
        onClick={onViewDetails}
      >
        <div className="relative pt-[100%]">
          <img
            src={food.image}
            alt={food.name}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
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
          
          {food.priceThresholds && food.priceThresholds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 overflow-hidden" style={{ maxHeight: "60px" }}>
              {food.priceThresholds.map((threshold, idx) => (
                <div 
                  key={idx} 
                  className="px-2 py-1 bg-[#FF5E01] bg-opacity-10 rounded-full text-[#FF5E01] text-xs font-medium"
                >
                  {threshold.minQuantity}
                  {idx < food.priceThresholds!.length - 1 ? '-' + (food.priceThresholds![idx + 1].minQuantity - 1) : '+'} pcs: Rp {threshold.price.toLocaleString('id-ID')}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto p-4 pt-0">
        <div className="flex items-center justify-between">
          {food.discountPrice !== undefined && food.discountPrice !== null ? (
            <div className="flex flex-col">
              <span className="line-through text-gray-500 text-xs">
                ${food.price.toFixed(2)}
              </span>
              <span className="font-bold">
                ${food.discountPrice.toFixed(2)}
                {food.price > food.discountPrice && (
                  <span className="text-xs text-green-500 block">
                    Anda hemat Rp {(food.price - food.discountPrice).toLocaleString('id-ID')}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <span className="font-bold">${food.price.toFixed(2)}</span>
          )}
          <button
            className="bg-green-500 text-white p-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(food);
            }}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
