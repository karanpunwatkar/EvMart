import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Zap, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const navCls = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-[#166534]" : "text-gray-700 hover:text-[#166534]"
    }`;

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/60"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-16 flex items-center justify-between">
        <Link
          to="/"
          data-testid="logo-link"
          className="flex items-center gap-2 group"
        >
          <span className="h-9 w-9 rounded-xl bg-[#166534] text-white grid place-items-center shadow-sm group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            EV<span className="text-[#166534]">Mart</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navCls} data-testid="nav-home">
            Home
          </NavLink>
          <NavLink to="/products" className={navCls} data-testid="nav-products">
            Scooters
          </NavLink>
          <a href="/#sustainability" className="text-sm font-medium text-gray-700 hover:text-[#166534]">
            Sustainability
          </a>
          <a href="/#about" className="text-sm font-medium text-gray-700 hover:text-[#166534]">
            About
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" data-testid="cart-link" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-green-50"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-800" />
              {count > 0 && (
                <span
                  data-testid="cart-count-badge"
                  className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-[#166534] text-white text-[11px] font-semibold grid place-items-center"
                >
                  {count}
                </span>
              )}
            </Button>
          </Link>

          {user && user.id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full gap-2 pl-2 pr-3"
                  data-testid="user-menu-trigger"
                >
                  <span className="h-7 w-7 rounded-full bg-green-100 text-[#166534] grid place-items-center text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </span>
                  <span className="hidden sm:inline text-sm font-medium text-gray-800">
                    {user.name?.split(" ")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin")}
                    data-testid="menu-admin"
                  >
                    <Shield className="mr-2 h-4 w-4" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/")} data-testid="menu-home">
                  <User className="mr-2 h-4 w-4" /> My Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  data-testid="menu-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="rounded-full"
                  data-testid="header-login-btn"
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  className="rounded-full bg-[#166534] hover:bg-[#14532D]"
                  data-testid="header-signup-btn"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
