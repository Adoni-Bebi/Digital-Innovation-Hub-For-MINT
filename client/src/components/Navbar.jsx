import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu, X, LogOut, LayoutDashboard, User
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const dashboardLink = () => {
    if (!user) return null;
    if (user.role === "founder") return "/founder";
    if (user.role === "investor") return "/investor";
    if (user.role === "admin") return "/admin";
    return "/";
  };

  const navLink = (to, label) => {
    const active =
      location.pathname === to || location.pathname.startsWith(to + "/");

    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-primary-50 text-primary-700"
            : "text-slate-600 hover:text-primary-700 hover:bg-slate-50"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-sm">DIH</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-slate-900 leading-tight">
                Digital Innovation Hub
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                Ministry of Innovation & Technology
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLink("/", "Home")}
            {navLink("/directory", "Startup Directory")}
            {isAuthenticated && user?.role === "founder" && navLink("/founder", "My Dashboard")}
            {isAuthenticated && user?.role === "investor" && navLink("/investor", "Investor Hub")}
            {isAuthenticated && user?.role === "admin" && navLink("/admin", "Admin Panel")}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="text-right hover:opacity-80 transition-opacity"
                >
                  <div className="text-sm font-medium text-slate-900">
                    {user.fullName}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {user.role} · Profile
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary-700 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1">
          {navLink("/", "Home")}
          {navLink("/directory", "Startup Directory")}

          {isAuthenticated && (
            <>
              <Link
                to={dashboardLink()}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700"
              >
                <User size={16} /> Profile
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 mt-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 w-full"
              >
                <LogOut size={16} /> Logout ({user.fullName})
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg text-center"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}