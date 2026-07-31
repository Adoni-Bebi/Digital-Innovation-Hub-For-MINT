import { useState, useEffect, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
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

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const res = await apiRequest("/startups");
        setStartups(res.data || []);
      } catch (err) {
        setError(err.message);
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
          s.companyName.toLowerCase().includes(q) ||
          s.oneLineDescription.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }
    if (sector) list = list.filter((s) => s.sector === sector);
    if (stage) list = list.filter((s) => s.fundingStage === stage);
    if (location) list = list.filter((s) => s.location === location);

    return list;
  }, [startups, search, sector, stage, location]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
        >
          <option value="">All sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
        >
          <option value="">All locations</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4">{error}</p>
      )}

      <p className="text-sm text-slate-500 mb-5">
        Showing <strong className="text-slate-800">{filtered.length}</strong> verified startup
        {filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <StartupCard key={s._id} startup={{ ...s, id: s._id }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">No verified startups found.</p>
        </div>
      )}
    </div>
  );
}