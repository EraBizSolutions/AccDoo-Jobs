"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiInfo,
  FiLoader,
  FiMapPin,
  FiSend,
  FiShare2,
  FiUser,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { LuSparkles } from "react-icons/lu";

import MatchBadge from "@/components/common/MatchBadge";
import ApplyJobModal from "@/components/candidate/ApplyJobModal";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
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

function DetailMeta({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-normal text-[#585958]">
      {icon}
      {children}
    </span>
  );
}

function SalaryMeta({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-normal text-[#585958]">
      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-[#F7631E]">
        LKR
      </span>
      {children}
    </span>
  );
}

function JobSection({ title, paragraph, items }) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="mt-7">
      <h2 className="text-[24px] font-medium tracking-tight text-[#202020]">
        {title}
      </h2>

      {paragraph ? (
        <p className="mt-3 max-w-4xl whitespace-pre-line text-[15px] font-normal leading-7 text-[#202020]">
          {paragraph}
        </p>
      ) : null}

      {safeItems.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-6 text-[15px] font-normal leading-7 text-[#585958]">
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
      className={`rounded-3xl border p-6 ${
        isOwnPostedJob
          ? "border-slate-200 bg-slate-50"
          : profileIsComplete && hasBackendMatch
          ? "border-orange-100 bg-orange-50"
          : profileIsComplete
          ? "border-emerald-100 bg-emerald-50"
          : "border-yellow-200 bg-yellow-50"
      }`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div
          className={`grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 bg-white text-center ${
            isOwnPostedJob
              ? "border-slate-300"
              : profileIsComplete && hasBackendMatch
              ? "border-[#F7631E]"
              : profileIsComplete
              ? "border-emerald-500"
              : "border-yellow-400"
          }`}
        >
          <div>
            <p
              className={`text-2xl font-medium ${
                isOwnPostedJob
                  ? "text-slate-500"
                  : profileIsComplete && hasBackendMatch
                  ? "text-[#F7631E]"
                  : profileIsComplete
                  ? "text-emerald-700"
                  : "text-yellow-700"
              }`}
            >
              {isOwnPostedJob ? "Owner" : hasBackendMatch ? `${matchScore}%` : "Ready"}
            </p>

            <p
              className={`text-[10px] font-medium uppercase tracking-wide ${
                isOwnPostedJob
                  ? "text-slate-500"
                  : profileIsComplete && hasBackendMatch
                  ? "text-[#F7631E]"
                  : profileIsComplete
                  ? "text-emerald-700"
                  : "text-yellow-700"
              }`}
            >
              {isOwnPostedJob ? "posted" : hasBackendMatch ? "match" : "profile"}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-2 text-lg font-medium text-[#202020]">
              {isOwnPostedJob ? (
                <FiInfo className="text-slate-500" />
              ) : profileIsComplete && hasBackendMatch ? (
                <LuSparkles className="text-[#F7631E]" />
              ) : profileIsComplete ? (
                <LuSparkles className="text-emerald-700" />
              ) : (
                <FiAlertCircle className="text-yellow-700" />
              )}

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

          <p className="mt-2 text-sm font-normal leading-6 text-[#585958]">
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
            <ul className="mt-4 space-y-2 text-xs font-normal text-yellow-800">
              {completionIssues.slice(0, 5).map((issue) => (
                <li key={issue}>• {issue}</li>
              ))}
            </ul>
          ) : null}

          {!isOwnPostedJob && hasBackendMatch ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white px-4 py-3">
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

              <div className="rounded-2xl border border-white/70 bg-white px-4 py-3">
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
                      : "bg-white text-[#F7631E]"
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300 ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {isPreparingApply ? <FiLoader className="animate-spin" /> : <FiSend />}
      {isPreparingApply ? "Checking profile..." : "Apply now"}
    </button>
  );
}

export default function PublicJobDetailsView() {
  const params = useParams();
  const router = useRouter();

  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreparingApply, setIsPreparingApply] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [applyStatusMessage, setApplyStatusMessage] = useState("");
  const [applyStatusType, setApplyStatusType] = useState("error");

  const companyName = job?.company_name || "AccDoo Company";
  const companyInitials = getCompanyInitials(companyName);
  const skills = getSkillTags(job?.required_skills);
  const sections = buildDescriptionSections(job?.description);
  const fullJobUrl = `${getAppBaseUrl()}/jobs/${jobId}`;

  const isOwnPostedJob =
    Boolean(currentUser?.id) &&
    Boolean(job?.recruiter_user_id) &&
    Number(currentUser.id) === Number(job.recruiter_user_id);

  const hasMatchScore =
    job?.match_score !== null && job?.match_score !== undefined;

  useEffect(() => {
    const storedUser = getStoredUser();
    setCurrentUser(storedUser);

    async function loadJobPageData() {
      setErrorMessage("");

      try {
        const [jobData, questionData] = await Promise.all([
          getPublicJobDetails(jobId),
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
  }, [jobId]);

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

      <section className="mx-auto max-w-7xl px-5 py-8 lg:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-normal text-[#F7631E] transition hover:text-[#e85512]"
        >
          <FiArrowLeft />
          Back to jobs
        </Link>

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F9FBFB] p-8 text-sm font-normal text-[#585958]">
            Loading job details...
          </div>
        ) : errorMessage ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8">
            <p className="text-sm font-normal text-red-600">{errorMessage}</p>

            <Link
              href="/"
              className="mt-4 inline-flex rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white"
            >
              Go back home
            </Link>
          </div>
        ) : job ? (
          <>
            <section className="mt-8 border-b border-slate-200 pb-9">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-5">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#202020] text-lg font-medium text-[#F7631E]">
                    {companyInitials}
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-normal text-[#F7631E]">
                        <LuSparkles size={14} />
                        AccDoo verified role
                      </div>

                      {hasMatchScore && !isOwnPostedJob ? (
                        <MatchBadge
                          score={job.match_score}
                          label={job.match_label}
                        />
                      ) : null}

                      {isOwnPostedJob ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          <FiBriefcase size={14} />
                          Your posted job
                        </div>
                      ) : null}
                    </div>

                    <h1 className="mt-3 text-[36px] font-medium tracking-tight text-[#202020] md:text-[44px]">
                      {job.title || "Untitled role"}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-lg font-normal text-[#F7631E]">
                        {companyName}
                      </p>
                      <MdVerified className="text-[#2b7a66]" size={18} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
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

                <div className="flex flex-wrap gap-3">
                  <ApplyButton
                    isPreparingApply={isPreparingApply}
                    isOwnPostedJob={isOwnPostedJob}
                    onClick={handleApplyClick}
                    className={isOwnPostedJob ? "hover:cursor-not-allowed" : ""}
                  />

                  <button
                    type="button"
                    onClick={handleShareJob}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
                  >
                    {shareStatus === "Link copied" || shareStatus === "Shared" ? (
                      <FiCheck />
                    ) : (
                      <FiShare2 />
                    )}
                    {shareStatus || "Share"}
                  </button>
                </div>
              </div>

              {applyStatusMessage ? (
                <p
                  className={`mt-6 rounded-xl border px-4 py-3 text-sm font-normal ${getApplyStatusClass()}`}
                >
                  {applyStatusMessage}
                </p>
              ) : null}
            </section>

            <div className="grid gap-10 py-9 lg:grid-cols-[1fr_340px]">
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
                  <section className="mt-7">
                    <h2 className="text-[24px] font-medium tracking-tight text-[#202020]">
                      Skills
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-slate-200 bg-[#F9FBFB] px-4 py-2 text-sm font-normal text-[#585958]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="mt-8 border-t border-slate-200 pt-7">
                  <h2 className="text-[24px] font-medium tracking-tight text-[#202020]">
                    Apply
                  </h2>

                  <p className="mt-2 text-sm font-normal text-[#585958]">
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

              <aside className="space-y-5">
                <div className="sticky top-24 rounded-3xl border border-slate-200 bg-[#F9FBFB] p-6">
                  <p className="text-xs font-normal uppercase tracking-[0.2em] text-[#F7631E]">
                    Quick facts
                  </p>

                  <div className="mt-5 space-y-4 text-sm font-normal text-[#585958]">
                    <p className="flex items-center justify-between gap-4">
                      <span>Status</span>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
                        {job.status || "active"}
                      </span>
                    </p>

                    {hasMatchScore && !isOwnPostedJob ? (
                      <p className="flex items-center justify-between gap-4">
                        <span>Your match</span>
                        <span className="text-right font-medium text-[#F7631E]">
                          {job.match_score}% · {job.match_label || "Match"}
                        </span>
                      </p>
                    ) : null}

                    <p className="flex items-center justify-between gap-4">
                      <span>Work mode</span>
                      <span>{formatValue(job.work_mode, "Not added")}</span>
                    </p>

                    <p className="flex items-center justify-between gap-4">
                      <span>Job type</span>
                      <span>{formatValue(job.job_type, "Not added")}</span>
                    </p>

                    <p className="flex items-center justify-between gap-4">
                      <span>Questions</span>
                      <span>{questions.length}</span>
                    </p>

                    <p className="flex items-center justify-between gap-4">
                      <span>Salary</span>
                      <span className="text-right">{formatSalary(job)}</span>
                    </p>

                    {isOwnPostedJob ? (
                      <p className="flex items-center justify-between gap-4">
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
                    className="mt-6"
                  />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#202020] text-sm font-medium text-[#F7631E]">
                      {companyInitials}
                    </div>

                    <div>
                      <p className="text-base font-medium text-[#202020]">
                        {companyName}
                      </p>
                      <p className="text-sm font-normal text-[#585958]">
                        Hiring through AccDoo
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-normal leading-6 text-[#585958]">
                    {isOwnPostedJob
                      ? "This public page is shown as a preview because you are the recruiter who posted it."
                      : "This recruiter is managing active openings through AccDoo. Your application will appear in their ATS pipeline after submission."}
                  </p>
                </div>

                <div
                  className={`rounded-3xl border p-6 ${
                    isOwnPostedJob
                      ? "border-slate-200 bg-slate-50"
                      : "border-orange-100 bg-orange-50"
                  }`}
                >
                  <p className="flex items-center gap-2 text-base font-medium text-[#202020]">
                    <FiUser
                      className={isOwnPostedJob ? "text-slate-500" : "text-[#F7631E]"}
                    />
                    {isOwnPostedJob ? "Recruiter note" : "Candidate tip"}
                  </p>

                  <p className="mt-2 text-sm font-normal leading-6 text-[#585958]">
                    {isOwnPostedJob
                      ? "To test candidate application flow, logout and login with a different candidate account."
                      : hasMatchScore
                      ? "This match score is calculated from your saved skills and the recruiter’s required job skills."
                      : "Complete your profile before applying. A valid phone number, role, skills, and CV help recruiters review you faster."}
                  </p>
                </div>
              </aside>
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