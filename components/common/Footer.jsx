"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";

import HomeLogo from "@/components/common/HomeLogo";

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

function MobileFooterGroup({ group }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/15">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between py-4.5 text-left text-[12px] font-bold text-white"
      >
        {group.title}
        <FiChevronDown
          size={15}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul className="space-y-2.75 pb-4">
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
    <footer className="bg-accdoo-primary px-19.5 pt-11.5 font-sans text-white max-xl:px-10 max-md:px-4 max-md:pt-7.5">
      <div className="mx-auto w-full max-w-275">
        <div className="pb-14.5 max-md:pb-7">
          <HomeLogo inverted className="h-7 max-md:h-5.5" />
        </div>

        <div className="hidden grid-cols-5 gap-20 pb-13 md:grid">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[12px] font-bold text-white">{group.title}</h3>

              <ul className="mt-5 space-y-3.25">
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

        <div className="flex items-center justify-between border-t border-white/20 py-6 max-md:mt-13.5 max-md:flex-col max-md:gap-4.5 max-md:py-6.75">
          <p className="text-[12px] font-medium text-white/75 max-md:text-[11px]">
            &copy; accdoo.jobs 2026
          </p>

          <div className="flex items-center gap-7">
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
