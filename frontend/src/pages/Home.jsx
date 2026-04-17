import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, BatteryCharging, Shield, Zap, Sparkles, Truck, BadgeIndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data)).catch(() => {});
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <div data-testid="home-page">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden grain">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-[#FAFAF7] to-amber-50" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-200/40 blur-3xl -z-10" />
        <div className="absolute -bottom-40 -left-20 w-[450px] h-[450px] rounded-full bg-amber-200/40 blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl px-6 md:px-10 pt-16 md:pt-24 pb-24 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="rise">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 border border-green-100 text-xs font-semibold text-[#166534]">
              <Leaf className="h-3.5 w-3.5" /> Sustainable · Digital · Affordable
            </div>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl font-semibold tracking-tighter leading-[1.02] text-gray-900">
              Ride the shift. <br />
              <span className="text-[#166534]">Shop electric.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed">
              India&apos;s first student-built e-commerce platform dedicated to
              electric two-wheelers. Browse, compare specs, and place your
              order — all in one green-tech experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products">
                <Button
                  data-testid="hero-shop-btn"
                  className="rounded-full bg-[#166534] hover:bg-[#14532D] px-7 py-6 text-base"
                >
                  Shop Scooters <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#sustainability">
                <Button
                  variant="outline"
                  className="rounded-full border-gray-300 px-7 py-6 text-base"
                  data-testid="hero-learn-btn"
                >
                  Why Electric?
                </Button>
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <Stat label="EV Models" value="5" />
              <Stat label="Avg. Range" value="123 km" />
              <Stat label="CO₂ saved / yr" value="1.2 T" />
            </div>
          </div>

          <div className="relative rise delay-200">
            <div className="aspect-[4/5] w-full rounded-[40px] overflow-hidden bg-gradient-to-br from-emerald-100 to-amber-100 shadow-2xl shadow-emerald-900/10">
              <img
                src="https://images.unsplash.com/photo-1675273672378-1b8e4de84dca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJpYyUyMHNjb290ZXIlMjBpc29sYXRlZHxlbnwwfHx8fDE3NzY0MDM4NjF8MA&ixlib=rb-4.1.0&q=85"
                alt="Electric Scooter Hero"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 grid place-items-center">
                  <BatteryCharging className="h-5 w-5 text-[#166534]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fast Charge</p>
                  <p className="text-sm font-semibold">0–80% in 3.5 hrs</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-50 grid place-items-center">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Smart &amp; Connected</p>
                  <p className="text-sm font-semibold">App-enabled rides</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- VALUE PROPS ---------- */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: "Free Delivery", text: "Across major Indian metros" },
            { icon: Shield, title: "3-Year Warranty", text: "Battery &amp; motor covered" },
            { icon: BadgeIndianRupee, title: "Easy EMI", text: "Starting ₹2,999 / month" },
            { icon: Zap, title: "1000+ Charge Points", text: "Network-backed support" },
          ].map((v, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-gray-200/60 p-6 hover:shadow-md transition-shadow rise"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-11 w-11 rounded-xl bg-green-50 grid place-items-center text-[#166534]">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: v.text }} />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FEATURED PRODUCTS ---------- */}
      <section id="scooters" className="mx-auto max-w-7xl px-6 md:px-10 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#166534]">Our Lineup</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Electric scooters, built for every ride
            </h2>
          </div>
          <Link to="/products">
            <Button variant="outline" className="rounded-full" data-testid="view-all-products-btn">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* ---------- SUSTAINABILITY ---------- */}
      <section id="sustainability" className="mx-auto max-w-7xl px-6 md:px-10 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-[32px] overflow-hidden aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1648204785174-5ab0e60a3fdc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHNjb290ZXIlMjBncmVlbiUyMGVuZXJneXxlbnwwfHx8fDE3NzY0MDM4NjF8MA&ixlib=rb-4.1.0&q=85"
              alt="Green Energy"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#166534]">
              Why Electric?
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              A cleaner commute for a greener tomorrow.
            </h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              Rising fuel prices, growing cities, and a planet under pressure —
              the case for electric mobility has never been stronger. EVMart
              combines the convenience of online shopping with the promise of
              sustainable transport.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Zero tailpipe emissions — cleaner air in our cities.",
                "Up to 80% lower running cost compared to petrol scooters.",
                "Quiet motors and smart connectivity for a modern ride.",
                "Supports India&apos;s mission toward net-zero by 2070.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <Leaf className="h-5 w-5 text-[#22C55E] mt-0.5 shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: t }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 pb-24">
        <div className="relative overflow-hidden rounded-[32px] bg-[#0F1B12] text-white p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#166534]/20 to-[#22C55E]/30" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
                Ready to switch to electric?
              </h2>
              <p className="mt-4 text-gray-300 max-w-xl">
                Explore our lineup of 5 carefully curated electric scooters —
                from city commuters to performance rides.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link to="/products">
                <Button
                  data-testid="cta-shop-btn"
                  className="rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1B12] px-8 py-6 text-base font-semibold"
                >
                  Browse all scooters <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div>
    <p className="font-display text-3xl font-semibold text-gray-900">{value}</p>
    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">{label}</p>
  </div>
);
