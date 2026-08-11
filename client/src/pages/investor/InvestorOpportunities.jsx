import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Megaphone,
  Briefcase,
} from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  type: "internship",
  deadline: "",
  link: "",
  location: "",
};

export default function InvestorOpportunities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/opportunities/my");
      setItems(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/opportunities", {
        method: "POST",
        body: {
          ...form,
          deadline: form.deadline || undefined,
        },
      });
      setMessage(
        "Submitted for MinT approval. You will be notified when it is approved or rejected."
      );
      setForm(emptyForm);
      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to="/investor"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 mb-2"
          >
            <ArrowLeft size={14} /> Back to Investor Hub
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Post Jobs & Internships</h1>
          <p className="text-slate-500 text-sm mt-1">
            Submit internship or job offers. They become visible after MinT admin approval.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl"
        >
          <Plus size={16} /> New post
        </button>
      </div>

      {(message || error) && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${
            error
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-green-50 text-green-700 border border-green-100"
          }`}
        >
          {error || message}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
        >
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Briefcase size={18} /> Submit internship or job offer
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Frontend Intern – FinTech startup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="internship">Internship</option>
              <option value="job">Job Offer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Role, requirements, benefits, how to apply..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline (optional)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location (optional)</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Addis Ababa / Remote"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Application link (optional)</label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-semibold rounded-lg"
            >
              {saving ? "Submitting..." : "Submit for approval"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h2 className="text-sm font-semibold text-slate-700 mb-3">My submissions</h2>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
          <Megaphone className="mx-auto text-slate-300 mb-3" size={26} />
          <p className="text-sm font-medium text-slate-700">No posts yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Submit an internship or job offer to reach the ecosystem.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                  {item.type}
                </span>
                <StatusBadge status={item.status} />
                <span className="text-xs text-slate-400">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
              {item.status === "rejected" && item.rejectionReason && (
                <p className="mt-1 text-xs text-red-600">
                  Reason: {item.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-green-50 text-green-700 border-green-200",
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