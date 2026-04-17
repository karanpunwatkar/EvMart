import { Zap, Mail, MapPin, GraduationCap } from "lucide-react";

export const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      id="about"
      className="bg-[#0F1B12] text-gray-300 mt-24"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-[#22C55E] text-[#0F1B12] grid place-items-center">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl font-semibold text-white">
              EVMart
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-400">
            An E-Commerce Platform for Electric Vehicles — bringing digital
            convenience and sustainable mobility together. Browse, compare,
            and purchase electric scooters, all from one place.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#22C55E]" />
              <span>hello@evmart.in</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#22C55E]" />
              <span>Nagpur, Maharashtra, India</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Explore
          </h4>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href="/" className="hover:text-white transition-colors">
                Home
              </a>
            </li>
            <li>
              <a
                href="/products"
                className="hover:text-white transition-colors"
              >
                All Scooters
              </a>
            </li>
            <li>
              <a
                href="/#sustainability"
                className="hover:text-white transition-colors"
              >
                Sustainability
              </a>
            </li>
            <li>
              <a href="/cart" className="hover:text-white transition-colors">
                Cart
              </a>
            </li>
          </ul>
        </div>

        <div data-testid="project-credits">
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Project Credits
          </h4>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-[#22C55E] mt-0.5" />
              <div>
                <p className="text-gray-300 font-medium">Projectees</p>
                <p className="text-gray-400">Yash Mahatale</p>
                <p className="text-gray-400">Sudanshu Zade</p>
                <p className="text-gray-400">Mayur Kawale</p>
              </div>
            </div>
            <div>
              <p className="text-gray-300 font-medium">Project Guide</p>
              <p className="text-gray-400">Mrs. Bhagyashree Ambulkar</p>
            </div>
            <div>
              <p className="text-gray-300 font-medium">Co-Guide</p>
              <p className="text-gray-400">Mrs. Rekha Israni</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} EVMart — A student project, GH Raisoni
            College of Engineering and Management (Session 2025–2026).
          </p>
          <p>Dept. of Commerce &amp; Management · B.Com (Computer Applications)</p>
        </div>
      </div>
    </footer>
  );
};
