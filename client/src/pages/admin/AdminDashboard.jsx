import { useAuth } from "../../context/AuthContext";
import { analyticsData, mockPendingVerifications } from "../../data/mockData";
import StatCard from "../../components/StatCard";
import {
  Building2, CheckCircle, XCircle, Users, TrendingUp
} from "lucide-react";
import { useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend
} from "recharts";

const COLORS = ["#0d9488", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#64748b"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [queue, setQueue] = useState(mockPendingVerifications);
  const { overview, sectorDistribution, stageDistribution, dealFlow } = analyticsData;

  const handleVerify = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">MinT Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-1">
          Ecosystem oversight · {user?.fullName}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Startups" value={overview.totalStartups} icon={Building2} color="blue" />
        <StatCard label="Verified" value={overview.verified} icon={CheckCircle} color="primary" trend={`${overview.pending} pending review`} />
        <StatCard label="Investors" value={overview.totalInvestors} icon={Users} color="purple" />
        <StatCard label="Deal-flow (this month)" value={overview.accessRequestsThisMonth} icon={TrendingUp} color="amber" trend={`${overview.approvedThisMonth} approved`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Verification Queue</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {queue.length} awaiting
            </span>
          </div>
          {queue.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">Queue is empty. All profiles reviewed.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {queue.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 text-sm">{item.companyName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.sector} · {item.fundingStage} · {item.location} · Founder: {item.founder}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">Submitted {item.submittedAt}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        onClick={() => handleVerify(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Sector Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sectorDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {sectorDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {sectorDistribution.map((s, i) => (
              <span key={s.name} className="inline-flex items-center gap-1 text-[10px] text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Deal-flow Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dealFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" />
              <Line type="monotone" dataKey="approved" stroke="#0d9488" strokeWidth={2} name="Approved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Funding Stage Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} name="Startups" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}