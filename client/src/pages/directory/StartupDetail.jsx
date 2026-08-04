import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import {
  BadgeCheck,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Lock,
  FileText,
  Send,
  Loader2,
  Download,
  Unlock,
} from "lucide-react";

export default function StartupDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest(`/startups/${id}`);
        setStartup(res.data);

        if (isAuthenticated && user?.role === "investor") {
          try {
            const myRequests = await apiRequest("/access-requests/my");
            const existing = (myRequests.data || []).find(
              (r) => (r.startup?._id || r.startup) === id
            );
            if (existing) {
              setRequestStatus(existing.status);
              if (existing.status === "approved") {
                setHasAccess(true);
              }
            }
          } catch {
            // ignore
          }
        }

        // Founder of this startup also has access (if logged in as founder)
        if (isAuthenticated && user?.role === "founder") {
          // access checked via documents API
        }
      } catch (err) {
        setError(err.message || "Startup not found");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, user]);

  // Load docs when access granted
  useEffect(() => {
    const loadDocs = async () => {
      if (!isAuthenticated || !id) return;

      // Try loading — backend enforces permission
      setDocsLoading(true);
      try {
        const res = await apiRequest(`/documents/startup/${id}`);
        setDocs(res.data || []);
        setHasAccess(true);
      } catch {
        setDocs([]);
        // keep hasAccess from request status for investors
      } finally {
        setDocsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadDocs();
    }
  }, [id, isAuthenticated, requestStatus]);

  const handleRequestAccess = async () => {
    setRequestLoading(true);
    try {
      await apiRequest("/access-requests", {
        method: "POST",
        body: { startupId: id },
      });
      setRequestStatus("pending");
    } catch (err) {
      alert(err.message || "Failed to send request");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await apiRequest(`/documents/${doc._id}/download`, { blob: true });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.originalName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          {error || "Startup not found"}
        </h2>
        <Link to="/directory" className="text-primary-600 hover:underline text-sm">
          ← Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/directory"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-700 mb-6"
      >
        <ArrowLeft size={16} /> Back to directory
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shrink-0">
            {startup.logo || "🚀"}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{startup.companyName}</h1>
              {startup.status === "verified" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200">
                  <BadgeCheck size={13} /> MinT Verified
                </span>
              )}
            </div>
            <p className="text-slate-600 mb-4">{startup.oneLineDescription}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {startup.location}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {startup.teamSize} team members
              </span>
              {startup.foundedYear && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> Founded {startup.foundedYear}
                </span>
              )}
              {startup.website && (
                <a
                  href={startup.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary-600 hover:underline"
                >
                  <ExternalLink size={14} /> Website
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <span className="inline-flex justify-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
              {startup.sector}
            </span>
            <span className="inline-flex justify-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
              {startup.fundingStage}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Problem</h2>
            <p className="text-slate-600 leading-relaxed">{startup.problemStatement}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Solution</h2>
            <p className="text-slate-600 leading-relaxed">{startup.solutionStatement}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Data Room */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              {hasAccess ? (
                <Unlock size={18} className="text-primary-600" />
              ) : (
                <Lock size={18} className="text-slate-400" />
              )}
              <h2 className="text-lg font-semibold text-slate-900">Secure Data Room</h2>
            </div>

            {hasAccess ? (
              <>
                <p className="text-sm text-slate-500 mb-4">
                  Access granted. You can download the documents below.
                </p>
                {docsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                ) : docs.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No documents uploaded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <FileText size={16} className="text-primary-600 shrink-0" />
                        <span className="text-sm text-slate-700 flex-1 truncate">
                          {doc.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          <Download size={13} /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-4">
                  Sensitive documents are available only after the founder approves your
                  access request.
                </p>
                <div className="space-y-2 mb-5">
                  {["Pitch Deck", "Financials", "Legal Docs", "Other"].map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-600 flex-1">{label}</span>
                      <Lock size={13} className="text-slate-300" />
                    </div>
                  ))}
                </div>

                {requestStatus === "pending" ? (
                  <div className="text-center py-2.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg border border-amber-200">
                    Request sent — awaiting founder approval
                  </div>
                ) : requestStatus === "denied" ? (
                  <div className="text-center py-2.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
                    Request denied
                  </div>
                ) : isAuthenticated && user?.role === "investor" ? (
                  <button
                    onClick={handleRequestAccess}
                    disabled={requestLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-semibold rounded-lg"
                  >
                    {requestLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    Request Data Room Access
                  </button>
                ) : !isAuthenticated ? (
                  <Link
                    to="/login"
                    className="block w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg"
                  >
                    Sign in as Investor to Request
                  </Link>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-2">
                    Only investors can request access
                  </p>
                )}
              </>
            )}
          </div>

          {startup.status === "verified" && startup.verifiedAt && (
            <div className="bg-primary-50 rounded-2xl border border-primary-100 p-5">
              <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-1">
                Verified by MinT
              </p>
              <p className="text-sm text-primary-800">
                Approved on{" "}
                {new Date(startup.verifiedAt).toLocaleDateString("en-ET", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}