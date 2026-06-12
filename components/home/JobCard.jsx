"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiBookmark,
  FiBriefcase,
  FiCheck,
  FiMapPin,
} from "react-icons/fi";

const CARD_COLORS = [
  "#0152A4",
  "#FF3347",
  "#C92FE6",
  "#F59E0B",
  "#13C276",
  "#89B6D6",
  "#0152A4",
  "#001D39",
  "#FF3347",
  "#13C276",
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

function ButterflyLogo({ color }) {
  return (
    <span
      className="relative grid h-[44px] w-[44px] shrink-0 place-items-center rounded-[8px] max-md:h-[40px] max-md:w-[40px] max-md:rounded-[7px]"
      style={{ backgroundColor: color }}
    >
      <span className="relative h-[22px] w-[24px] max-md:h-[19px] max-md:w-[22px]">
        <span className="absolute left-[1px] top-[2px] h-[12px] w-[10px] rounded-full bg-white max-md:h-[10px] max-md:w-[9px]" />
        <span className="absolute right-[1px] top-[2px] h-[12px] w-[10px] rounded-full bg-white max-md:h-[10px] max-md:w-[9px]" />
        <span className="absolute bottom-[1px] left-[5px] h-[9px] w-[8px] rounded-full bg-white max-md:left-[4px] max-md:h-[8px] max-md:w-[7px]" />
        <span className="absolute bottom-[1px] right-[5px] h-[9px] w-[8px] rounded-full bg-white max-md:right-[4px] max-md:h-[8px] max-md:w-[7px]" />
        <span
          className="absolute left-[10px] top-[7px] h-[9px] w-[4px] bg-[#080808] max-md:left-[9px] max-md:top-[5px] max-md:h-[8px] max-md:w-[4px]"
          style={{ borderRadius: "999px" }}
        />
      </span>
    </span>
  );
}

function MatchIcon() {
  return (
    <span className="inline-grid h-[13px] w-[13px] shrink-0 place-items-center">
      <svg
        viewBox="0 0 18 18"
        className="h-[13px] w-[13px]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 1.8L10.45 6.15L14.85 7.55L10.45 8.95L9 13.2L7.55 8.95L3.15 7.55L7.55 6.15L9 1.8Z"
          stroke="#87DEB4"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <path
          d="M3.2 11.2L3.95 13.35L6.1 14.1L3.95 14.85L3.2 17L2.45 14.85L0.3 14.1L2.45 13.35L3.2 11.2Z"
          stroke="#87DEB4"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M14.3 1L14.85 2.55L16.4 3.1L14.85 3.65L14.3 5.2L13.75 3.65L12.2 3.1L13.75 2.55L14.3 1Z"
          stroke="#87DEB4"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function JobMetaItem({ icon, children }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-[5px] whitespace-nowrap text-[10px] font-medium leading-none text-[var(--text-muted)] max-md:text-[9px]">
      {icon}
      {children}
    </span>
  );
}

function MatchPill({ label, score }) {
  return (
    <span className="inline-flex h-[23px] items-center gap-[6px] rounded-full bg-[#0F241F] px-[10px] text-[9px] font-semibold leading-none text-[#87DEB4] shadow-[inset_0_0_0_1px_rgba(135,222,180,0.10)] max-md:h-[21px] max-md:px-[8px] max-md:text-[8px]">
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
  const fullJobUrl = `${getAppBaseUrl()}${jobDetailsPath}`;
  const companyName = getCompanyName(safeJob);
  const title = getTitle(safeJob);
  const description = getDescription(safeJob);
  const iconColor = CARD_COLORS[colorIndex % CARD_COLORS.length];

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
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

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
    <article className="group relative h-[176px] rounded-[10px] border border-transparent bg-[var(--card-bg)] shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-[1px] hover:border-[#155DFC] hover:ring-1 hover:ring-[#155DFC]/20 hover:shadow-[0_0_40.5px_rgba(0,0,0,0.08)] dark:hover:border-[#4CA5FF] max-md:h-[162px] max-md:rounded-[9px]">
      <Link
        href={jobDetailsPath}
        className="flex h-full flex-col px-[16px] pb-[13px] pt-[16px] max-md:px-[13px] max-md:pb-[11px] max-md:pt-[13px]"
      >
        <div className="flex items-start gap-[15px] max-md:gap-[11px]">
          <ButterflyLogo color={iconColor} />

          <div className="min-w-0 flex-1 pt-[1px]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-[14px] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--text-main)] max-md:text-[12px]">
                  {title}
                </h2>

                <p className="mt-[5px] text-[11px] font-bold leading-none text-[#13C276] max-md:mt-[4px] max-md:text-[9px]">
                  {companyName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleShareJob}
                className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full bg-black/[0.035] text-[#A8B0BE] transition hover:bg-[#155DFC]/10 hover:text-[#155DFC] dark:bg-white/[0.05] dark:text-[#5F6878] max-md:h-[24px] max-md:w-[24px]"
                aria-label="Save job"
              >
                {shareStatus === "Copied" || shareStatus === "Saved" ? (
                  <FiCheck size={14} className="max-md:h-[12px] max-md:w-[12px]" />
                ) : (
                  <FiBookmark size={14} className="max-md:h-[12px] max-md:w-[12px]" />
                )}
              </button>
            </div>

            <div className="mt-[8px]">
              <MatchPill label={matchLabel} score={matchScore} />
            </div>
          </div>
        </div>

        <div className="mb-[8px] mt-[18px] flex flex-1 items-start justify-between gap-4 max-md:mb-[7px] max-md:mt-[11px] max-md:gap-3">
          <p className="line-clamp-2 max-w-[260px] text-[10px] font-medium leading-[1.32] text-[var(--text-muted)] max-md:max-w-[170px] max-md:text-[9px] max-md:leading-[1.35]">
            {description}
          </p>

          <span className="mt-[1px] grid h-[30px] min-w-[68px] place-items-center rounded-[5px] bg-[#155DFC] text-[11px] font-semibold text-white shadow-[1px_1px_6.6px_rgba(0,0,0,0.09)] transition group-hover:bg-[#014FE0] max-md:h-[26px] max-md:min-w-[55px] max-md:text-[9px]">
            Apply
          </span>
        </div>

        <div className="mt-auto border-t border-[var(--line-soft)] pt-[14px] max-md:pt-[11px]">
          <div className="flex items-center justify-between gap-[10px]">
            <div className="flex min-w-0 flex-1 items-center gap-[14px] max-md:gap-[10px]">
              <JobMetaItem
                icon={
                  <FiBriefcase
                    size={11}
                    className="shrink-0 max-md:h-[9px] max-md:w-[9px]"
                  />
                }
              >
                {formatJobType(safeJob.job_type)}
              </JobMetaItem>

              <JobMetaItem
                icon={
                  <FiMapPin
                    size={11}
                    className="shrink-0 max-md:h-[9px] max-md:w-[9px]"
                  />
                }
              >
                <span className="max-w-[120px] truncate max-md:max-w-[90px]">
                  {safeJob.location || "Kottawa, Sri Lanka"}
                </span>
              </JobMetaItem>
            </div>

            <span className="shrink-0 whitespace-nowrap text-[10px] font-medium leading-none text-[var(--text-muted)] max-md:text-[9px]">
              <span className="hidden md:inline">Posted on </span>
              <span className="md:hidden">On </span>
              {formatDate(safeJob.created_at)}
            </span>
          </div>
        </div>
      </Link>

      {shareStatus ? (
        <div className="absolute right-[18px] top-[48px] rounded-[5px] border border-[var(--line-soft)] bg-[var(--surface-bg)] px-2 py-1 text-[10px] font-semibold text-[var(--text-main)] shadow-lg max-md:right-[12px] max-md:top-[42px]">
          {shareStatus}
        </div>
      ) : null}
    </article>
  );
}