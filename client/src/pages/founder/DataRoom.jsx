import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import {
  ArrowLeft,
  Loader2,
  Upload,
  FileText,
  Trash2,
  Download,
} from "lucide-react";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DataRoom() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const fetchDocs = async () => {
    try {
      const res = await apiRequest("/documents/my");
      setDocs(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError("Title and file are required");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("file", file);

      await apiRequest("/documents", {
        method: "POST",
        body: formData,
      });

      setTitle("");
      setFile(null);
      const input = document.getElementById("data-room-file");
      if (input) input.value = "";

      await fetchDocs();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // IMPORTANT: blob download (same as investor)
  const handleDownload = async (doc) => {
  try {
    const blob = await apiRequest(`/documents/${doc._id}/download`, { blob: true });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.originalName || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.message || "Download failed");
  }
};

  const handleDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    try {
      await apiRequest(`/documents/${id}`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm text-slate-500">Loading Data Room…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/founder"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-700 mb-6"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Secure Data Room</h1>
      <p className="text-slate-500 text-sm mb-8">
        Upload sensitive documents to the cloud. Only investors you approve can download them.
      </p>

      <form
        onSubmit={handleUpload}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 space-y-4"
      >
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <Upload size={18} /> Upload document
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pitch Deck, Financial Projections"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            File * (PDF, Word, Excel, PPT, images — max 10MB)
          </label>
          <input
            id="data-room-file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium hover:file:bg-primary-100"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Uploading to cloud…
            </>
          ) : (
            <>
              <Upload size={16} /> Upload
            </>
          )}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Documents ({docs.length})</h2>
        </div>

        {docs.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-sm text-slate-600 font-medium">No documents yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Upload your pitch deck and key files above
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {docs.map((doc) => (
              <div
                key={doc._id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">
                      {doc.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {doc.originalName} · {formatSize(doc.size)} ·{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg"
                  >
                    <Download size={13} /> Download
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}