import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Building2, SlidersHorizontal, X } from "lucide-react";
import { apiRequest } from "../../utils/api";
import { SECTORS, STAGES, LOCATIONS } from "../../data/mockData";
import StartupCard from "../../components/StartupCard";

export default function Directory() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const res = await apiRequest("/startups");
        setStartups(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to load startups");
      } finally {
        setLoading(false);
      }
    };
    fetchStartups();
  }, []);

  const filtered = useMemo(() => {
    let list = [...startups];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.companyName?.toLowerCase().includes(q) ||
          s.oneLineDescription?.toLowerCase().includes(q) ||
          s.sector?.toLowerCase().includes(q)
      );
    }
    if (sector) list = list.filter((s) => s.sector === sector);
    if (stage) list = list.filter((s) => s.fundingStage === stage);
    if (location) list = list.filter((s) => s.location === location);

    return list;
  }, [startups, search, sector, stage, location]);

  const activeFilters = [sector, stage, location].filter(Boolean).length;

  const clearFilters = () => {
    setSector("");
    setStage("");
    setLocation("");
    setSearch("");
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm text-slate-500">Loading verified startups…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Startup Directory</h1>
        <p className="text-slate-600">
          Browse MinT-verified Ethiopian startups. Only approved profiles appear here.
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, sector, or keyword…"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All sectors</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All locations</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          {activeFilters > 0 && (
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
              >
                <X size={14} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>
      )}

      <p className="text-sm text-slate-500 mb-5">
        Showing <strong className="text-slate-800">{filtered.length}</strong> verified startup
        {filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <StartupCard key={s._id} startup={s} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-slate-400" size={26} />
          </div>
          <p className="text-slate-700 font-medium mb-1">No startups match your filters</p>
          <p className="text-slate-500 text-sm mb-4">
            Try a different search or clear filters
          </p>
          {(activeFilters > 0 || search) && (
            <button
              onClick={clearFilters}
              className="text-primary-600 font-medium text-sm hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}