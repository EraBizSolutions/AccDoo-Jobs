"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiBriefcase,
  FiCheck,
  FiInfo,
  FiLoader,
  FiMapPin,
  FiShare2,
  FiUser,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { LuSparkles } from "react-icons/lu";

import MatchBadge from "@/components/common/MatchBadge";
import ApplyJobModal from "@/components/candidate/ApplyJobModal";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import {
  getPublicJobDetails,
  getPublicJobQuestions,
} from "@/lib/api/jobsApi";
import {
  activateCandidateProfile,
  getMyCandidateProfile,
} from "@/lib/api/candidateApi";
import { getAccessToken, getStoredUser } from "@/lib/utils/tokenStorage";
import {
  getCandidateProfileCompletionIssues,
  isCandidateProfileComplete,
} from "@/lib/utils/candidateProfileRules";
import { isExpiredJob } from "@/lib/seo/jobSeo";

function getCompanyInitials(companyName = "AD") {
  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
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
  if (!job?.salary_min && !job?.salary_max) return "Salary not disclosed";

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

function formatValue(value, fallback = "Not added") {
  if (!value) return fallback;

  return String(value)
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join("-");
}

function getSkillTags(requiredSkills) {
  if (!requiredSkills) return [];

  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function cleanDescriptionLine(line) {
  return String(line || "")
    .trim()
    .replace(/^[-•*]\s*/, "")
    .trim();
}

function isHeadingLine(line) {
  const cleanedLine = cleanDescriptionLine(line);

  if (!cleanedLine) return false;

  const lowerLine = cleanedLine.toLowerCase();

  const knownHeadings = [
    "key responsibilities",
    "responsibilities",
    "main responsibilities",
    "job responsibilities",
    "required skills",
    "skills required",
    "skills",
    "requirements",
    "job requirements",
    "candidate requirements",
    "qualifications",
    "education",
    "experience",
    "role overview",
    "about the role",
    "job description",
    "benefits",
    "working hours",
    "salary",
    "location",
    "what you will do",
    "what you'll do",
    "duties",
    "daily duties",
  ];

  if (knownHeadings.includes(lowerLine)) {
    return true;
  }

  if (cleanedLine.endsWith(":")) {
    return true;
  }

  return false;
}

function buildDescriptionSections(description) {
  if (!description || !String(description).trim()) {
    return [
      {
        title: "About the role",
        paragraph:
          "The recruiter has not added a detailed job description yet. Please review the quick facts and required skills before applying.",
        items: [],
      },
    ];
  }

  const lines = String(description)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = [];
  let currentSection = {
    title: "About the role",
    paragraph: "",
    items: [],
  };

  lines.forEach((line) => {
    const cleanedLine = cleanDescriptionLine(line);

    if (!cleanedLine) return;

    if (isHeadingLine(cleanedLine)) {
      const hasContent =
        currentSection.paragraph.trim() || currentSection.items.length > 0;

      if (hasContent) {
        sections.push(currentSection);
      }

      currentSection = {
        title: cleanedLine.replace(/:$/, ""),
        paragraph: "",
        items: [],
      };

      return;
    }

    if (!currentSection.paragraph && currentSection.title === "About the role") {
      currentSection.paragraph = cleanedLine;
      return;
    }

    currentSection.items.push(cleanedLine);
  });

  const hasLastContent =
    currentSection.paragraph.trim() || currentSection.items.length > 0;

  if (hasLastContent) {
    sections.push(currentSection);
  }

  return sections.length
    ? sections
    : [
        {
          title: "About the role",
          paragraph: String(description).trim(),
          items: [],
        },
      ];
}

const HERO_SHINE_CLASS =
  "relative isolate overflow-hidden before:pointer-events-none before:absolute before:inset-y-[-20%] before:left-0 before:w-1/2 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:animate-shimmer";
const APPLY_BORDER_CLASS =
  "relative isolate overflow-hidden shadow-sm before:pointer-events-none before:absolute before:left-1/2 before:top-1/2 before:h-[210%] before:w-[210%] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-[conic-gradient(from_0deg,transparent_0_58%,rgba(21,93,252,0.95)_68%,rgba(255,255,255,1)_74%,rgba(21,93,252,0.95)_80%,transparent_90%)] before:animate-border-spin after:pointer-events-none after:absolute after:inset-[2px] after:rounded-[6px] after:bg-inherit hover:shadow-[0_8px_18px_rgba(21,93,252,0.18)]";

function PaperPlaneIcon({ className = "" }) {
  return (
    <span className={`relative h-[18px] w-[18px] shrink-0 ${className}`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0.5 top-0.5 h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path
          d="M14.6608 1.1647C13.0273 -0.594479 0.739859 3.7149 0.750006 5.28825C0.761511 7.07242 5.54857 7.62127 6.8754 7.99357C7.67332 8.21737 7.887 8.44687 8.07097 9.28357C8.90422 13.0729 9.32257 14.9576 10.276 14.9997C11.7958 15.0669 16.255 2.8815 14.6608 1.1647Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        width="5"
        height="5"
        viewBox="0 0 5 5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-[9px] top-[7px] h-[3px] w-[3px]"
        aria-hidden="true"
      >
        <path
          d="M0.75 3.375L3.375 0.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function RocketIcon({ className = "" }) {
  return (
    <span className={`relative h-[18px] w-[18px] shrink-0 ${className}`}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-1 top-0.5 h-3 w-3"
        aria-hidden="true"
      >
        <path
          d="M5.47597 3.74212L6.59017 2.62794C7.8447 1.3734 9.48712 0.85303 11.2253 0.767995C11.9014 0.73492 12.2395 0.718383 12.5105 0.989463C12.7816 1.26054 12.7651 1.59858 12.732 2.27467C12.6469 4.01288 12.1266 5.65532 10.8721 6.90983L9.75787 8.02403C8.84032 8.94158 8.57947 9.2025 8.77207 10.1978C8.9622 10.958 9.14617 11.6942 8.59335 12.2471C7.92277 12.9176 7.31107 12.9176 6.6405 12.2471L1.25293 6.8595C0.582367 6.18891 0.582344 5.57723 1.25293 4.90665C1.80575 4.35382 2.54197 4.53783 3.30223 4.72792C4.2975 4.92055 4.55842 4.65967 5.47597 3.74212Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        width="6"
        height="6"
        viewBox="0 0 6 6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0.5 top-3 h-1 w-1"
        aria-hidden="true"
      >
        <path
          d="M0.75 4.5L4.5 0.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <svg
        width="3"
        height="3"
        viewBox="0 0 3 3"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-1.5 top-[15px] h-0.5 w-0.5"
        aria-hidden="true"
      >
        <path
          d="M0.75 2.25L2.25 0.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <svg
        width="3"
        height="3"
        viewBox="0 0 3 3"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0.5 top-2.5 h-0.5 w-0.5"
        aria-hidden="true"
      >
        <path
          d="M0.75 2.25L2.25 0.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function ButterflyLogo({ className = "" }) {
  return (
    <span
      className={`grid place-items-center rounded-xl bg-[#001D39] text-white ${className}`}
    >
      <svg
        width="28"
        height="25"
        viewBox="0 0 28 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-8"
        aria-hidden="true"
      >
        <path
          d="M6.06937 1.68281C9.2795 4.12665 12.7324 9.08176 14.0001 11.741C15.2679 9.08195 18.7206 4.1266 21.9308 1.68281C24.2471 -0.0805744 28 -1.44498 28 2.89663C28 3.76371 27.5098 10.1805 27.2222 11.2223C26.2228 14.8441 22.5808 15.7679 19.3412 15.2088C25.004 16.1861 26.4445 19.4233 23.3335 22.6606C17.425 28.8088 14.8413 21.118 14.179 19.1473C14.0576 18.7861 14.0008 18.6171 14 18.7608C13.9992 18.6171 13.9424 18.7861 13.821 19.1473C13.159 21.118 10.5753 28.809 4.66651 22.6606C1.55544 19.4233 2.99593 16.1859 8.65876 15.2088C5.41908 15.7679 1.77707 14.8441 0.777768 11.2223C0.490229 10.1804 0 3.76361 0 2.89663C0 -1.44498 3.75304 -0.0805744 6.06921 1.68281H6.06937Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function DetailMeta({ icon, children }) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-[9px] rounded-full border border-white/20 bg-white/20 px-4 text-sm font-medium text-white shadow-sm backdrop-blur max-md:h-7 max-md:max-w-full max-md:px-3 max-md:text-[11px] ${HERO_SHINE_CLASS}`}
    >
      <span className="relative z-10 inline-flex items-center">{icon}</span>
      <span className="relative z-10">{children}</span>
    </span>
  );
}

function SalaryMeta({ children }) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-[9px] rounded-full border border-white/20 bg-white/20 px-4 text-sm font-medium text-white shadow-sm backdrop-blur max-md:h-7 max-md:max-w-full max-md:px-3 max-md:text-[11px] ${HERO_SHINE_CLASS}`}
    >
      <span className="relative z-10 rounded-[4px] bg-white px-2 py-0.5 text-[10px] font-bold text-[#155DFC]">
        LKR
      </span>
      <span className="relative z-10">{children}</span>
    </span>
  );
}

function JobSection({ title, paragraph, items }) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="mt-8">
      <h2 className="text-[22px] font-semibold tracking-tight text-[#001D39] max-md:text-[18px]">
        {title}
      </h2>

      {paragraph ? (
        <p className="mt-7 max-w-4xl whitespace-pre-line text-[16px] font-semibold leading-7 text-[#8B8993] max-md:mt-4 max-md:text-[13px] max-md:leading-6">
          {paragraph}
        </p>
      ) : null}

      {safeItems.length ? (
        <ul className="mt-9 list-disc space-y-7 pl-5 text-[15px] font-medium leading-6 text-[#31445A] marker:text-[#001D39] max-md:mt-5 max-md:space-y-4 max-md:text-[13px] max-md:leading-5">
          {safeItems.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function CandidateAlignmentCard({ job, skills, candidateProfile, isOwnPostedJob }) {
  const completionIssues = getCandidateProfileCompletionIssues(candidateProfile);
  const profileIsComplete =
    Boolean(candidateProfile) && completionIssues.length === 0;

  const hasBackendMatch =
    job?.match_score !== null && job?.match_score !== undefined;

  const matchScore = hasBackendMatch ? Number(job.match_score) || 0 : null;
  const matchedSkills = Array.isArray(job?.matched_skills)
    ? job.matched_skills
    : [];
  const missingSkills = Array.isArray(job?.missing_skills)
    ? job.missing_skills
    : [];

  return (
    <section
      className={`w-full max-w-[816px] overflow-hidden rounded-xl border px-10 py-8 max-md:px-5 max-md:py-6 lg:h-[217px] ${
        isOwnPostedJob
          ? "border-slate-200 bg-slate-50"
          : profileIsComplete && hasBackendMatch
          ? "border-blue-200 bg-blue-50"
          : profileIsComplete
          ? "border-emerald-100 bg-emerald-50"
          : "border-[#9AD0FF] bg-[#F3F9FF]"
      }`}
    >
      <div className="flex flex-col gap-8 max-md:gap-5 md:flex-row md:items-center">
        <div
          className={`grid h-28 w-28 shrink-0 place-items-center rounded-full border-4 bg-white text-center max-md:h-22 max-md:w-22 ${
            isOwnPostedJob
              ? "border-slate-300"
              : profileIsComplete && hasBackendMatch
              ? "border-[#155DFC]"
              : profileIsComplete
              ? "border-emerald-500"
              : "border-[#155DFC]"
          }`}
        >
          <div>
            <p
              className={`text-2xl font-medium max-md:text-xl ${
                isOwnPostedJob
                  ? "text-slate-500"
                  : profileIsComplete && hasBackendMatch
                  ? "text-[#155DFC]"
                  : profileIsComplete
                  ? "text-emerald-700"
                  : "text-[#155DFC]"
              }`}
            >
              {isOwnPostedJob ? "Owner" : hasBackendMatch ? `${matchScore}%` : "Ready"}
            </p>

            <p
              className={`text-[10px] font-medium uppercase tracking-wide max-md:text-[9px] ${
                isOwnPostedJob
                  ? "text-slate-500"
                  : profileIsComplete && hasBackendMatch
                  ? "text-[#155DFC]"
                  : profileIsComplete
                  ? "text-emerald-700"
                  : "text-[#FF9F00]"
              }`}
            >
              {isOwnPostedJob ? "posted" : hasBackendMatch ? "match" : "profile"}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-2 text-xl font-semibold text-[#001D39] max-md:text-[16px]">
              {isOwnPostedJob ? (
                <FiInfo className="text-slate-500" />
              ) : profileIsComplete && hasBackendMatch ? (
                <LuSparkles className="text-[#155DFC]" />
              ) : profileIsComplete ? (
                <LuSparkles className="text-emerald-700" />
              ) : null}

              {isOwnPostedJob
                ? "This is your posted job"
                : profileIsComplete && hasBackendMatch
                ? "Candidate-job match preview"
                : profileIsComplete
                ? "Profile ready for matching"
                : "Complete profile to unlock applying"}
            </p>

            {!isOwnPostedJob && hasBackendMatch ? (
              <MatchBadge
                score={job.match_score}
                label={job.match_label}
                size="lg"
              />
            ) : null}
          </div>

          <p className="mt-3 text-sm font-medium leading-6 text-[#31445A] max-md:text-[12px] max-md:leading-5">
            {isOwnPostedJob
              ? "You are logged in as the recruiter who posted this job. You can preview it, share it, and manage applicants from the recruiter workspace, but you cannot apply to your own job."
              : profileIsComplete && hasBackendMatch
              ? job.match_summary ||
                "This score is calculated by comparing your candidate skills with the job required skills from the backend."
              : profileIsComplete
              ? "Your candidate profile is ready. Login as a candidate with saved skills to see live backend match scoring."
              : "You can view this job, but you must complete your candidate profile before applying."}
          </p>

          {!isOwnPostedJob && !profileIsComplete && completionIssues.length ? (
            <p className="mt-4 text-sm font-semibold text-[#155DFC]">
              Candidate profile is missing.
            </p>
          ) : null}

          {!isOwnPostedJob && hasBackendMatch ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/70 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
                  Matched skills
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {matchedSkills.length ? (
                    matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-normal text-emerald-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-normal text-[#585958]">
                      No direct matches yet
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/70 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-orange-700">
                  Missing skills
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {missingSkills.length ? (
                    missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-normal text-orange-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-normal text-[#585958]">
                      No missing required skills
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : skills.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className={`rounded-full px-3 py-1.5 text-xs font-normal ${
                    isOwnPostedJob
                      ? "bg-white text-slate-500"
                      : "border border-[#C5C2D1] bg-white px-5 text-[#001D39]"
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ApplyButton({
  isPreparingApply,
  isOwnPostedJob,
  onClick,
  className = "",
  fullWidth = false,
}) {
  if (isOwnPostedJob) {
    return (
      <button
        type="button"
        disabled
        title="You cannot apply to a job you posted."
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-500 ${
          fullWidth ? "w-full" : ""
        } ${className}`}
      >
        <FiBriefcase />
        Your posted job
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPreparingApply}
      className={`inline-flex h-12 items-center justify-center gap-2.5 rounded-md bg-[#155DFC] px-8 text-sm font-medium leading-none text-white transition hover:bg-[#0E4ED8] disabled:cursor-not-allowed disabled:bg-blue-300 ${APPLY_BORDER_CLASS} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {isPreparingApply ? (
        <FiLoader className="relative z-10 animate-spin" />
      ) : (
        <PaperPlaneIcon className="relative z-10" />
      )}
      <span className="relative z-10">
        {isPreparingApply ? "Checking profile..." : "Apply now"}
      </span>
    </button>
  );
}

export default function PublicJobDetailsView({ initialJob = null }) {
  const params = useParams();
  const router = useRouter();

  const jobId = params.jobId;

  const [job, setJob] = useState(initialJob);
  const [questions, setQuestions] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialJob);
  const [isPreparingApply, setIsPreparingApply] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [applyStatusMessage, setApplyStatusMessage] = useState("");
  const [applyStatusType, setApplyStatusType] = useState("error");

  const companyName = job?.company_name || "AccDoo Company";
  const companyInitials = getCompanyInitials(companyName);
  const skills = getSkillTags(job?.required_skills);
  const sections = buildDescriptionSections(job?.description);
  const fullJobUrl = job?.public_url || `${getAppBaseUrl()}/jobs/${jobId}`;

  const isOwnPostedJob =
    Boolean(currentUser?.id) &&
    Boolean(job?.recruiter_user_id) &&
    Number(currentUser.id) === Number(job.recruiter_user_id);

  const hasMatchScore =
    job?.match_score !== null && job?.match_score !== undefined;
  const hasExpired = isExpiredJob(job);

  useEffect(() => {
    queueMicrotask(() => {
      setCurrentUser(getStoredUser());
    });

    async function loadJobPageData() {
      setErrorMessage("");

      try {
        const jobRequest = initialJob
          ? Promise.resolve(initialJob)
          : getPublicJobDetails(jobId);

        const [jobData, questionData] = await Promise.all([
          jobRequest,
          getPublicJobQuestions(jobId).catch(() => []),
        ]);

        setJob(jobData);
        setQuestions(Array.isArray(questionData) ? questionData : []);

        if (getAccessToken()) {
          try {
            const profile = await getMyCandidateProfile();
            setCandidateProfile(profile);
          } catch {
            setCandidateProfile(null);
          }
        }
      } catch (error) {
        setErrorMessage(error.message || "Could not load job details.");
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      loadJobPageData();
    }
  }, [initialJob, jobId]);

  async function handleShareJob() {
    setShareStatus("");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: job?.title || "AccDoo job opportunity",
          text: `${job?.title || "Job opportunity"} at ${companyName}`,
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

  async function prepareCandidateProfile() {
    try {
      const profile = await getMyCandidateProfile();
      setCandidateProfile(profile);
      return profile;
    } catch {
      const activatedProfile = await activateCandidateProfile();
      setCandidateProfile(activatedProfile);
      return activatedProfile;
    }
  }

  function rememberProfileGateReason(issues) {
    if (typeof window === "undefined") return;

    sessionStorage.setItem(
      "accdoo_profile_gate_reason",
      JSON.stringify({
        from: "job_apply",
        jobId,
        issues,
        createdAt: Date.now(),
      })
    );
  }

  async function handleApplyClick() {
    setApplyStatusMessage("");
    setApplyStatusType("error");

    if (!getAccessToken() || !currentUser) {
      router.push("/login");
      return;
    }

    if (isOwnPostedJob) {
      setApplyStatusType("neutral");
      setApplyStatusMessage(
        "You cannot apply to this job because it was posted by your recruiter account."
      );
      return;
    }

    try {
      setIsPreparingApply(true);

      const profile = await prepareCandidateProfile();

      if (!profile?.cv_url) {
        const issues = ["CV is missing."];
        rememberProfileGateReason(issues);

        setApplyStatusType("warning");
        setApplyStatusMessage("Please upload your CV before applying.");
        router.push("/candidate/upload-cv");
        return;
      }

      const issues = getCandidateProfileCompletionIssues(profile);

      if (!isCandidateProfileComplete(profile)) {
        rememberProfileGateReason(issues);

        setApplyStatusType("warning");
        setApplyStatusMessage(
          `Please complete your candidate profile first: ${issues.join(" ")}`
        );

        router.push("/candidate/profile");
        return;
      }

      setIsApplyModalOpen(true);
    } catch (error) {
      setApplyStatusType("error");
      setApplyStatusMessage(
        error.message ||
          "Could not prepare your candidate profile. Please try again."
      );
    } finally {
      setIsPreparingApply(false);
    }
  }

  function getApplyStatusClass() {
    if (applyStatusType === "neutral") {
      return "border-slate-200 bg-slate-50 text-slate-600";
    }

    if (applyStatusType === "warning") {
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    }

    return "border-red-200 bg-red-50 text-red-600";
  }

  return (
    <main className="min-h-screen bg-white font-sans">
      <Navbar />

      <section>
        {isLoading ? (
          <div className="mx-auto my-12 max-w-7xl rounded-2xl border border-slate-200 bg-[#F9FBFB] p-8 text-sm font-normal text-[#585958]">
            Loading job details...
          </div>
        ) : errorMessage ? (
          <div className="mx-auto my-12 max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-8">
            <p className="text-sm font-normal text-red-600">{errorMessage}</p>

            <Link
              href="/"
              className="mt-4 inline-flex rounded-xl bg-[#155DFC] px-5 py-3 text-sm font-medium text-white"
            >
              Go back home
            </Link>
          </div>
        ) : job ? (
          <>
            <section className="h-[257px] bg-gradient-to-r from-[#1C63FF] to-[#073AA6] text-white max-md:h-auto max-md:min-h-[326px]">
              <div className="mx-auto flex h-full w-full max-w-360 flex-col justify-between gap-8 px-17 py-7 max-xl:px-10 max-md:h-auto max-md:gap-6 max-md:px-5 max-md:py-6 md:flex-row md:items-center">
                <div className="flex gap-7 max-md:gap-4">
                  <ButterflyLogo className="mt-1 h-[70px] w-[70px] shrink-0 max-md:h-14 max-md:w-14" />

                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <div
                        className={`inline-flex h-8 w-[164px] items-center justify-center gap-2 rounded-full border border-white/5 bg-white/[0.18] text-[10px] font-medium text-white backdrop-blur-xl ${HERO_SHINE_CLASS}`}
                      >
                        <LuSparkles className="relative z-10" size={14} />
                        <span className="relative z-10">
                          AccDoo verified role
                        </span>
                      </div>

                      {hasMatchScore && !isOwnPostedJob ? (
                        <MatchBadge
                          score={job.match_score}
                          label={job.match_label}
                        />
                      ) : null}

                      {isOwnPostedJob ? (
                        <div className="inline-flex h-7 items-center gap-2 rounded-full bg-white/20 px-4 text-xs font-semibold text-white">
                          <FiBriefcase size={14} />
                          Your posted job
                        </div>
                      ) : null}
                    </div>

                    <h1 className="mt-4 text-[44px] font-semibold leading-none tracking-tight max-md:text-[28px] max-md:leading-tight">
                      {job.title || "Untitled role"}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {companyName}
                      </p>
                      <MdVerified className="text-[#35FF28]" size={18} />
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3 max-md:mt-5 max-md:gap-2">
                      <DetailMeta icon={<FiBriefcase size={16} />}>
                        {formatValue(job.job_type, "Job type not added")}
                      </DetailMeta>

                      <DetailMeta icon={<FiMapPin size={16} />}>
                        {job.location || "Location not added"}
                      </DetailMeta>

                      <SalaryMeta>{formatSalary(job)}</SalaryMeta>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[18px] max-md:justify-center md:self-center">
                  <ApplyButton
                    isPreparingApply={isPreparingApply}
                    isOwnPostedJob={isOwnPostedJob}
                    onClick={handleApplyClick}
                    className={`!h-11 !w-[147px] !rounded-lg !bg-white !px-0 !text-[#001D39] hover:!bg-blue-50 ${
                      isOwnPostedJob ? "hover:cursor-not-allowed" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={handleShareJob}
                    className={`inline-flex h-11 w-[147px] items-center justify-center gap-2.5 rounded-lg border border-white/25 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10 ${HERO_SHINE_CLASS}`}
                  >
                    {shareStatus === "Link copied" || shareStatus === "Shared" ? (
                      <FiCheck className="relative z-10" />
                    ) : (
                      <FiShare2 className="relative z-10" />
                    )}
                    <span className="relative z-10">{shareStatus || "Share"}</span>
                  </button>
                </div>
              </div>
            </section>

            <div className="mx-auto w-full max-w-360 px-17 max-xl:px-10 max-md:px-4">
              {applyStatusMessage ? (
                <p
                  className={`mt-6 rounded-xl border px-4 py-3 text-sm font-normal ${getApplyStatusClass()}`}
                >
                  {applyStatusMessage}
                </p>
              ) : null}

              {hasExpired ? (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-normal text-amber-800">
                  This job posting has expired. You can still review the role,
                  but applications may no longer be accepted.
                </div>
              ) : null}

            <div className="mx-auto grid w-full gap-[53px] py-8 max-md:gap-8 max-md:py-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,816px)_403px] xl:justify-center">
              <article>
                <CandidateAlignmentCard
                  job={job}
                  skills={skills}
                  candidateProfile={candidateProfile}
                  isOwnPostedJob={isOwnPostedJob}
                />

                {sections.map((section, index) => (
                  <JobSection
                    key={`${section.title}-${index}`}
                    title={section.title}
                    paragraph={section.paragraph}
                    items={section.items}
                  />
                ))}

                {skills.length ? (
                  <section className="mt-10 border-t border-[#D9D9D9] pt-8 max-md:mt-8 max-md:pt-6">
                    <h2 className="text-[22px] font-semibold tracking-tight text-[#001D39] max-md:text-[18px]">
                      Skills
                    </h2>

                    <div className="mt-6 flex flex-wrap gap-4">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex h-8 min-w-17 items-center justify-center rounded-full border border-[#155DFC] bg-white px-5 text-sm font-semibold text-[#155DFC] max-md:h-7 max-md:px-4 max-md:text-[12px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="mt-10 border-t border-[#D9D9D9] pt-8 max-md:mt-8 max-md:pt-6">
                  <h2 className="text-[22px] font-semibold tracking-tight text-[#001D39] max-md:text-[18px]">
                    Apply
                  </h2>

                  <p className="mt-7 text-sm font-semibold leading-6 text-[#31445A] max-md:mt-4 max-md:text-[13px] max-md:leading-5">
                    {isOwnPostedJob
                      ? "This job belongs to your recruiter account, so applying is disabled for this logged-in user."
                      : "Complete your candidate profile, review your CV, answer recruiter questions, and submit your application from one clean popup."}
                  </p>

                  <ApplyButton
                    isPreparingApply={isPreparingApply}
                    isOwnPostedJob={isOwnPostedJob}
                    onClick={handleApplyClick}
                    className="mt-4"
                  />
                </section>
              </article>

              <aside className="w-full space-y-4 lg:w-[403px]">
                <div className="flex h-auto min-h-[408px] flex-col rounded-xl border border-[#E0DEE6] bg-white px-7 py-9 shadow-sm max-md:min-h-0 max-md:px-5 max-md:py-6 lg:h-[408px]">
                  <p className="text-[14px] font-semibold text-[#0152A4]">
                    Quick Facts
                  </p>

                  <div className="mt-6 divide-y divide-[#F0F0F0] text-sm font-normal text-[#001D39]">
                    <p className="flex items-center justify-between gap-4 py-3">
                      <span>Status</span>
                      <span className="inline-flex h-6 w-[63px] items-center justify-center rounded-full bg-[#E7F7EE] text-[10px] font-medium text-[#22C55E]">
                        {formatValue(job.status, "Active")}
                      </span>
                    </p>

                    {hasMatchScore && !isOwnPostedJob ? (
                      <p className="flex items-center justify-between gap-4 py-3">
                        <span>Your match</span>
                        <span className="text-right font-semibold text-[#001D39]">
                          {job.match_score}% · {job.match_label || "Match"}
                        </span>
                      </p>
                    ) : null}

                    <p className="flex h-[42px] items-center justify-between gap-4">
                      <span>Work mode</span>
                      <span className="text-right text-[#001D39]">
                        {formatValue(job.work_mode, "Not added")}
                      </span>
                    </p>

                    <p className="flex h-[42px] items-center justify-between gap-4">
                      <span>Job type</span>
                      <span className="text-right text-[#001D39]">
                        {formatValue(job.job_type, "Not added")}
                      </span>
                    </p>

                    <p className="flex h-[42px] items-center justify-between gap-4">
                      <span>Questions</span>
                      <span className="text-right text-[#001D39]">
                        {questions.length}
                      </span>
                    </p>

                    <p className="flex h-[42px] items-center justify-between gap-4">
                      <span>Salary</span>
                      <span className="text-right text-[#001D39]">
                        {formatSalary(job)}
                      </span>
                    </p>

                    {isOwnPostedJob ? (
                      <p className="flex items-center justify-between gap-4 py-3">
                        <span>Access</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          Owner view
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <ApplyButton
                    isPreparingApply={isPreparingApply}
                    isOwnPostedJob={isOwnPostedJob}
                    onClick={handleApplyClick}
                    fullWidth
                    className="mt-auto !h-[47px] !rounded-lg"
                  />
                </div>

                <div className="h-auto rounded-xl border border-[#E0DEE6] bg-[#F9FBFB] px-6 py-8 shadow-sm max-md:px-5 max-md:py-6 lg:h-[202px]">
                  <div className="flex items-center gap-4">
                    <ButterflyLogo className="h-12 w-12 shrink-0" />

                    <div>
                      <p className="text-base font-semibold text-[#001D39]">
                        {companyName}
                      </p>
                      <p className="text-sm font-medium text-[#8B8993]">
                        Hiring through AccDoo
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 text-sm font-normal leading-5 text-[#001D39]">
                    {isOwnPostedJob
                      ? "This public page is shown as a preview because you are the recruiter who posted it."
                      : "This recruiter is managing active openings through AccDoo. Your application will appear in their ATS pipeline after submission."}
                  </p>
                </div>

                <div
                  className={`h-auto rounded-xl border px-4 py-7 shadow-sm max-md:px-5 max-md:py-6 lg:h-[156px] ${
                    isOwnPostedJob
                      ? "border-slate-200 bg-slate-50"
                      : "border-[#DCE7FB] bg-[#F5F8FE]"
                  }`}
                >
                  <p className="flex items-center gap-3 text-sm font-semibold text-[#0152A4]">
                    {isOwnPostedJob ? (
                      <FiUser className="text-slate-500" />
                    ) : (
                      <RocketIcon className="text-[#0152A4]" />
                    )}
                    {isOwnPostedJob ? "Recruiter note" : "Candidate tip"}
                  </p>

                  <p className="mt-4 text-sm font-normal leading-5 text-[#001D39]">
                    {isOwnPostedJob
                      ? "To test candidate application flow, logout and login with a different candidate account."
                      : hasMatchScore
                      ? "This match score is calculated from your saved skills and the recruiter’s required job skills."
                      : "Complete your profile before applying. A valid phone number, role, skills, and CV help recruiters review you faster."}
                  </p>
                </div>
              </aside>
            </div>
            </div>
          </>
        ) : null}
      </section>

      <ApplyJobModal
        job={job}
        questions={questions}
        candidateProfile={candidateProfile}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmitted={() => setApplyStatusMessage("")}
      />

      <Footer />
    </main>
  );
}
