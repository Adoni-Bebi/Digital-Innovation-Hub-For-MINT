import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);

      // Redirect based on real role from backend
      if (user.role === "founder") navigate("/founder");
else if (user.role === "investor") navigate("/investor");
else if (user.role === "admin") navigate("/admin");
else if (user.role === "citizen") navigate("/citizen");
else navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-800 to-slate-900 text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              DIH
            </div>
            <span className="font-semibold">Digital Innovation Hub</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Welcome back to Ethiopia's innovation ecosystem
          </h1>
          <p className="text-primary-100 text-lg">
            Sign in to manage your startup, review deal-flow, or oversee verification.
          </p>
        </div>
        <p className="text-sm text-primary-200/70">
          Official platform of the Ministry of Innovation and Technology
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
          <p className="text-slate-500 text-sm mb-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}