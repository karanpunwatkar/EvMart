import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Truck, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api, formatINR, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    payment_method: "Cash on Delivery",
  });
  const [submitting, setSubmitting] = useState(false);

  const delivery = total > 100000 ? 0 : 999;
  const grand = total + delivery;

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await api.post("/orders", {
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        ...form,
      });
      clear();
      navigate(`/order-success?id=${res.data.id}`);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <p className="text-gray-600">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div data-testid="checkout-page" className="mx-auto max-w-6xl px-6 md:px-10 py-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-2 text-gray-600 text-sm">
        <Lock className="inline h-3.5 w-3.5 mr-1" />
        This is a mock checkout for the academic project. No real payment is processed.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white border border-gray-200/70 p-6">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#166534]" /> Delivery Address
            </h3>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" id="full_name">
                <Input
                  id="full_name"
                  data-testid="checkout-fullname"
                  required
                  value={form.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  className="rounded-xl"
                />
              </Field>
              <Field label="Phone" id="phone">
                <Input
                  id="phone"
                  data-testid="checkout-phone"
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="rounded-xl"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address" id="address">
                  <Textarea
                    id="address"
                    data-testid="checkout-address"
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className="rounded-xl"
                  />
                </Field>
              </div>
              <Field label="City" id="city">
                <Input
                  id="city"
                  data-testid="checkout-city"
                  required
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="rounded-xl"
                />
              </Field>
              <Field label="Pincode" id="pincode">
                <Input
                  id="pincode"
                  data-testid="checkout-pincode"
                  required
                  pattern="[0-9]{6}"
                  value={form.pincode}
                  onChange={(e) => setField("pincode", e.target.value)}
                  className="rounded-xl"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200/70 p-6">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#166534]" /> Payment Method
            </h3>
            <RadioGroup
              value={form.payment_method}
              onValueChange={(v) => setField("payment_method", v)}
              className="mt-4 grid sm:grid-cols-2 gap-3"
            >
              {[
                { v: "Cash on Delivery", d: "Pay when your scooter arrives" },
                { v: "UPI (Mock)", d: "Simulated UPI confirmation" },
                { v: "Credit / Debit Card (Mock)", d: "Simulated payment gateway" },
                { v: "EMI (Mock)", d: "12-month easy EMI" },
              ].map((o) => (
                <label
                  key={o.v}
                  className={`cursor-pointer rounded-xl border px-4 py-3 flex items-start gap-3 transition-all ${
                    form.payment_method === o.v
                      ? "border-[#166534] bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value={o.v} data-testid={`pay-${o.v}`} />
                  <div>
                    <p className="text-sm font-semibold">{o.v}</p>
                    <p className="text-xs text-gray-500">{o.d}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white border border-gray-200/70 p-6 sticky top-24">
            <h3 className="font-display text-lg font-semibold">Order Summary</h3>
            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
              {items.map((i) => (
                <div key={i.product_id} className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{i.name}</p>
                    <p className="text-xs text-gray-500">Qty: {i.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap">
                    {formatINR(i.price * i.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-gray-200 pt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatINR(total)} />
              <Row
                label={`Delivery ${delivery === 0 ? "(Free)" : ""}`}
                value={delivery === 0 ? "Free" : formatINR(delivery)}
              />
              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="font-display font-semibold">Total</span>
                <span className="font-display text-2xl font-semibold">
                  {formatINR(grand)}
                </span>
              </div>
            </div>
            <Button
              type="submit"
              data-testid="place-order-btn"
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-[#166534] hover:bg-[#14532D] py-6 text-base"
            >
              {submitting ? "Placing order…" : "Place Order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

const Field = ({ label, id, children }) => (
  <div>
    <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-gray-600">
      {label}
    </Label>
    <div className="mt-1.5">{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between text-gray-600">
    <span>{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);
