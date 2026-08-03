import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import StatCard from "../../components/StatCard";
import {
  FileText, Inbox, Eye, BadgeCheck, PlusCircle, Loader2,
  AlertCircle, Check, X
} from "lucide-react";

export default function FounderDashboard() {
  const { user } = useAuth();
  const [startup, setStartup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      const startupRes = await apiRequest("/startups/my");
      setStartup(startupRes.data);

      try {
        const reqRes = await apiRequest("/access-requests/incoming");
        setRequests(reqRes.data || []);
      } catch {
        setRequests([]);
      }
    } catch (err) {
      if (err.message.includes("No startup found")) {
        setStartup(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      await apiRequest(`/access-requests/${id}/${action}`, { method: "PATCH" });
      setRequests((prev) =>
        prev.map((r) =>
          r._id === id
            ? { ...r, status: action === "approve" ? "approved" : "denied" }
            : r
        )
      );
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

  if (!startup) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PlusCircle className="text-primary-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Create your Startup Profile
        </h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          You haven't submitted a startup yet. Create your profile to get MinT-verified.
        </p>
        <Link
          to="/founder/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl"
        >
          <PlusCircle size={18} /> Create Startup Profile
        </Link>
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === "pending");
  const statusColor = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    verified: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Founder Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back, {user?.fullName}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Profile Status"
          value={startup.status.charAt(0).toUpperCase() + startup.status.slice(1)}
          icon={BadgeCheck}
          color={startup.status === "verified" ? "primary" : "amber"}
        />
        <StatCard label="Data Room Docs" value="0" icon={FileText} color="blue" trend="Coming soon" />
        <StatCard label="Pending Requests" value={pending.length} icon={Inbox} color="amber" />
        <StatCard label="Total Requests" value={requests.length} icon={Eye} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Incoming Access Requests</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {pending.length} pending
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <p className="p-8 text-sm text-slate-500 text-center">
                No access requests yet.
              </p>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="px-6 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="font-semibold text-slate-900 text-sm">
                        {req.investor?.fullName || "Investor"}
                      </div>

                      <div className="text-xs text-slate-500 space-y-1">
                        <div>
                          <span className="text-slate-400">Organization:</span>{" "}
                          {req.investor?.organization || "—"}
                        </div>
                        <div>
                          <span className="text-slate-400">Investment range:</span>{" "}
                          {req.investor?.investmentRange || "—"}
                        </div>
                        <div>
                          <span className="text-slate-400">Focus:</span>{" "}
                          {req.investor?.focus?.length > 0
                            ? req.investor.focus.join(", ")
                            : "—"}
                        </div>
                        <div className="text-slate-400 pt-0.5">
                          Requested {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleAction(req._id, "approve")}
                            disabled={actionLoading === req._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(req._id, "deny")}
                            disabled={actionLoading === req._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50"
                          >
                            <X size={13} /> Deny
                          </button>
                        </>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                            req.status === "approved"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {req.status === "approved" ? <Check size={12} /> : <X size={12} />}
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                {startup.logo}
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">
                  {startup.companyName}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColor[startup.status]}`}
                >
                  {startup.status}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                to="/founder/create"
                className="block w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Edit startup profile
              </Link>
              {startup.status === "verified" && (
                <Link
                  to={`/directory/${startup._id}`}
                  className="block w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  View public profile
                </Link>
              )}
            </div>
          </div>

          {startup.status === "verified" && (
            <div className="bg-primary-50 rounded-2xl border border-primary-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck size={18} className="text-primary-600" />
                <h3 className="font-semibold text-primary-900">MinT Verified</h3>
              </div>
              <p className="text-sm text-primary-800">
                Your startup is publicly visible. Investors can request Data Room access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}