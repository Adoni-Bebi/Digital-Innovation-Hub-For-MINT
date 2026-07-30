import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">DIH</span>
              </div>
              <span className="font-semibold text-white">Digital Innovation Hub</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Official platform of the Ministry of Innovation and Technology (MinT), Ethiopia. Empowering startups, investors, and innovation.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/directory" className="hover:text-primary-400 transition-colors">Startup Directory</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Register Startup</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">For Investors</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">MinT</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.mint.gov.et" target="_blank" rel="noreferrer" className="hover:text-primary-400 transition-colors">Official Website</a></li>
              <li><span className="text-slate-500">Digital Ethiopia 2030</span></li>
              <li><span className="text-slate-500">Innovation Programs</span></li>
              <li><span className="text-slate-500">Contact MinT</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-500">Privacy Policy</span></li>
              <li><span className="text-slate-500">Terms of Use</span></li>
              <li><span className="text-slate-500">Data Protection</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Ministry of Innovation and Technology, Federal Democratic Republic of Ethiopia.
          </p>
          <p className="text-xs text-slate-500">
            Built for Digital Ethiopia 2030
          </p>
        </div>
      </div>
    </footer>
  );
}