import { Link } from "react-router-dom";
import {
  Shield, BadgeCheck, ArrowRight, Building2, Users, Zap
} from "lucide-react";
import { mockStartups } from "../data/mockData";
import StartupCard from "../components/StartupCard";

export default function Home() {
  const featured = mockStartups.slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-200 text-xs font-medium mb-6">
              <Shield size={13} /> Official MinT Platform · Digital Ethiopia 2030
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Ethiopia's Official
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-400">
                Innovation Hub
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
              A government-backed platform connecting verified startups, trusted investors, and the Ministry of Innovation & Technology — built for transparency, deal-flow, and ecosystem growth.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/directory"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-900/40 transition-all"
              >
                Explore Startups <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur transition-all"
              >
                Register Your Startup
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Verified Startups", value: "89+" },
              { label: "Active Investors", value: "47" },
              { label: "Access Requests", value: "680+" },
              { label: "Sectors Covered", value: "7" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How the Hub Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Three roles. One trusted system. Government verification as the trust anchor.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "For Startups",
                desc: "Create your profile, upload Data Room documents, get MinT-verified, and receive investor interest with full control over who sees your sensitive materials.",
                color: "bg-primary-50 text-primary-600",
              },
              {
                icon: Users,
                title: "For Investors",
                desc: "Browse only MinT-verified startups, filter by sector and stage, request Data Room access, and conduct due diligence through a secure, audited channel.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Shield,
                title: "For MinT",
                desc: "Review and approve startups, maintain ecosystem integrity, and access real-time analytics on sector trends, verification throughput, and deal-flow volume.",
                color: "bg-amber-50 text-amber-600",
              },
            ].map((item) => (
              <div key={item.title} className="relative bg-slate-50 rounded-2xl p-7 border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary-700 text-sm font-semibold mb-4">
                <Zap size={16} /> Signature Module
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Secure Data Room
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Startups show a public summary to everyone, while pitch decks, financials, and legal documents stay locked behind an explicit, founder-approved, revocable access grant. Every view is logged for audit.
              </p>
              <ul className="space-y-3">
                {[
                  "Permission-gated document vault",
                  "Founder-controlled approve / deny / revoke",
                  "Short-lived signed URLs only",
                  "Full access history for transparency",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <BadgeCheck size={18} className="text-primary-600 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Data Room — AgriLink Ethiopia</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Access Granted</span>
              </div>
              {["Pitch Deck.pdf", "Financial Projections.xlsx", "Business Registration.pdf", "Team Bios.pdf"].map((doc) => (
                <div key={doc} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 text-xs font-bold">
                      {doc.split(".").pop().toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{doc}</span>
                  </div>
                  <button className="text-xs font-medium text-primary-600 hover:text-primary-700">View</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Verified Startups</h2>
              <p className="text-slate-600">Recently MinT-verified companies open for discovery</p>
            </div>
            <Link
              to="/directory"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to join Ethiopia's innovation ecosystem?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Whether you are a founder seeking capital, an investor looking for deal-flow, or MinT staff managing verification — start here.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/directory"
              className="px-6 py-3 bg-primary-600/50 border border-white/30 text-white font-semibold rounded-xl hover:bg-primary-600/70 transition-colors"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}