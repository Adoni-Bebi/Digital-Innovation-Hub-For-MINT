import { Link } from "react-router-dom";
import { MapPin, Users, BadgeCheck, ArrowUpRight } from "lucide-react";

const sectorColors = {
  FinTech: "bg-blue-50 text-blue-700 border-blue-200",
  AgriTech: "bg-green-50 text-green-700 border-green-200",
  EdTech: "bg-purple-50 text-purple-700 border-purple-200",
  HealthTech: "bg-rose-50 text-rose-700 border-rose-200",
  LogisticsTech: "bg-orange-50 text-orange-700 border-orange-200",
  CleanTech: "bg-teal-50 text-teal-700 border-teal-200",
  Other: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function StartupCard({ startup }) {
  // Support both mock (id) and real backend (_id)
  const id = startup._id || startup.id;

  return (
    <Link
      to={`/directory/${id}`}
      className="group block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
              {startup.logo || "🚀"}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors leading-tight">
                {startup.companyName}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <BadgeCheck size={14} className="text-primary-600" />
                <span className="text-xs font-medium text-primary-600">MinT Verified</span>
              </div>
            </div>
          </div>
          <ArrowUpRight
            size={18}
            className="text-slate-300 group-hover:text-primary-500 transition-colors shrink-0"
          />
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {startup.oneLineDescription}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              sectorColors[startup.sector] || sectorColors.Other
            }`}
          >
            {startup.sector}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            {startup.fundingStage}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {startup.location}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} /> {startup.teamSize} people
          </span>
        </div>
      </div>
    </Link>
  );
}