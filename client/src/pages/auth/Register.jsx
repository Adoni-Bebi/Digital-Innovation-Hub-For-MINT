import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "founder",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const user = await register(
        form.fullName,
        form.email,
        form.password,
        form.role
      );

      if (user.role === "founder") navigate("/founder");
else if (user.role === "investor") navigate("/investor");
else navigate("/citizen");          // for citizen
    } catch (err) {
      setError(err.message || "Registration failed");
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
            Join Ethiopia's official innovation platform
          </h1>
          <p className="text-primary-100 text-lg">
            Register as a founder to get MinT-verified, or as an investor to access the vetted startup pipeline.
          </p>
        </div>
        <p className="text-sm text-primary-200/70">
          Aligned with Digital Ethiopia 2030
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-8">
            Already registered?{" "}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection - Only Founder & Investor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                I am a…
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
  { value: "founder", label: "Startup Founder", desc: "Get verified & discovered" },
  { value: "investor", label: "Investor", desc: "Discover vetted startups" },
  { value: "citizen", label: "Citizen", desc: "Explore & learn" },
].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      form.role === r.value
                        ? "bg-primary-50 border-primary-500"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        form.role === r.value ? "text-primary-700" : "text-slate-800"
                      }`}
                    >
                      {r.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Abebe Kebede"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
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
                  <Loader2 size={16} className="animate-spin" /> Creating account...
                </>
              ) : (
                <>
                  Create account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}