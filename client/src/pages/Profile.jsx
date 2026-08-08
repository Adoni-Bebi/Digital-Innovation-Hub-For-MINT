import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { SECTORS } from "../data/mockData";
import { User, Lock, Save, Loader2, CheckCircle } from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    organization: "",
    investmentRange: "",
    focus: [],
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        companyName: user.companyName || "",
        organization: user.organization || "",
        investmentRange: user.investmentRange || "",
        focus: user.focus || [],
      }));
    }
  }, [user]);

  const handleFocusToggle = (sector) => {
    setForm((prev) => {
      const exists = prev.focus.includes(sector);
      return {
        ...prev,
        focus: exists
          ? prev.focus.filter((s) => s !== sector)
          : [...prev.focus, sector],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          throw new Error("New passwords do not match");
        }
        if (form.newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters");
        }
      }

      const payload = {
        fullName: form.fullName,
      };

      if (user.role === "founder") {
        payload.companyName = form.companyName;
      }

      if (user.role === "investor") {
        payload.organization = form.organization;
        payload.investmentRange = form.investmentRange;
        payload.focus = form.focus;
      }

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      await updateProfile(payload);

      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Update your account details ·{" "}
          <span className="capitalize font-medium text-slate-700">{user.role}</span>
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* Account info */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-primary-600" />
            <h2 className="font-semibold text-slate-900">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Founder field */}
            {user.role === "founder" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Name (optional)
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  placeholder="Your company or brand name"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Investor fields */}
            {user.role === "investor" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) =>
                      setForm({ ...form, organization: e.target.value })
                    }
                    placeholder="East Africa Ventures"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Investment Range
                  </label>
                  <select
                    value={form.investmentRange}
                    onChange={(e) =>
                      setForm({ ...form, investmentRange: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">Select range</option>
                    <option value="$10k–$50k">$10k–$50k</option>
                    <option value="$50k–$250k">$50k–$250k</option>
                    <option value="$250k–$1M">$250k–$1M</option>
                    <option value="$1M+">$1M+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Focus Sectors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map((sector) => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => handleFocusToggle(sector)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          form.focus.includes(sector)
                            ? "bg-primary-50 border-primary-500 text-primary-700"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-primary-600" />
            <h2 className="font-semibold text-slate-900">Change Password</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Leave blank if you don’t want to change your password
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Messages + Save */}
        <div className="px-6 py-5">
          {error && (
            <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-3 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle size={16} /> {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}