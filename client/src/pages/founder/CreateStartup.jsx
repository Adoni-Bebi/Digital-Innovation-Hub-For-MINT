import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { SECTORS, STAGES, LOCATIONS } from "../../data/mockData";
import { Loader2, ArrowLeft } from "lucide-react";

export default function CreateStartup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    logo: "🚀",
    oneLineDescription: "",
    sector: "FinTech",
    fundingStage: "Idea",
    location: "Addis Ababa",
    teamSize: 1,
    foundedYear: new Date().getFullYear(),
    website: "",
    problemStatement: "",
    solutionStatement: "",
  });

  // Load existing startup if any
  useEffect(() => {
    const loadStartup = async () => {
      try {
        const res = await apiRequest("/startups/my");
        if (res.data) {
          setIsEdit(true);
          setForm({
            companyName: res.data.companyName || "",
            logo: res.data.logo || "🚀",
            oneLineDescription: res.data.oneLineDescription || "",
            sector: res.data.sector || "FinTech",
            fundingStage: res.data.fundingStage || "Idea",
            location: res.data.location || "Addis Ababa",
            teamSize: res.data.teamSize || 1,
            foundedYear: res.data.foundedYear || new Date().getFullYear(),
            website: res.data.website || "",
            problemStatement: res.data.problemStatement || "",
            solutionStatement: res.data.solutionStatement || "",
          });
        }
      } catch {
        // No startup yet → create mode
        setIsEdit(false);
      } finally {
        setFetching(false);
      }
    };

    loadStartup();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        teamSize: Number(form.teamSize),
        foundedYear: Number(form.foundedYear),
      };

      if (isEdit) {
        await apiRequest("/startups/my", {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiRequest("/startups", {
          method: "POST",
          body: payload,
        });
      }

      navigate("/founder");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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

      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        {isEdit ? "Edit Startup Profile" : "Create Startup Profile"}
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        {isEdit
          ? "Update your startup information. Major changes may require re-verification by MinT."
          : "Submit your startup for MinT verification. Only verified startups appear in the public directory."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
      >
        {/* Company Name + Logo */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Company Name *
            </label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="AgriLink Ethiopia"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Logo (emoji)
            </label>
            <input
              name="logo"
              value={form.logo}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-center text-xl"
            />
          </div>
        </div>

        {/* One Line Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            One-line Description *
          </label>
          <input
            name="oneLineDescription"
            value={form.oneLineDescription}
            onChange={handleChange}
            required
            maxLength={200}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="Connecting smallholder farmers to buyers with AI-powered logistics"
          />
        </div>

        {/* Sector, Stage, Location */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Sector *</label>
            <select
              name="sector"
              value={form.sector}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Funding Stage *
            </label>
            <select
              name="fundingStage"
              value={form.fundingStage}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Team Size + Founded Year + Website */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Team Size</label>
            <input
              type="number"
              name="teamSize"
              value={form.teamSize}
              onChange={handleChange}
              min={1}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Founded Year</label>
            <input
              type="number"
              name="foundedYear"
              value={form.foundedYear}
              onChange={handleChange}
              min={2000}
              max={new Date().getFullYear()}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Problem */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Problem Statement *
          </label>
          <textarea
            name="problemStatement"
            value={form.problemStatement}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="What problem are you solving?"
          />
        </div>

        {/* Solution */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Solution Statement *
          </label>
          <textarea
            name="solutionStatement"
            value={form.solutionStatement}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="How does your product solve it?"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Saving...
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Submit for MinT Verification"
          )}
        </button>
      </form>
    </div>
  );
}