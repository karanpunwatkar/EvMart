import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      navigate(u.role === "admin" ? "/admin" : from, { replace: true });
    } catch (err) {
      toast.error(
        formatApiErrorDetail(err.response?.data?.detail) || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-page" className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-gradient-to-br from-[#0F1B12] via-[#166534] to-[#22C55E] grain">
        <div className="absolute inset-0 p-16 flex flex-col justify-between text-white">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-white text-[#166534] grid place-items-center">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl font-semibold">EVMart</span>
          </Link>
          <div>
            <h2 className="font-display text-5xl font-semibold leading-tight">
              Welcome back.
            </h2>
            <p className="mt-4 text-white/80 max-w-md">
              Continue your journey toward sustainable mobility. Sign in to track orders,
              save scooters and check out faster.
            </p>
          </div>
          <p className="text-xs text-white/60">
            © EVMart — GH Raisoni College student project
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-gray-600 text-sm">
            New here?{" "}
            <Link to="/register" className="text-[#166534] font-medium hover:underline">
              Create an account
            </Link>
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 rounded-xl"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="login-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 rounded-xl"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full rounded-full bg-[#166534] hover:bg-[#14532D] py-6 text-base"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <p className="font-semibold">Demo admin credentials</p>
            <p className="mt-1">admin@evmart.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
