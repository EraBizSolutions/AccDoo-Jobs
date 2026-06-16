"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiBookmark,
  FiBriefcase,
  FiCheck,
  FiMapPin,
} from "react-icons/fi";

const CARD_LOGO_CLASSES = [
  "bg-accdoo-primary",
  "bg-red-500",
  "bg-fuchsia-500",
  "bg-amber-500",
  "bg-success",
  "bg-sky-300",
  "bg-accdoo-primary",
  "bg-main-text",
  "bg-red-500",
  "bg-success",
];

const FALLBACK_JOB = {
  id: null,
  title: "Product Designer (UI UX)",
  company_name: "Energizer LTD",
  description:
    "Design and iterate intuitive digital products that delight our users.",
  job_type: "Full-Time",
  location: "Kottawa, Sri Lanka",
  created_at: null,
  match_label: null,
  match_score: null,
};

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

function formatDate(value) {
  if (!value) return "05/06/26";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "05/06/26";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
}

function formatJobType(jobType) {
  if (!jobType) return "Full-Time";

  return String(jobType)
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join("-");
}

function getCompanyName(job) {
  return job.company_name || "Energizer LTD";
}

function getTitle(job) {
  return job.title || "Product Designer (UI UX)";
}

function getDescription(job) {
  const description = String(job.description || "").trim();

  if (!description) {
    return "Design and iterate intuitive digital products that delight our users.";
  }

  if (description.length <= 86) {
    return description;
  }

  return `${description.slice(0, 86).trim()}...`;
}

function getFallbackMatch(colorIndex) {
  if (colorIndex % 2 === 0) {
    return {
      label: "Strong Match",
      score: 85,
    };
  }

  return {
    label: "Low Match",
    score: 30,
  };
}

function ButterflyLogo({ colorClass }) {
  return (
    <span
      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-lg max-md:h-10 max-md:w-10 max-md:rounded-[7px] ${colorClass}`}
    >
      <span className="relative h-5.5 w-6 max-md:h-4.75 max-md:w-5.5">
        <span className="absolute left-px top-0.5 h-3 w-2.5 rounded-full bg-white max-md:h-2.5 max-md:w-2.25" />
        <span className="absolute right-px top-0.5 h-3 w-2.5 rounded-full bg-white max-md:h-2.5 max-md:w-2.25" />
        <span className="absolute bottom-px left-1.25 h-2.25 w-2 rounded-full bg-white max-md:left-1 max-md:h-2 max-md:w-1.75" />
        <span className="absolute bottom-px right-1.25 h-2.25 w-2 rounded-full bg-white max-md:right-1 max-md:h-2 max-md:w-1.75" />
        <span className="absolute left-2.5 top-1.75 h-2.25 w-1 rounded-full bg-black max-md:left-2.25 max-md:top-1.25 max-md:h-2 max-md:w-1" />
      </span>
    </span>
  );
}

function MatchIcon() {
  return (
    <span className="inline-grid h-3.25 w-3.25 shrink-0 place-items-center">
      <svg
        viewBox="0 0 18 18"
        className="h-3.25 w-3.25 text-match-text"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 1.8L10.45 6.15L14.85 7.55L10.45 8.95L9 13.2L7.55 8.95L3.15 7.55L7.55 6.15L9 1.8Z"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <path
          d="M3.2 11.2L3.95 13.35L6.1 14.1L3.95 14.85L3.2 17L2.45 14.85L0.3 14.1L2.45 13.35L3.2 11.2Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M14.3 1L14.85 2.55L16.4 3.1L14.85 3.65L14.3 5.2L13.75 3.65L12.2 3.1L13.75 2.55L14.3 1Z"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function JobMetaItem({ icon, children }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.25 whitespace-nowrap text-[10px] font-medium leading-none text-text-muted max-md:text-[9px]">
      {icon}
      {children}
    </span>
  );
}

function MatchPill({ label, score }) {
  return (
    <span className="inline-flex h-5.75 items-center gap-1.5 rounded-full bg-match-surface px-2.5 text-[9px] font-semibold leading-none text-match-text ring-1 ring-match-text/10 ring-inset max-md:h-5.25 max-md:px-2 max-md:text-[8px]">
      <MatchIcon />
      {label} {score}%
    </span>
  );
}

export default function JobCard({ job, colorIndex = 0 }) {
  const [shareStatus, setShareStatus] = useState("");

  const safeJob = {
    ...FALLBACK_JOB,
    ...(job || {}),
  };

  const jobId = safeJob.id || safeJob.job_id || safeJob.slug || null;
  const jobDetailsPath = jobId ? `/jobs/${jobId}` : "/jobs";
  const fullJobUrl = safeJob.public_url || `${getAppBaseUrl()}${jobDetailsPath}`;
  const companyName = getCompanyName(safeJob);
  const title = getTitle(safeJob);
  const description = getDescription(safeJob);
  const logoColorClass =
    CARD_LOGO_CLASSES[colorIndex % CARD_LOGO_CLASSES.length];

  const fallbackMatch = getFallbackMatch(colorIndex);
  const numericMatchScore = Number(safeJob.match_score);

  const matchScore =
    safeJob.match_score !== null &&
    safeJob.match_score !== undefined &&
    !Number.isNaN(numericMatchScore)
      ? Math.round(numericMatchScore)
      : fallbackMatch.score;

  const matchLabel = safeJob.match_label || fallbackMatch.label;

  async function handleShareJob(event) {
    event.preventDefault();
    event.stopPropagation();

    setShareStatus("");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: title || "AccDoo job opportunity",
          text: `${title || "Job opportunity"} at ${companyName}`,
          url: fullJobUrl,
        });

        setShareStatus("Saved");
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullJobUrl);
        setShareStatus("Copied");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullJobUrl;
        textArea.className = "pointer-events-none fixed opacity-0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        setShareStatus("Copied");
      }

      window.setTimeout(() => {
        setShareStatus("");
      }, 1500);
    } catch {
      setShareStatus("Failed");

      window.setTimeout(() => {
        setShareStatus("");
      }, 1500);
    }
  }

  return (
    <article className="group relative h-44 w-full rounded-2xl border-2 border-transparent bg-card shadow-card transition duration-200 hover:border-secondary-blue hover:shadow-card-hover dark:hover:border-blue-400 max-md:h-40.5 max-md:rounded-[9px]">
      <Link
        href={jobDetailsPath}
        className="flex h-full flex-col px-4 pb-3 pt-3.5 max-md:px-3.25 max-md:pb-2.75 max-md:pt-3.25"
      >
        <div className="flex items-start gap-3.75 max-md:gap-2.75">
          <ButterflyLogo colorClass={logoColorClass} />

          <div className="min-w-0 flex-1 pt-px">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-[14px] font-bold leading-[1.15] tracking-[-0.02em] text-text-main max-md:text-[12px]">
                  {title}
                </h2>

                <p className="mt-1.25 text-[11px] font-bold leading-none text-success max-md:mt-1 max-md:text-[9px]">
                  {companyName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleShareJob}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/3.5 text-icon-muted transition hover:bg-blue-600/10 hover:text-blue-600 dark:bg-white/5 dark:text-slate-500 max-md:h-6 max-md:w-6"
                aria-label="Save job"
              >
                {shareStatus === "Copied" || shareStatus === "Saved" ? (
                  <FiCheck size={14} className="max-md:h-3 max-md:w-3" />
                ) : (
                  <FiBookmark size={14} className="max-md:h-3 max-md:w-3" />
                )}
              </button>
            </div>

          </div>
        </div>

        <div className="mt-2">
          <MatchPill label={matchLabel} score={matchScore} />
        </div>

        <div className="mb-2 mt-2.5 flex flex-1 items-start justify-between gap-4 max-md:mb-1.75 max-md:mt-2 max-md:gap-3">
          <p className="line-clamp-2 max-w-65 text-[10px] font-medium leading-[1.32] text-text-muted max-md:max-w-42.5 max-md:text-[9px] max-md:leading-[1.35]">
            {description}
          </p>

          <span className="mt-px grid h-7.5 min-w-17 place-items-center rounded-[5px] bg-blue-600 text-[11px] font-semibold text-white shadow-action transition group-hover:bg-secondary-blue-dark max-md:h-6.5 max-md:min-w-13.75 max-md:text-[9px]">
            Apply
          </span>
        </div>

        <div className="mt-auto border-t border-line-soft pt-2.5 max-md:pt-2.75">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-3.5 max-md:gap-2.5">
              <JobMetaItem
                icon={
                  <FiBriefcase
                    size={11}
                    className="shrink-0 max-md:h-2.25 max-md:w-2.25"
                  />
                }
              >
                {formatJobType(safeJob.job_type)}
              </JobMetaItem>

              <JobMetaItem
                icon={
                  <FiMapPin
                    size={11}
                    className="shrink-0 max-md:h-2.25 max-md:w-2.25"
                  />
                }
              >
                <span className="max-w-30 truncate max-md:max-w-22.5">
                  {safeJob.location || "Kottawa, Sri Lanka"}
                </span>
              </JobMetaItem>
            </div>

            <span className="shrink-0 whitespace-nowrap text-[10px] font-medium leading-none text-text-muted max-md:text-[9px]">
              <span className="hidden md:inline">Posted on </span>
              <span className="md:hidden">On </span>
              {formatDate(safeJob.created_at)}
            </span>
          </div>
        </div>
      </Link>

      {shareStatus ? (
        <div className="absolute right-4.5 top-12 rounded-[5px] border border-line-soft bg-surface px-2 py-1 text-[10px] font-semibold text-text-main shadow-lg max-md:right-3 max-md:top-10.5">
          {shareStatus}
        </div>
      ) : null}
    </article>
  );
}
