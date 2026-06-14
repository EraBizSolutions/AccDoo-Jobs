"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";

const footerGroups = [
  {
    title: "Accdoo",
    links: ["Jobs", "For Business", "Company", "Resources"],
  },
  {
    title: "Audience",
    links: ["Employers", "Hiring Managers", "Candidates"],
  },
  {
    title: "Product",
    links: ["Pricing", "Features", "Integrations", "FAQs"],
  },
  {
    title: "Help",
    links: ["Customer Support", "Documentation", "API"],
  },
  {
    title: "Legal",
    links: ["Terms of Services", "Privacy Policy", "GDPR"],
  },
];

function AccDooFooterLogo() {
  return (
    <Link href="/" className="inline-flex items-center">
      <img
        src="/accdoo-logo.svg"
        alt="AccDoo"
        className="h-[28px] w-auto object-contain brightness-0 invert max-md:h-[22px]"
      />
    </Link>
  );
}

function MobileFooterGroup({ group }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/15">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between py-[18px] text-left text-[12px] font-bold text-white"
      >
        {group.title}
        <FiChevronDown
          size={15}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul className="space-y-[11px] pb-[16px]">
          {group.links.map((item) => (
            <li key={`${group.title}-${item}`}>
              <Link
                href="/"
                className="text-[11px] font-medium text-white/70 transition hover:text-white"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0152A4] px-[78px] pt-[46px] font-sans text-white max-xl:px-10 max-md:px-4 max-md:pt-[30px]">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="pb-[58px] max-md:pb-[28px]">
          <AccDooFooterLogo />
        </div>

        <div className="hidden grid-cols-5 gap-[80px] pb-[52px] md:grid">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[12px] font-bold text-white">{group.title}</h3>

              <ul className="mt-[20px] space-y-[13px]">
                {group.links.map((item) => (
                  <li key={`${group.title}-${item}`}>
                    <Link
                      href="/"
                      className="text-[12px] font-medium text-white/65 transition hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="md:hidden">
          {footerGroups.map((group) => (
            <MobileFooterGroup key={group.title} group={group} />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/20 py-[24px] max-md:mt-[54px] max-md:flex-col max-md:gap-[18px] max-md:py-[27px]">
          <p className="text-[12px] font-medium text-white/75 max-md:text-[11px]">
            © accdoo.jobs 2026
          </p>

          <div className="flex items-center gap-[28px]">
            <Link
              href="/"
              className="text-[12px] font-medium text-white transition hover:text-white/75 max-md:text-[11px]"
            >
              Terms of service
            </Link>

            <Link
              href="/"
              className="text-[12px] font-medium text-white transition hover:text-white/75 max-md:text-[11px]"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}