import { Link } from "react-router-dom";
import { Battery, Gauge, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/api";

export const ProductCard = ({ product, index = 0 }) => {
  const { addItem } = useCart();
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group rounded-3xl bg-white border border-gray-200/70 shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-20px_rgba(22,101,52,0.25)] transition-all duration-500 overflow-hidden rise"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-[5/4] bg-gradient-to-br from-emerald-50 via-white to-amber-50 overflow-hidden">
          {discount > 0 && (
            <span className="absolute top-4 left-4 z-10 bg-[#166534] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
          {product.featured && (
            <span className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur text-[#166534] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-green-100">
              Featured
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/products/${product.id}`}>
              <h3 className="font-display text-xl font-semibold text-gray-900 group-hover:text-[#166534] transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.tagline}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-xl font-semibold text-gray-900">
              {formatINR(product.price)}
            </p>
            {product.original_price && (
              <p className="text-xs text-gray-400 line-through">
                {formatINR(product.original_price)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-gray-50 py-2.5">
            <Battery className="h-4 w-4 mx-auto text-[#166534]" />
            <p className="mt-1 text-[11px] text-gray-500 uppercase tracking-wider">Range</p>
            <p className="text-xs font-semibold text-gray-900">{product.range_km} km</p>
          </div>
          <div className="rounded-xl bg-gray-50 py-2.5">
            <Gauge className="h-4 w-4 mx-auto text-[#166534]" />
            <p className="mt-1 text-[11px] text-gray-500 uppercase tracking-wider">Top</p>
            <p className="text-xs font-semibold text-gray-900">{product.top_speed} km/h</p>
          </div>
          <div className="rounded-xl bg-gray-50 py-2.5">
            <Clock className="h-4 w-4 mx-auto text-[#166534]" />
            <p className="mt-1 text-[11px] text-gray-500 uppercase tracking-wider">Charge</p>
            <p className="text-xs font-semibold text-gray-900">{product.charging_time}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            data-testid={`add-to-cart-${product.id}`}
            onClick={() => addItem(product)}
            className="flex-1 rounded-full bg-[#166534] hover:bg-[#14532D]"
          >
            Add to Cart
          </Button>
          <Link to={`/products/${product.id}`} className="shrink-0">
            <Button
              variant="outline"
              className="rounded-full border-gray-300"
              data-testid={`view-product-${product.id}`}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
