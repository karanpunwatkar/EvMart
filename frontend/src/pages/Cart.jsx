import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/api";

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div data-testid="empty-cart" className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-green-50 grid place-items-center">
          <ShoppingBag className="h-7 w-7 text-[#166534]" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">Start exploring our electric scooter lineup.</p>
        <Link to="/products">
          <Button className="mt-8 rounded-full bg-[#166534] hover:bg-[#14532D]">
            Browse scooters
          </Button>
        </Link>
      </div>
    );
  }

  const delivery = total > 100000 ? 0 : 999;
  const grand = total + delivery;

  return (
    <div data-testid="cart-page" className="mx-auto max-w-7xl px-6 md:px-10 py-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Your Cart</h1>
      <p className="mt-2 text-gray-600">
        {items.length} item{items.length > 1 ? "s" : ""} ready to ride.
      </p>

      <div className="mt-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((i) => (
            <div
              key={i.product_id}
              data-testid={`cart-item-${i.product_id}`}
              className="rounded-2xl bg-white border border-gray-200/70 p-4 flex flex-col sm:flex-row items-stretch gap-4"
            >
              <Link
                to={`/products/${i.product_id}`}
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-amber-50 shrink-0"
              >
                <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link to={`/products/${i.product_id}`}>
                      <h3 className="font-display text-lg font-semibold hover:text-[#166534]">
                        {i.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Unit price: {formatINR(i.price)}
                    </p>
                  </div>
                  <button
                    data-testid={`remove-cart-item-${i.product_id}`}
                    onClick={() => removeItem(i.product_id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-gray-300 bg-white">
                    <button
                      className="px-3 py-1.5 hover:bg-gray-50 rounded-l-full"
                      onClick={() => updateQuantity(i.product_id, i.quantity - 1)}
                      data-testid={`decrement-${i.product_id}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                    <button
                      className="px-3 py-1.5 hover:bg-gray-50 rounded-r-full"
                      onClick={() => updateQuantity(i.product_id, i.quantity + 1)}
                      data-testid={`increment-${i.product_id}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-display text-lg font-semibold">
                    {formatINR(i.price * i.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white border border-gray-200/70 p-6 sticky top-24">
            <h3 className="font-display text-lg font-semibold">Order Summary</h3>
            <div className="mt-5 space-y-3 text-sm">
              <Row label="Subtotal" value={formatINR(total)} />
              <Row
                label={`Delivery ${delivery === 0 ? "(Free)" : ""}`}
                value={delivery === 0 ? "Free" : formatINR(delivery)}
              />
              <div className="border-t border-gray-200 pt-3 mt-3 flex items-baseline justify-between">
                <span className="font-display text-base font-semibold">Total</span>
                <span
                  data-testid="cart-grand-total"
                  className="font-display text-2xl font-semibold text-gray-900"
                >
                  {formatINR(grand)}
                </span>
              </div>
            </div>
            <Button
              data-testid="checkout-btn"
              onClick={() => navigate("/checkout")}
              className="mt-6 w-full rounded-full bg-[#166534] hover:bg-[#14532D] py-6 text-base"
            >
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-3 text-[11px] text-gray-500 text-center">
              Secure mock checkout · No real payment taken
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between text-gray-600">
    <span>{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);
