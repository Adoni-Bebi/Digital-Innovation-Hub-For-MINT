import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import StatCard from "../../components/StatCard";
import StartupCard from "../../components/StartupCard";
import { Search, Send, CheckCircle, Clock, Loader2 } from "lucide-react";

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <StatCard label="Saved" value="—" icon={Search} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Access Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">My Access Requests</h2>
            <Link to="/directory" className="text-xs font-medium text-primary-600 hover:underline">
              Browse more
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                No access requests yet.{" "}
                <Link to="/directory" className="text-primary-600 hover:underline">
                  Browse startups
                </Link>
              </p>
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

        {/* Side panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">KYC Status</h3>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">Approved</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Organization: {user?.organization || "—"}</p>
            </div>
          </div>

          <Link
            to="/directory"
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Search size={16} /> Explore Directory
          </Link>
        </div>
      </div>

      {/* Recommended */}
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