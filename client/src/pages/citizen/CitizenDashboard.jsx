import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Building2,
  ArrowRight,
  Sparkles,
  Megaphone,
} from "lucide-react";

export default function CitizenDashboard() {
  const { user } = useAuth();

  const features = [
    {
      title: "Startup Directory",
      description: "Explore MinT-verified startups from across Ethiopia.",
      icon: Building2,
      to: "/directory",
      color: "bg-primary-50 text-primary-600",
    },
    {
      title: "Opportunities",
      description: "Jobs, internships, scholarships and official announcements.",
      icon: Megaphone,
      to: "/opportunities",
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-primary-600 text-sm font-medium mb-2">
          <Sparkles size={16} />
          Citizen Portal
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {user?.fullName?.split(" ")[0] || "Citizen"}
        </h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Explore Ethiopia’s innovation ecosystem, discover jobs and internships,
          and stay connected with startups and opportunities.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {features.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color}`}
            >
              <item.icon size={22} />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-primary-700 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-slate-600 mb-4">{item.description}</p>

            <div className="flex items-center text-sm font-medium text-primary-600">
              Explore
              <ArrowRight
                size={16}
                className="ml-1 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}