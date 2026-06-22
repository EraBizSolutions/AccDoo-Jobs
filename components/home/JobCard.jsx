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
      className={`relative grid h-12.75 w-12.75 shrink-0 place-items-center rounded-xl max-md:h-10.5 max-md:w-10.5 max-md:rounded-lg ${colorClass}`}
    >
      <svg
        width="28"
        height="25"
        viewBox="0 0 28 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6.25 w-7 max-md:h-5.5 max-md:w-6"
        aria-hidden="true"
      >
        <path
          d="M6.06937 1.68281C9.2795 4.12665 12.7324 9.08176 14.0001 11.741C15.2679 9.08195 18.7206 4.1266 21.9308 1.68281C24.2471 -0.0805744 28 -1.44498 28 2.89663C28 3.76371 27.5098 10.1805 27.2222 11.2223C26.2228 14.8441 22.5808 15.7679 19.3412 15.2088C25.004 16.1861 26.4445 19.4233 23.3335 22.6606C17.425 28.8088 14.8413 21.118 14.179 19.1473C14.0576 18.7861 14.0008 18.6171 14 18.7608C13.9992 18.6171 13.9424 18.7861 13.821 19.1473C13.159 21.118 10.5753 28.809 4.66651 22.6606C1.55544 19.4233 2.99593 16.1859 8.65876 15.2088C5.41908 15.7679 1.77707 14.8441 0.777768 11.2223C0.490229 10.1804 0 3.76361 0 2.89663C0 -1.44498 3.75304 -0.0805744 6.06921 1.68281H6.06937Z"
          fill="white"
        />
      </svg>
    </span>
  );
}

function MatchIcon() {
  return (
    <span className="relative h-[18px] w-[18px] shrink-0 max-md:h-4 max-md:w-4">
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        className="absolute left-0.5 top-0.5 h-[15px] w-[15px] text-match-text max-md:h-3.5 max-md:w-3.5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0.625 7.375C4 7.375 7.375 4 7.375 0.625C7.375 4 10.75 7.375 14.125 7.375C10.75 7.375 7.375 10.75 7.375 14.125C7.375 10.75 4 7.375 0.625 7.375Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        width="5"
        height="5"
        viewBox="0 0 5 5"
        className="absolute left-0.5 top-[13px] h-1 w-1 text-match-text max-md:top-3"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0.625 2.5C1.25 2.5 2.5 1.24997 2.5 0.625C2.5 1.24997 3.75 2.5 4.375 2.5C3.75 2.5 2.5 3.75002 2.5 4.375C2.5 3.75002 1.25 2.5 0.625 2.5Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        width="6"
        height="6"
        viewBox="0 0 6 6"
        className="absolute left-3 top-0.5 h-[5px] w-[5px] text-match-text max-md:left-2.75"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0.625 2.875C1.375 2.875 2.875 1.375 2.875 0.625C2.875 1.375 4.375 2.875 5.125 2.875C4.375 2.875 2.875 4.375 2.875 5.125C2.875 4.375 1.375 2.875 0.625 2.875Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function JobMetaItem({ icon, children }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap text-[14px] font-medium leading-none text-main-text max-md:text-[11px]">
      {icon}
      {children}
    </span>
  );
}

function MatchPill({ label, score }) {
  return (
    <span className="inline-flex h-8.25 items-center gap-2 rounded-full bg-match-surface px-3.5 text-[12px] font-medium leading-none text-match-text ring-1 ring-match-text/10 ring-inset max-md:h-6 max-md:px-2.5 max-md:text-[8px]">
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
    <article className="group relative h-65 w-full rounded-2xl border border-search-border bg-card shadow-card transition duration-200 hover:border-secondary-blue hover:shadow-card-hover hover:ring-2 hover:ring-secondary-blue/80 dark:hover:border-blue-400 dark:hover:ring-blue-400/70 max-md:h-45.25 max-md:rounded-xl">
      <Link
        href={jobDetailsPath}
        className="flex h-full flex-col px-5.75 pb-5.5 pt-5.5 max-md:px-3.75 max-md:pb-3 max-md:pt-3.5"
      >
        <div className="flex items-start gap-5.5 max-md:gap-2.75">
          <ButterflyLogo colorClass={logoColorClass} />

          <div className="min-w-0 flex-1 pt-px">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-[18px] font-semibold leading-[1.15] text-text-main max-md:text-[13px]">
                  {title}
                </h2>

                <p className="mt-2 text-[14px] font-medium leading-none text-success max-md:mt-1 max-md:text-[10px]">
                  {companyName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleShareJob}
                className="grid h-9.75 w-9.75 shrink-0 place-items-center rounded-full bg-black/3.5 text-icon-muted transition hover:bg-blue-600/10 hover:text-blue-600 dark:bg-white/5 dark:text-slate-500 max-md:h-7.5 max-md:w-7.5"
                aria-label="Save job"
              >
                {shareStatus === "Copied" || shareStatus === "Saved" ? (
                  <FiCheck size={18} className="max-md:h-3 max-md:w-3" />
                ) : (
                  <FiBookmark size={18} className="max-md:h-3 max-md:w-3" />
                )}
              </button>
            </div>

          </div>
        </div>

        <div className="mt-6 max-md:mt-2.5">
          <MatchPill label={matchLabel} score={matchScore} />
        </div>

        <div className="mb-4 mt-4 flex flex-1 items-start justify-between gap-6 max-md:mb-2 max-md:mt-2.5 max-md:gap-3">
          <p className="line-clamp-2 w-71.25 max-w-full text-[14px] font-[400] leading-5 text-[#404C5D] max-md:w-auto max-md:max-w-54 max-md:text-[11px] max-md:leading-4">
            {description}
          </p>

          <span className="mt-px grid h-11.25 min-w-35.25 place-items-center rounded-[10px] bg-blue-600 text-[14px] font-semibold text-white shadow-action transition group-hover:bg-secondary-blue-dark max-md:h-8.5 max-md:min-w-22 max-md:rounded-md max-md:text-[12px]">
            Apply
          </span>
        </div>

        <div className="mt-auto border-t border-[#D9D9D9] pt-3.75 max-md:pt-3">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-3.25 max-md:gap-2.5">
              <JobMetaItem
                icon={
                  <FiBriefcase
                    size={16}
                    className="shrink-0 max-md:h-3 max-md:w-3"
                  />
                }
              >
                {formatJobType(safeJob.job_type)}
              </JobMetaItem>

              <JobMetaItem
                icon={
                  <FiMapPin
                    size={16}
                    className="shrink-0 max-md:h-3 max-md:w-3"
                  />
                }
              >
                <span className="max-w-42 truncate max-md:max-w-22.5">
                  {safeJob.location || "Kottawa, Sri Lanka"}
                </span>
              </JobMetaItem>
            </div>

            <span className="shrink-0 whitespace-nowrap text-[14px] font-medium leading-none text-main-text max-md:text-[11px]">
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
