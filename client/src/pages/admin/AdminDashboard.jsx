import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import StatCard from "../../components/StatCard";
import {
  Building2, CheckCircle, XCircle, Users, Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      const [pendingRes, statsRes] = await Promise.all([
        apiRequest("/startups/pending"),
        apiRequest("/startups/stats"),
      ]);
      setPending(pendingRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await apiRequest(`/startups/${id}/approve`, { method: "PATCH" });
      // Refresh both pending list and stats
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Rejection reason (optional):");
    setActionLoading(id);
    try {
      await apiRequest(`/startups/${id}/reject`, {
        method: "PATCH",
        body: { reason: reason || "Did not meet verification criteria" },
      });
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

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
        <h1 className="text-2xl font-bold text-slate-900">MinT Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-1">
          Ecosystem oversight · {user?.fullName}
        </p>
      </div>

      {/* Real Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Pending Review"
          value={stats?.pending ?? 0}
          icon={Building2}
          color="amber"
        />
        <StatCard
          label="Verified"
          value={stats?.verified ?? 0}
          icon={CheckCircle}
          color="primary"
        />
        <StatCard
          label="Investors"
          value={stats?.totalInvestors ?? 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Total Startups"
          value={stats?.totalStartups ?? 0}
          icon={Building2}
          color="blue"
        />
      </div>

      {/* Verification Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Verification Queue</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            {pending.length} awaiting
          </span>
        </div>

        {pending.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Queue is empty. All profiles reviewed.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pending.map((item) => (
              <div key={item._id} className="px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">
                      {item.companyName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.sector} · {item.fundingStage} · {item.location} · Founder:{" "}
                      {item.founder?.fullName || "—"}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Submitted {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(item._id)}
                      disabled={actionLoading === item._id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(item._id)}
                      disabled={actionLoading === item._id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}