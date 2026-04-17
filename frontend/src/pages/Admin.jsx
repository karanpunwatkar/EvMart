import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Package, ShoppingBag } from "lucide-react";
import { api, formatApiErrorDetail, formatINR } from "@/lib/api";
import { toast } from "sonner";

const EMPTY = {
  name: "",
  tagline: "",
  price: 0,
  original_price: 0,
  battery: "",
  range_km: 0,
  top_speed: 0,
  charging_time: "",
  motor: "",
  colors: "",
  image: "",
  stock: 10,
  featured: false,
  description: "",
};

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null); // product id or "new" or null
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);

  const loadAll = async () => {
    try {
      const [p, o] = await Promise.all([
        api.get("/products"),
        api.get("/orders"),
      ]);
      setProducts(p.data);
      setOrders(o.data);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openNew = () => {
    setEditing("new");
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      ...p,
      original_price: p.original_price || 0,
      colors: (p.colors || []).join(", "),
    });
    setOpen(true);
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      original_price: Number(form.original_price) || null,
      range_km: Number(form.range_km),
      top_speed: Number(form.top_speed),
      stock: Number(form.stock),
      colors: form.colors
        ? form.colors.split(",").map((c) => c.trim()).filter(Boolean)
        : [],
      gallery: [],
    };
    try {
      if (editing === "new") {
        await api.post("/products", payload);
        toast.success("Product added");
      } else {
        await api.put(`/products/${editing}`, payload);
        toast.success("Product updated");
      }
      setOpen(false);
      loadAll();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this scooter?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Deleted");
      loadAll();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-page" className="mx-auto max-w-7xl px-6 md:px-10 py-12">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#166534]">
            Admin Panel
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Manage EVMart
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Add, edit or remove scooters and view all customer orders.
          </p>
        </div>
      </div>

      <Tabs defaultValue="products" className="mt-8">
        <TabsList className="rounded-full">
          <TabsTrigger value="products" data-testid="tab-products" className="rounded-full">
            <Package className="h-4 w-4 mr-1.5" /> Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders" className="rounded-full">
            <ShoppingBag className="h-4 w-4 mr-1.5" /> Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="flex justify-end mb-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  data-testid="add-product-btn"
                  onClick={openNew}
                  className="rounded-full bg-[#166534] hover:bg-[#14532D]"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Add Scooter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editing === "new" ? "Add Scooter" : "Edit Scooter"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4 mt-2">
                  <AF label="Name">
                    <Input data-testid="admin-form-name" required value={form.name} onChange={(e) => setField("name", e.target.value)} />
                  </AF>
                  <AF label="Tagline">
                    <Input required value={form.tagline} onChange={(e) => setField("tagline", e.target.value)} />
                  </AF>
                  <AF label="Price (₹)">
                    <Input type="number" required value={form.price} onChange={(e) => setField("price", e.target.value)} />
                  </AF>
                  <AF label="Original Price (₹)">
                    <Input type="number" value={form.original_price} onChange={(e) => setField("original_price", e.target.value)} />
                  </AF>
                  <AF label="Battery">
                    <Input required placeholder="e.g. 3.5 kWh" value={form.battery} onChange={(e) => setField("battery", e.target.value)} />
                  </AF>
                  <AF label="Range (km)">
                    <Input type="number" required value={form.range_km} onChange={(e) => setField("range_km", e.target.value)} />
                  </AF>
                  <AF label="Top Speed (km/h)">
                    <Input type="number" required value={form.top_speed} onChange={(e) => setField("top_speed", e.target.value)} />
                  </AF>
                  <AF label="Charging Time">
                    <Input required placeholder="e.g. 4 hrs" value={form.charging_time} onChange={(e) => setField("charging_time", e.target.value)} />
                  </AF>
                  <AF label="Motor">
                    <Input required value={form.motor} onChange={(e) => setField("motor", e.target.value)} />
                  </AF>
                  <AF label="Stock">
                    <Input type="number" required value={form.stock} onChange={(e) => setField("stock", e.target.value)} />
                  </AF>
                  <div className="sm:col-span-2">
                    <AF label="Image URL">
                      <Input required value={form.image} onChange={(e) => setField("image", e.target.value)} />
                    </AF>
                  </div>
                  <div className="sm:col-span-2">
                    <AF label="Colors (comma-separated)">
                      <Input value={form.colors} onChange={(e) => setField("colors", e.target.value)} />
                    </AF>
                  </div>
                  <div className="sm:col-span-2">
                    <AF label="Description">
                      <Textarea rows={3} required value={form.description} onChange={(e) => setField("description", e.target.value)} />
                    </AF>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setField("featured", e.target.checked)}
                      className="h-4 w-4 accent-[#166534]"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">Mark as Featured</Label>
                  </div>

                  <DialogFooter className="sm:col-span-2 mt-2">
                    <Button
                      type="submit"
                      data-testid="admin-save-btn"
                      className="rounded-full bg-[#166534] hover:bg-[#14532D]"
                    >
                      {editing === "new" ? "Add Scooter" : "Save changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200/70 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scooter</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Range</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} data-testid={`admin-row-${p.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.tagline}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatINR(p.price)}</TableCell>
                    <TableCell>{p.range_km} km</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          data-testid={`admin-edit-${p.id}`}
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-red-600 hover:text-red-700"
                          data-testid={`admin-delete-${p.id}`}
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="rounded-2xl bg-white border border-gray-200/70 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
                {orders.map((o) => (
                  <TableRow key={o.id} data-testid={`order-row-${o.id}`}>
                    <TableCell className="font-mono text-xs">
                      {o.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{o.full_name}</p>
                      <p className="text-xs text-gray-500">{o.user_email}</p>
                    </TableCell>
                    <TableCell>
                      {o.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                    </TableCell>
                    <TableCell className="font-semibold">{formatINR(o.total)}</TableCell>
                    <TableCell className="text-xs">{o.payment_method}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-50 text-[#166534] px-2.5 py-0.5 text-xs font-semibold border border-green-100">
                        {o.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const AF = ({ label, children }) => (
  <div>
    <Label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
      {label}
    </Label>
    <div className="mt-1.5">{children}</div>
  </div>
);
