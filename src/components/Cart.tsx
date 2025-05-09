
import { useState } from "react";
import { X } from "lucide-react";

interface FoodItem {
  id: number;
  name: string;
  image: string;
  price: number;
  time: string;
  rating: number;
}

interface CartProps {
  cartItems: FoodItem[];
  removeFromCart: (id: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const Cart = ({ cartItems, removeFromCart, isCartOpen, setIsCartOpen }: CartProps) => {
  const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setIsCartOpen(false)}
      ></div>
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-130px)] p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <span className="text-lg">Your cart is empty</span>
              <p className="mt-2">Add some delicious food to get started!</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center mb-4 bg-gray-50 rounded-lg p-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg mr-3"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-green-600 font-bold">${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="border-t p-4 bg-white">
          <div className="flex justify-between mb-4">
            <span className="font-medium">Total:</span>
            <span className="font-bold">${totalPrice.toFixed(2)}</span>
          </div>
          <button
            className="w-full py-3 bg-green-500 text-white rounded-lg font-medium"
            disabled={cartItems.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
