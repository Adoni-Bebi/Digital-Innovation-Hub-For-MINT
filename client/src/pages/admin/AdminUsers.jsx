import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import StatCard from "../../components/StatCard";
import {
  Users,
  Search,
  Loader2,
  ArrowLeft,
  UserCircle,
  Building2,
  Briefcase,
  Shield,
} from "lucide-react";

const ROLE_TABS = [
  { key: "all", label: "All" },
  { key: "founder", label: "Founders" },
  { key: "investor", label: "Investors" },
  { key: "admin", label: "Admins" },
];

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState({
    total: 0,
    founder: 0,
    investor: 0,
    admin: 0,
  });
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");

  const fetchUsers = async (selectedRole = role, q = search) => {
    setListLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRole && selectedRole !== "all") {
        params.set("role", selectedRole);
      }
      if (q && q.trim()) {
        params.set("search", q.trim());
      }

      const res = await apiRequest(`/users?${params.toString()}`);
      setUsers(res.data || []);
      if (res.roleCounts) {
        setRoleCounts(res.roleCounts);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setListLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("all", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchUsers(role, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(role, search);
  };

  const roleBadge = (r) => {
    const styles = {
      founder: "bg-blue-50 text-blue-700 border-blue-200",
      investor: "bg-purple-50 text-purple-700 border-purple-200",
      admin: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return (
      <span
        className={`px-2 py-0.5 text-[11px] font-medium rounded-full border capitalize ${
          styles[r] || "bg-slate-50 text-slate-600 border-slate-200"
        }`}
      >
        {r}
      </span>
    );
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 mb-2"
          >
            <ArrowLeft size={14} /> Back to Admin Panel
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
          <p className="text-slate-500 text-sm mt-1">
            Registered accounts · managed by {user?.fullName}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={roleCounts.total} icon={Users} color="blue" />
        <StatCard label="Founders" value={roleCounts.founder} icon={Building2} color="primary" />
        <StatCard label="Investors" value={roleCounts.investor} icon={Briefcase} color="purple" />
        <StatCard label="Admins" value={roleCounts.admin} icon={Shield} color="amber" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-4 border-b border-slate-100 flex flex-wrap gap-1">
          {ROLE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setRole(t.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                role === t.key
                  ? "text-primary-700 border-b-2 border-primary-600 bg-primary-50/50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {t.label}
              {t.key !== "all" && roleCounts[t.key] > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {roleCounts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
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
              placeholder="Search by name, email, organization…"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg"
          >
            Search
          </button>
        </form>

        {/* List */}
        {listLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <UserCircle className="text-slate-400" size={22} />
            </div>
            <p className="text-slate-600 font-medium text-sm">No users found</p>
            <p className="text-slate-400 text-xs mt-1">
              Try another role tab or clear your search
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                    {(u.fullName || "?").charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-slate-900 text-sm">
                        {u.fullName}
                      </span>
                      {roleBadge(u.role)}
                    </div>
                    <div className="text-xs text-slate-500 space-x-3">
                      <span>{u.email}</span>
                      {u.role === "investor" && u.organization && (
                        <span>· {u.organization}</span>
                      )}
                      {u.role === "founder" && u.companyName && (
                        <span>· {u.companyName}</span>
                      )}
                      {u.role === "investor" && u.investmentRange && (
                        <span>· {u.investmentRange}</span>
                      )}
                    </div>
                    {u.role === "investor" && u.focus?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {u.focus.map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 shrink-0 sm:text-right">
                    Joined{" "}
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "—"}
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