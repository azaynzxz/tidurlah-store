
import { useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import FilterTabs from "../components/FilterTabs";
import FoodGrid from "../components/FoodGrid";
import Cart from "../components/Cart";
import { ShoppingCart } from "lucide-react";

const foods = [
  {
    id: 1,
    name: "Chicken Caesar Salad",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    price: 12.00,
    time: "20 min",
    rating: 4.5,
    category: "Salads"
  },
  {
    id: 2,
    name: "Green Tomato Salad",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    price: 11.00,
    time: "20 min",
    rating: 4.5,
    category: "Salads"
  },
  {
    id: 3,
    name: "Avocado Spinach Salad",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    price: 13.50,
    time: "15 min",
    rating: 4.7,
    category: "Salads"
  },
  {
    id: 4,
    name: "Rainbow Buddha Bowl",
    image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    price: 14.00,
    time: "25 min",
    rating: 4.8,
    category: "HotSales"
  },
  {
    id: 5,
    name: "Grilled Chicken Sandwich",
    image: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    price: 10.50,
    time: "15 min",
    rating: 4.3,
    category: "HotSales"
  },
  {
    id: 6,
    name: "Classic Burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    price: 9.99,
    time: "20 min",
    rating: 4.6,
    category: "Popularity"
  },
];

const Index = () => {
  const [activeFilter, setActiveFilter] = useState("Salads");
  const [cartItems, setCartItems] = useState<typeof foods>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (food: typeof foods[0]) => {
    setCartItems([...cartItems, food]);
  };

  const removeFromCart = (id: number) => {
    const index = cartItems.findIndex(item => item.id === id);
    if (index !== -1) {
      const newCartItems = [...cartItems];
      newCartItems.splice(index, 1);
      setCartItems(newCartItems);
    }
  };

  return (
    <div className="min-h-screen bg-green-50/50">
      <div className="container mx-auto max-w-md bg-white min-h-screen relative">
        <Navbar />
        
        <div className="px-6">
          <div className="my-8">
            <h1 className="text-4xl font-bold">
              Find The <span className="block">Best Food</span>
              <span className="text-gray-700">Around You</span>
            </h1>
          </div>
          
          <SearchBar />
          <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <FoodGrid 
            foods={foods} 
            activeFilter={activeFilter} 
            onAddToCart={addToCart} 
          />
        </div>
        
        {/* Cart button */}
        <button 
          className="fixed bottom-6 right-6 z-10 bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart className="h-6 w-6" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
              {cartItems.length}
            </span>
          )}
        </button>
        
        <Cart 
          cartItems={cartItems} 
          removeFromCart={removeFromCart} 
          isCartOpen={isCartOpen} 
          setIsCartOpen={setIsCartOpen}
        />
      </div>
    </div>
  );
};

export default Index;
