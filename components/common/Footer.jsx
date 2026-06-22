"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";

import HomeLogo from "@/components/common/HomeLogo";
import { homeInter } from "@/components/home/homeFonts";

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
    <footer className={`min-h-94.75 bg-accdoo-primary px-34.5 py-7.75 text-white max-xl:px-10 max-md:min-h-129.25 max-md:px-6 max-md:pb-0 max-md:pt-7.5 ${homeInter.className}`}>
      <div className="mx-auto flex w-full max-w-291 flex-col gap-10 max-md:h-full max-md:gap-7">
        <div className="max-md:pb-3.5">
          <HomeLogo inverted className="h-8.5 max-md:h-5.5" />
        </div>

        <div className="hidden items-start justify-between md:flex">
          {footerGroups.map((group) => (
            <div key={group.title} className="w-fit min-w-22">
              <h3 className="text-[14px] font-semibold text-white">{group.title}</h3>

              <ul className="mt-5 space-y-3.5">
                {group.links.map((item) => (
                  <li key={`${group.title}-${item}`}>
                    <Link
                      href="/"
                      className="text-[14px] font-medium text-[#B2AFBC] transition hover:text-white"
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

        <div className="flex flex-col gap-4.25 max-md:mt-auto max-md:gap-4.5">
          <div className="h-px w-full rounded-full bg-[rgba(200,200,200,0.52)]" />

          <div className="flex items-center justify-between max-md:flex-col max-md:gap-4.5 max-md:pb-6.75">
          <p className="text-[14px] font-medium text-white max-md:text-[11px]">
            &copy; accdoo.jobs 2026
          </p>

          <div className="flex items-center gap-7">
            <Link
              href="/"
              className="text-[14px] font-medium text-white transition hover:text-white/75 max-md:text-[11px]"
            >
              Terms of service
            </Link>

            <Link
              href="/"
              className="text-[14px] font-medium text-white transition hover:text-white/75 max-md:text-[11px]"
            >
              Privacy policy
            </Link>
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
