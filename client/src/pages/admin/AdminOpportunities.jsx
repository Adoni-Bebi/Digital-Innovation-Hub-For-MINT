import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Megaphone,
  CheckCircle,
  XCircle,
} from "lucide-react";

const TYPES = [
  "scholarship",
  "internship",
  "job",
  "training",
  "competition",
  "announcement",
  "other",
];

const emptyForm = {
  title: "",
  description: "",
  type: "announcement",
  deadline: "",
  link: "",
  location: "",
};

export default function AdminOpportunities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async (status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ all: "true" });
      if (status && status !== "all") params.set("status", status);
      const res = await apiRequest(`/opportunities?${params.toString()}`);
      setItems(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load");
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
    if (!loading) fetchData(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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
      setMessage("Opportunity published. Logged-in users can now see it.");
      setForm(emptyForm);
      setShowForm(false);
      await fetchData(statusFilter);
    } catch (err) {
      setError(err.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id) => {
    setActionId(id);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/opportunities/${id}/approve`, { method: "PATCH" });
      setMessage("Approved and published");
      await fetchData(statusFilter);
    } catch (err) {
      setError(err.message || "Approve failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Rejection reason (optional):") || "";
    setActionId(id);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/opportunities/${id}/reject`, {
        method: "PATCH",
        body: { reason },
      });
      setMessage("Rejected");
      await fetchData(statusFilter);
    } catch (err) {
      setError(err.message || "Reject failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id, title) => {
    const ok = window.confirm(`Delete opportunity "${title}"?`);
    if (!ok) return;

    setDeletingId(id);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/opportunities/${id}`, { method: "DELETE" });
      setMessage("Deleted");
      await fetchData(statusFilter);
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 mb-2"
          >
            <ArrowLeft size={14} /> Back to Admin Panel
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Opportunities</h1>
          <p className="text-slate-500 text-sm mt-1">
            Approve investor posts and publish MinT announcements
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

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setStatusFilter(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              statusFilter === t.key
                ? "bg-primary-50 border-primary-500 text-primary-700"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {t.label}
            {t.key === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
        >
          <h2 className="font-semibold text-slate-900">Create opportunity (published immediately)</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. MinT Summer Internship 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
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
              placeholder="Full details..."
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
                placeholder="Addis Ababa / Online"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link (optional)</label>
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
              {saving ? "Publishing..." : "Publish"}
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

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <Megaphone className="mx-auto text-slate-300 mb-3" size={28} />
          <p className="text-sm font-medium text-slate-700">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-start gap-3"
            >
              <div className="flex-1 min-w-0">
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
                  {item.createdBy && (
                    <span className="text-xs text-slate-500">
                      by {item.createdBy.fullName}
                      {item.createdBy.role === "investor" ? " (investor)" : " (admin)"}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                {item.status === "rejected" && item.rejectionReason && (
                  <p className="mt-1 text-xs text-red-600">Reason: {item.rejectionReason}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {item.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(item._id)}
                      disabled={actionId === item._id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                    >
                      {actionId === item._id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CheckCircle size={13} />
                      )}
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(item._id)}
                      disabled={actionId === item._id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item._id, item.title)}
                  disabled={deletingId === item._id}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
                >
                  {deletingId === item._id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Delete
                </button>
              </div>
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