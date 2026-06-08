"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiMapPin,
  FiShare2,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";

function getCompanyInitials(companyName = "JE") {
  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getSkillTags(requiredSkills) {
  if (!requiredSkills) return [];

  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function getAppBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

function formatSalary(job) {
  if (!job.salary_min && !job.salary_max) return null;

  if (job.salary_min && job.salary_max) {
    return `LKR ${Number(job.salary_min).toLocaleString()} - ${Number(
      job.salary_max
    ).toLocaleString()}/month`;
  }

  if (job.salary_min) {
    return `From LKR ${Number(job.salary_min).toLocaleString()}/month`;
  }

  return `Up to LKR ${Number(job.salary_max).toLocaleString()}/month`;
}

function formatJobType(jobType) {
  if (!jobType) return "Job type not added";

  return jobType
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join("-");
}

function JobMetaItem({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[16px] font-normal text-slate-500">
      {icon}
      {children}
    </span>
  );
}

function SalaryMetaItem({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[16px] font-normal text-slate-500">
      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-[#F7631E]">
        LKR
      </span>
      {children}
    </span>
  );
}

export default function JobCard({ job }) {
  const [shareStatus, setShareStatus] = useState("");

  const jobDetailsPath = `/jobs/${job.id}`;
  const fullJobUrl = `${getAppBaseUrl()}${jobDetailsPath}`;

  const companyName = job.company_name || "AccDoo Company";
  const logoText = getCompanyInitials(companyName);
  const salary = formatSalary(job);
  const skills = getSkillTags(job.required_skills);

  async function handleShareJob() {
    setShareStatus("");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: job.title || "AccDoo job opportunity",
          text: `${job.title || "Job opportunity"} at ${companyName}`,
          url: fullJobUrl,
        });

        setShareStatus("Shared");
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullJobUrl);
        setShareStatus("Link copied");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullJobUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        setShareStatus("Link copied");
      }

      window.setTimeout(() => {
        setShareStatus("");
      }, 1800);
    } catch {
      setShareStatus("Copy failed");

      window.setTimeout(() => {
        setShareStatus("");
      }, 1800);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-7 font-sans shadow-sm transition hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="grid gap-7 lg:grid-cols-[1fr_auto]">
        <div className="flex gap-5">
          <Link
            href={jobDetailsPath}
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#F9FBFB] text-lg font-medium text-[#0C203A] ring-1 ring-slate-200 transition hover:bg-slate-100"
          >
            {logoText}
          </Link>

          <div className="min-w-0">
            <Link
              href={jobDetailsPath}
              className="text-[23px] font-medium leading-tight tracking-tight text-[#0C203A] transition hover:text-[#F7631E]"
            >
              {job.title || "Untitled role"}
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-[17px] font-normal text-[#2b7a66]">
                {companyName}
              </p>
              <MdVerified size={18} className="text-[#2b7a66]" />
            </div>

            <p className="mt-5 text-[16px] font-normal text-[#0C203A]">
              {skills.length ? skills.join(" · ") : "Role details available"}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
              <JobMetaItem icon={<FiBriefcase size={18} />}>
                {formatJobType(job.job_type)}
              </JobMetaItem>

              <JobMetaItem icon={<FiMapPin size={18} />}>
                {job.location || "Location not added"}
              </JobMetaItem>

              {salary ? <SalaryMetaItem>{salary}</SalaryMetaItem> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-8 lg:items-end">
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={handleShareJob}
                className="inline-flex items-center gap-2 text-[16px] font-medium text-[#0C203A] transition hover:text-[#F7631E]"
              >
                {shareStatus === "Link copied" || shareStatus === "Shared" ? (
                  <FiCheck size={18} />
                ) : (
                  <FiShare2 size={18} />
                )}
                {shareStatus || "Share"}
              </button>

              {shareStatus === "Copy failed" ? (
                <p className="absolute right-0 top-[28px] whitespace-nowrap rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs font-normal text-red-600">
                  Could not copy
                </p>
              ) : null}
            </div>

            <Link
              href={jobDetailsPath}
              className="inline-flex items-center gap-2 text-[16px] font-medium text-[#F7631E] transition hover:text-[#e85512]"
            >
              Apply
              <FiArrowRight size={18} />
            </Link>
          </div>

          <p className="text-sm font-normal text-slate-400">Open now</p>
        </div>
      </div>
    </article>
  );
}