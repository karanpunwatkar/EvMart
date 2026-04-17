import { useEffect, useState, useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "range") list = [...list].sort((a, b) => b.range_km - a.range_km);
    if (sort === "featured") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, query, sort]);

  return (
    <div data-testid="products-page" className="mx-auto max-w-7xl px-6 md:px-10 py-16">
      <div className="flex items-end justify-between flex-wrap gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#166534]">
            Full Lineup
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            All Electric Scooters
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Compare range, speed and price. Find the ride that matches your
            commute and your budget.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              data-testid="product-search-input"
              placeholder="Search scooters…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 rounded-full w-60 bg-white"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-48 rounded-full bg-white" data-testid="sort-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
              <SelectItem value="range">Longest Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-20 text-center text-gray-500">No scooters match your search.</div>
      )}
    </div>
  );
}
