import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import StatCard from "../../components/StatCard";
import {
  FileText, Inbox, Eye, BadgeCheck, PlusCircle, Loader2, AlertCircle
} from "lucide-react";

export default function FounderDashboard() {
  const { user } = useAuth();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyStartup = async () => {
      try {
        const res = await apiRequest("/startups/my");
        setStartup(res.data);
      } catch (err) {
        // 404 means no startup yet — not a real error
        if (err.message.includes("No startup found")) {
          setStartup(null);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyStartup();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // No startup yet
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
          You haven't submitted a startup yet. Create your profile to get MinT-verified and appear in the public directory.
        </p>
        <Link
          to="/founder/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
        >
          <PlusCircle size={18} /> Create Startup Profile
        </Link>
      </div>
    );
  }

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

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Profile Status"
          value={startup.status.charAt(0).toUpperCase() + startup.status.slice(1)}
          icon={BadgeCheck}
          color={startup.status === "verified" ? "primary" : "amber"}
          trend={startup.status === "verified" ? "MinT approved" : "Under review"}
        />
        <StatCard label="Data Room Docs" value="0" icon={FileText} color="blue" trend="Coming soon" />
        <StatCard label="Pending Requests" value="0" icon={Inbox} color="amber" trend="Coming soon" />
        <StatCard label="Total Views" value="—" icon={Eye} color="purple" trend="Coming soon" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Startup Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                {startup.logo}
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{startup.companyName}</h2>
                <p className="text-sm text-slate-500">{startup.oneLineDescription}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${statusColor[startup.status]}`}>
              {startup.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm mt-6">
            <div>
              <span className="text-slate-500">Sector:</span>{" "}
              <span className="font-medium text-slate-800">{startup.sector}</span>
            </div>
            <div>
              <span className="text-slate-500">Stage:</span>{" "}
              <span className="font-medium text-slate-800">{startup.fundingStage}</span>
            </div>
            <div>
              <span className="text-slate-500">Location:</span>{" "}
              <span className="font-medium text-slate-800">{startup.location}</span>
            </div>
            <div>
              <span className="text-slate-500">Team Size:</span>{" "}
              <span className="font-medium text-slate-800">{startup.teamSize}</span>
            </div>
          </div>

          {startup.status === "rejected" && startup.rejectionReason && (
            <div className="mt-6 p-4 bg-red-50 rounded-xl text-sm text-red-700">
              <strong>Rejection reason:</strong> {startup.rejectionReason}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/founder/create"
                className="block w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Edit startup profile
              </Link>
              {startup.status === "verified" && (
                <Link
                  to={`/directory/${startup._id}`}
                  className="block w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
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
                Your startup is publicly visible in the directory.
              </p>
            </div>
          )}

          {startup.status === "pending" && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
              <h3 className="font-semibold text-amber-900 mb-1">Under Review</h3>
              <p className="text-sm text-amber-800">
                Your profile is waiting for MinT verification. This usually takes a few days.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}