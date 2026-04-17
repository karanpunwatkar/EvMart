import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Battery,
  Gauge,
  Clock,
  Zap,
  Check,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, formatINR } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => {
        setProduct(r.data);
        setColor(r.data.colors?.[0] || "");
      })
      .catch(() => navigate("/products"));
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#166534] border-t-transparent animate-spin" />
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div data-testid="product-detail-page" className="mx-auto max-w-7xl px-6 md:px-10 py-12">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#166534]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to scooters
      </Link>

      <div className="mt-8 grid md:grid-cols-2 gap-12">
        <div className="aspect-square rounded-[32px] bg-gradient-to-br from-emerald-50 via-white to-amber-50 overflow-hidden relative rise">
          {discount > 0 && (
            <span className="absolute top-6 left-6 bg-[#166534] text-white text-xs font-semibold px-3 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="rise delay-100">
          <Badge className="bg-green-50 text-[#166534] border border-green-100 hover:bg-green-50 rounded-full px-3 py-0.5">
            {product.featured ? "Featured" : "In Stock"}
          </Badge>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-gray-500">{product.tagline}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <p className="font-display text-4xl font-semibold text-gray-900">
              {formatINR(product.price)}
            </p>
            {product.original_price && (
              <p className="text-gray-400 line-through">
                {formatINR(product.original_price)}
              </p>
            )}
            {discount > 0 && (
              <span className="text-sm font-semibold text-[#166534]">
                Save {formatINR(product.original_price - product.price)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes · FAME-II eligible</p>

          <p className="mt-6 text-gray-700 leading-relaxed">{product.description}</p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SpecTile icon={Battery} label="Battery" value={product.battery} />
            <SpecTile icon={Gauge} label="Range" value={`${product.range_km} km`} />
            <SpecTile icon={Zap} label="Top Speed" value={`${product.top_speed} km/h`} />
            <SpecTile icon={Clock} label="Charging" value={product.charging_time} />
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
              Motor
            </p>
            <p className="mt-1 text-gray-900 font-medium">{product.motor}</p>
          </div>

          {product.colors?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
                Color
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    data-testid={`color-${c}`}
                    onClick={() => setColor(c)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      color === c
                        ? "border-[#166534] bg-green-50 text-[#166534]"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {color === c && <Check className="inline h-3 w-3 mr-1" />}
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-gray-300 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-lg hover:bg-gray-50 rounded-l-full"
                data-testid="qty-decrement"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold" data-testid="qty-value">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 text-lg hover:bg-gray-50 rounded-r-full"
                data-testid="qty-increment"
              >
                +
              </button>
            </div>

            <Button
              data-testid="detail-add-to-cart-btn"
              onClick={() => addItem(product, quantity)}
              className="flex-1 rounded-full bg-[#166534] hover:bg-[#14532D] py-6 text-base"
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SpecTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-gray-200/70 bg-white p-4">
    <Icon className="h-5 w-5 text-[#166534]" />
    <p className="mt-2 text-[11px] uppercase tracking-wider text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
  </div>
);
