import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import StatCard from "../../components/StatCard";
import StartupCard from "../../components/StartupCard";
import { Search, Send, CheckCircle, Clock, Loader2, Pencil } from "lucide-react";
import { SECTORS } from "../../data/mockData";

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [profileForm, setProfileForm] = useState({
    organization: "",
    investmentRange: "",
    focus: [],
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        organization: user.organization || "",
        investmentRange: user.investmentRange || "",
        focus: user.focus || [],
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, startupsRes] = await Promise.all([
          apiRequest("/access-requests/my"),
          apiRequest("/startups"),
        ]);
        setRequests(requestsRes.data || []);
        setRecommended((startupsRes.data || []).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFocusToggle = (sector) => {
    setProfileForm((prev) => {
      const exists = prev.focus.includes(sector);
      return {
        ...prev,
        focus: exists
          ? prev.focus.filter((s) => s !== sector)
          : [...prev.focus, sector],
      };
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileError("");

    try {
      const res = await apiRequest("/auth/profile", {
        method: "PUT",
        body: profileForm,
      });

      const savedUser = JSON.parse(localStorage.getItem("dih_user") || "{}");
      const updatedUser = { ...savedUser, ...res.user };
      localStorage.setItem("dih_user", JSON.stringify(updatedUser));

      window.location.reload();
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Investor Hub</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome, {user?.fullName}. Discover and evaluate MinT-verified startups.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Requests Sent" value={requests.length} icon={Send} color="blue" />
        <StatCard label="Approved" value={approvedCount} icon={CheckCircle} color="primary" />
        <StatCard label="Pending" value={pendingCount} icon={Clock} color="amber" />
        <StatCard label="Focus Sectors" value={user?.focus?.length || 0} icon={Search} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">My Access Requests</h2>
            <Link to="/directory" className="text-xs font-medium text-primary-600 hover:underline">
              Browse more
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500 mb-3">No access requests yet.</p>
                <Link to="/directory" className="text-sm font-medium text-primary-600 hover:underline">
                  Browse startups →
                </Link>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">
                      {req.startup?.companyName || "Startup"}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Requested {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                      req.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : req.status === "pending"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Investor Profile</h3>
              <button
                onClick={() => setShowEdit(!showEdit)}
                className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Pencil size={16} />
              </button>
            </div>

            {!showEdit ? (
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-slate-500">Organization:</span>{" "}
                  <span className="font-medium text-slate-800">
                    {user?.organization || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Investment range:</span>{" "}
                  <span className="font-medium text-slate-800">
                    {user?.investmentRange || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Focus:</span>{" "}
                  <span className="font-medium text-slate-800">
                    {user?.focus?.length > 0 ? user.focus.join(", ") : "Not set"}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Organization
                  </label>
                  <input
                    value={profileForm.organization}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, organization: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="East Africa Ventures"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Investment Range
                  </label>
                  <select
                    value={profileForm.investmentRange}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, investmentRange: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select range</option>
                    <option value="$10k–$50k">$10k–$50k</option>
                    <option value="$50k–$250k">$50k–$250k</option>
                    <option value="$250k–$1M">$250k–$1M</option>
                    <option value="$1M+">$1M+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Focus Sectors
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SECTORS.map((sector) => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => handleFocusToggle(sector)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                          profileForm.focus.includes(sector)
                            ? "bg-primary-50 border-primary-500 text-primary-700"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                {profileError && (
                  <p className="text-xs text-red-600">{profileError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-semibold rounded-lg"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <Link
            to="/directory"
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Search size={16} /> Explore Directory
          </Link>
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recommended for you</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((s) => (
              <StartupCard key={s._id} startup={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}