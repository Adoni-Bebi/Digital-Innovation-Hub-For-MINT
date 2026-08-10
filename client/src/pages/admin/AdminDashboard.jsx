import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import StatCard from "../../components/StatCard";
import { SECTORS } from "../../data/mockData";
import {
  Building2,
  CheckCircle,
  XCircle,
  Users,
  Loader2,
  Search,
  Inbox,
} from "lucide-react";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");

  const fetchStats = async () => {
    try {
      const res = await apiRequest("/startups/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStartups = async (status = tab, q = search, sec = sector) => {
    setListLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q) params.set("search", q);
      if (sec) params.set("sector", sec);

      const res = await apiRequest(`/startups/admin?${params.toString()}`);
      setStartups(res.data || []);
    } catch (err) {
      console.error(err);
      setStartups([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchStartups("pending", "", "")]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchStartups(tab, search, sector);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStartups(tab, search, sector);
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await apiRequest(`/startups/${id}/approve`, { method: "PATCH" });
      await Promise.all([fetchStats(), fetchStartups(tab, search, sector)]);
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
      await Promise.all([fetchStats(), fetchStartups(tab, search, sector)]);
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
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">MinT Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">
            Ecosystem oversight · {user?.fullName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/opportunities"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Opportunities
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Users size={16} /> Manage Users
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Pending Review"
          value={stats?.pending ?? 0}
          icon={Inbox}
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

      {/* Main panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-4 border-b border-slate-100 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                tab === t.key
                  ? "text-primary-700 border-b-2 border-primary-600 bg-primary-50/50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {t.label}
              {t.key === "pending" && stats?.pending > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <form
          onSubmit={handleSearch}
          className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name or description…"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All sectors</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg"
          >
            Filter
          </button>
        </form>

        {/* List */}
        {listLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
          </div>
        ) : startups.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Inbox className="text-slate-400" size={22} />
            </div>
            <p className="text-slate-600 font-medium text-sm">No startups found</p>
            <p className="text-slate-400 text-xs mt-1">
              Try another tab or clear your filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {startups.map((item) => (
              <div key={item._id} className="px-4 sm:px-6 py-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-lg leading-none">{item.logo || "🚀"}</span>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {item.companyName}
                      </h3>
                      <StatusBadge status={item.status} />
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                      {item.oneLineDescription}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{item.sector}</span>
                      <span>{item.fundingStage}</span>
                      <span>{item.location}</span>
                      <span>Team: {item.teamSize}</span>
                      <span>
                        Founder: {item.founder?.fullName || "—"}
                        {item.founder?.email ? ` · ${item.founder.email}` : ""}
                      </span>
                      <span>
                        Submitted {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.status === "rejected" && item.rejectionReason && (
                      <p className="mt-2 text-xs text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg inline-block">
                        Reason: {item.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {item.status === "verified" && (
                      <Link
                        to={`/directory/${item._id}`}
                        className="px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg"
                      >
                        View public
                      </Link>
                    )}

                    {item.status === "pending" && (
                      <>
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
                      </>
                    )}

                    {item.status === "rejected" && (
                      <button
                        onClick={() => handleApprove(item._id)}
                        disabled={actionLoading === item._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                      >
                        <CheckCircle size={13} /> Approve anyway
                      </button>
                    )}
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

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    verified: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`px-2 py-0.5 text-[11px] font-medium rounded-full border capitalize ${
        styles[status] || "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}