import Link from "next/link";
import { BsBriefcaseFill } from "react-icons/bs";

const footerGroups = [
  {
    title: "JobsEra",
    links: ["Jobs", "For Businesses", "Company", "Resources"],
  },
  {
    title: "Audience",
    links: ["Employers", "Hiring Managers", "Candidates"],
  },
  {
    title: "Product",
    links: ["Pricing", "Features", "Integrations", "FAQ"],
  },
  {
    title: "Help",
    links: ["Customer Support", "Documentation", "API"],
  },
  {
    title: "Legal",
    links: ["Terms of Service", "Privacy Policy", "GDPR"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1D554C] px-6 pt-14 font-sans text-white lg:px-8">
      <div className="mx-auto max-w-36.2517.5pxxl">
        <div className="flex flex-col gap-6 border-b border-white/30 pb-10 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-semibold text-white"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#F7631E]">
              <BsBriefcaseFill size={18} />
            </span>
            JobsEra
          </Link>

          <p className="text-base font-normal text-white/70">
            1 Bank of Ceylon Mawatha, Colombo 00100
          </p>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xl font-semibold text-white">{group.title}</h3>

              <ul className="mt-6 space-y-4">
                {group.links.map((item, index) => (
                  <li key={item}>
                    <span
                      className={`text-base font-normal ${
                        index === 0 && group.title === "JobsEra"
                          ? "text-[#F7631E]"
                          : "text-white/60"
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 py-7 text-center text-sm font-normal text-white/55">
          © 2026 JobsEra. Built by{" "}
          <a
            href="https://erabiz.io"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-white transition hover:text-[#F7631E]"
          >
            Erabiz.io
          </a>
        </div>
      </div>
    </footer>
  );
}