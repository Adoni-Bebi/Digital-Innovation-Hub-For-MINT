import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../utils/api";
import {
  Loader2,
  Megaphone,
  ExternalLink,
  Calendar,
  MapPin,
  ArrowLeft,
} from "lucide-react";

const TYPE_LABELS = {
  scholarship: "Scholarship",
  internship: "Internship",
  training: "Training",
  competition: "Competition",
  announcement: "Announcement",
  other: "Other",
};

const TYPE_STYLES = {
  scholarship: "bg-green-50 text-green-700 border-green-200",
  internship: "bg-blue-50 text-blue-700 border-blue-200",
  training: "bg-amber-50 text-amber-700 border-amber-200",
  competition: "bg-purple-50 text-purple-700 border-purple-200",
  announcement: "bg-slate-100 text-slate-700 border-slate-200",
  other: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function Opportunities() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [error, setError] = useState("");

  const fetchData = async (selectedType = type) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedType && selectedType !== "all") {
        params.set("type", selectedType);
      }
      const res = await apiRequest(`/opportunities?${params.toString()}`);
      setItems(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load opportunities");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) fetchData(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const backLink =
    user?.role === "citizen"
      ? "/citizen"
      : user?.role === "admin"
      ? "/admin"
      : user?.role === "founder"
      ? "/founder"
      : user?.role === "investor"
      ? "/investor"
      : "/";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link
          to={backLink}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 mb-2"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2 text-primary-600 text-sm font-medium mb-1">
          <Megaphone size={16} />
          Opportunities
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Scholarships, internships & announcements
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Official posts from MinT — visible only to logged-in users
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...Object.keys(TYPE_LABELS)].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              type === t
                ? "bg-primary-50 border-primary-500 text-primary-700"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {t === "all" ? "All" : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <Megaphone className="mx-auto text-slate-300 mb-3" size={28} />
          <p className="text-sm font-medium text-slate-700">No opportunities yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Check back later for scholarships, internships, and announcements.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-full border capitalize ${
                    TYPE_STYLES[item.type] || TYPE_STYLES.other
                  }`}
                >
                  {TYPE_LABELS[item.type] || item.type}
                </span>
                <span className="text-xs text-slate-400">
                  Posted{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-slate-600 whitespace-pre-line mb-3">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
                {item.deadline && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={13} /> Deadline{" "}
                    {new Date(item.deadline).toLocaleDateString()}
                  </span>
                )}
                {item.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} /> {item.location}
                  </span>
                )}
              </div>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
                >
                  Open link <ExternalLink size={14} />
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}