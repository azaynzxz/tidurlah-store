import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  discount_price: number | null;
  unit: string;
  image: string;
  is_available: boolean;
}

interface CartItemType {
  product: Product;
  quantity: number;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  const price = item.product.discount_price || item.product.price;
  const subtotal = price * item.quantity;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
    onUpdateQuantity(item.product.id, newQuantity);
  };

  const increaseQuantity = () => {
    onUpdateQuantity(item.product.id, item.quantity + 1);
  };

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id, item.quantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-cart-background rounded-lg border border-cart-border">
      <img
        src={item.product.image}
        alt={item.product.name}
        className="w-10 h-10 rounded-md object-cover border border-border"
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground truncate">
          {item.product.name}
        </h4>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={decreaseQuantity}
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              className="h-7 w-12 text-center text-sm"
              min="1"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={increaseQuantity}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            onClick={() => onRemove(item.product.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="text-sm font-semibold text-foreground currency">
        {formatCurrency(subtotal)}
      </div>
    </div>
  );
}