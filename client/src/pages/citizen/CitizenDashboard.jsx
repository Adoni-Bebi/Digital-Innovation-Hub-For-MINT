import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BookOpen,
  Building2,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
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
      title: "Learning Resources",
      description: "Access guides, toolkits, and Digital Ethiopia 2030 materials.",
      icon: BookOpen,
      to: "/learning",          // will be created later
      color: "bg-blue-50 text-blue-600",
      comingSoon: true,
    },
    {
      title: "Mentor Matching",
      description: "Connect with industry mentors and experts.",
      icon: Users,
      to: "/mentors",           // will be created later
      color: "bg-amber-50 text-amber-600",
      comingSoon: true,
    },
    {
      title: "Innovation Competitions",
      description: "Participate in national innovation challenges.",
      icon: Trophy,
      to: "/competitions",      // will be created later
      color: "bg-purple-50 text-purple-600",
      comingSoon: true,
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
          Explore Ethiopia’s innovation ecosystem, learn from resources, and stay
          connected with startups, mentors, and opportunities.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {features.map((item) => (
          <Link
            key={item.title}
            to={item.comingSoon ? "#" : item.to}
            className={`group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-primary-200 transition-all ${
              item.comingSoon ? "opacity-80 cursor-default" : ""
            }`}
            onClick={(e) => item.comingSoon && e.preventDefault()}
          >
            {item.comingSoon && (
              <span className="absolute top-4 right-4 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                Coming soon
              </span>
            )}

            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color}`}
            >
              <item.icon size={22} />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-primary-700 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-slate-600 mb-4">{item.description}</p>

            {!item.comingSoon && (
              <div className="flex items-center text-sm font-medium text-primary-600">
                Explore
                <ArrowRight
                  size={16}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Quick note */}
      <div className="mt-10 p-5 rounded-2xl bg-slate-50 border border-slate-200">
        <p className="text-sm text-slate-600">
          More features (Learning Resources, Mentors, Competitions, Certificates, and AI Assistant)
          will be added soon. This is the starting point for the Citizen experience.
        </p>
      </div>
    </div>
  );
}