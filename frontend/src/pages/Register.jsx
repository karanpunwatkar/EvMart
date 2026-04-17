import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await register(form.name, form.email, form.password);
      toast.success(`Welcome to EVMart, ${u.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(
        formatApiErrorDetail(err.response?.data?.detail) || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="register-page" className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Already a member?{" "}
            <Link to="/login" className="text-[#166534] font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                data-testid="register-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 rounded-xl"
                placeholder="Yash Mahatale"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="register-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 rounded-xl"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="register-password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5 rounded-xl"
                placeholder="At least 6 characters"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              data-testid="register-submit"
              className="w-full rounded-full bg-[#166534] hover:bg-[#14532D] py-6 text-base"
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-[11px] text-gray-500 text-center">
            By signing up, you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative bg-gradient-to-br from-amber-100 via-[#FAFAF7] to-emerald-100 grain order-1 lg:order-2">
        <div className="absolute inset-0 p-16 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#166534]">
            <span className="h-9 w-9 rounded-xl bg-[#166534] text-white grid place-items-center">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl font-semibold">EVMart</span>
          </Link>
          <div>
            <h2 className="font-display text-5xl font-semibold leading-tight text-gray-900">
              Join the electric revolution.
            </h2>
            <p className="mt-4 text-gray-700 max-w-md">
              Create a free account to save your favorite scooters, track
              orders and check out twice as fast.
            </p>
          </div>
          <p className="text-xs text-gray-500">A student project · GH Raisoni College</p>
        </div>
      </div>
    </div>
  );
}
