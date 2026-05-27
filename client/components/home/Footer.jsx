import { BsBriefcaseFill } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="bg-white px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 p-8 text-white shadow-2xl shadow-blue-950/20">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-2xl font-extrabold">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white">
                <BsBriefcaseFill size={16} />
              </span>
              JobsEra
            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
              AI-powered job discovery for candidates and smarter hiring workflows for modern teams.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Product</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li>Job Matching</li>
              <li>AI Profiles</li>
              <li>Recruiter Tools</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li>About</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold">Get started</h3>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Build your AI profile and discover better roles today.
            </p>
            <button className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-700">
              Create Profile
            </button>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-white/50">
          © 2026 JobsEra. Built for smarter hiring.
        </div>
      </div>
    </footer>
  );
}