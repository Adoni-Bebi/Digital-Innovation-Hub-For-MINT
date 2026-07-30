import { useAuth } from "../../context/AuthContext";
import { mockAccessRequests } from "../../data/mockData";
import StatCard from "../../components/StatCard";
import {
  FileText, Inbox, Eye, Check, X, BadgeCheck
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function FounderDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState(mockAccessRequests);

  const handleAction = (id, action) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: action } : r
      )
    );
  };

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Founder Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back, {user?.fullName}. Manage your startup profile and investor access.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Profile Status" value="Verified" icon={BadgeCheck} color="primary" trend="MinT approved" />
        <StatCard label="Data Room Docs" value="4" icon={FileText} color="blue" trend="All uploaded" />
        <StatCard label="Pending Requests" value={pending.length} icon={Inbox} color="amber" trend="Awaiting your review" />
        <StatCard label="Total Views" value="156" icon={Eye} color="purple" trend="Last 30 days" />
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
              <p className="p-6 text-sm text-slate-500 text-center">No access requests yet.</p>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">{req.organization}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Ticket: {req.ticketSize} · Focus: {req.focus.join(", ")} · {req.requestedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {req.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleAction(req.id, "approved")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "denied")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
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
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Edit startup profile
              </button>
              <button className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Manage Data Room documents
              </button>
              <Link
                to="/directory/1"
                className="block w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                View public profile
              </Link>
            </div>
          </div>

          <div className="bg-primary-50 rounded-2xl border border-primary-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck size={18} className="text-primary-600" />
              <h3 className="font-semibold text-primary-900">MinT Verified</h3>
            </div>
            <p className="text-sm text-primary-800">
              Your startup is publicly visible in the directory. Investors can now request Data Room access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}