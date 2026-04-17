import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("id");

  return (
    <div data-testid="order-success-page" className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto h-20 w-20 rounded-full bg-green-100 grid place-items-center">
        <CheckCircle2 className="h-10 w-10 text-[#166534]" />
      </div>
      <h1 className="mt-8 font-display text-4xl sm:text-5xl font-semibold tracking-tight">
        Order placed successfully!
      </h1>
      <p className="mt-4 text-gray-600">
        Thank you for choosing electric. You&apos;re contributing to a cleaner,
        greener tomorrow.
      </p>

      {orderId && (
        <div
          data-testid="order-id-display"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm"
        >
          <Package className="h-4 w-4 text-[#166534]" />
          <span className="text-gray-500">Order ID:</span>
          <span className="font-mono font-semibold">{orderId.slice(0, 8).toUpperCase()}</span>
        </div>
      )}

      <div className="mt-10 flex justify-center gap-3 flex-wrap">
        <Link to="/">
          <Button variant="outline" className="rounded-full" data-testid="back-home-btn">
            <Home className="h-4 w-4 mr-2" /> Back to Home
          </Button>
        </Link>
        <Link to="/products">
          <Button className="rounded-full bg-[#166534] hover:bg-[#14532D]" data-testid="continue-shopping-btn">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
