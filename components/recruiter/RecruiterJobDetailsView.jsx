"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FiBriefcase,
  FiEdit3,
  FiEye,
  FiFileText,
  FiGitBranch,
  FiLoader,
  FiMapPin,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";

import JobQuestionsManager from "@/components/recruiter/JobQuestionsManager";
import RecruiterJobApplicationsPanel from "@/components/recruiter/RecruiterJobApplicationsPanel";
import RecruiterShell from "@/components/recruiter/RecruiterShell";
import {
  closeRecruiterJob,
  getRecruiterJob,
  updateRecruiterJob,
} from "@/lib/api/recruiterApi";
import { listRecruiterJobApplications } from "@/lib/api/applicationsApi";

const TABS = [
  { label: "Details", value: "details" },
  { label: "Custom questions", value: "questions" },
  { label: "Candidates", value: "candidates" },
];

function getStatusClass(status) {
  if (status === "active") return "bg-[#EAF5F1] text-[#2E8D76]";
  if (status === "draft") return "bg-yellow-50 text-yellow-700";
  if (status === "closed") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}

function formatValue(value, fallback = "Not added") {
  if (!value) return fallback;

  return String(value)
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join("-");
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

function formatDate(dateValue) {
  if (!dateValue) return "Date not available";

  try {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(dateValue));
  } catch {
    return "Date not available";
  }
}

function getSkills(requiredSkills) {
  if (!requiredSkills) return [];

  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[#2E8D76]">{icon}</span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">
            {label}
          </p>
          <p className="mt-1 text-sm font-normal leading-6 text-[#0F172A]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SalaryBadge() {
  return (
    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-[#F7631E]">
      LKR
    </span>
  );
}

function JobDetailsTab({ job, applicationsCount }) {
  const skills = getSkills(job.required_skills);

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#98A2B3]">
            Candidates
          </p>
          <p className="mt-3 text-3xl font-semibold text-[#0F172A]">
            {applicationsCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#98A2B3]">
            Status
          </p>
          <p className="mt-3 text-3xl font-semibold text-[#0F172A] capitalize">
            {job.status}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#98A2B3]">
            Type
          </p>
          <p className="mt-3 text-2xl font-semibold text-[#0F172A]">
            {formatValue(job.job_type)}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#F7631E]">
            ATS
          </p>
          <p className="mt-3 text-2xl font-semibold text-[#0F172A]">Ready</p>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-[#0F172A]">Role Overview</h2>

        <p className="mt-4 whitespace-pre-line text-sm font-normal leading-7 text-[#667085]">
          {job.description || "Description not added."}
        </p>

        <h2 className="mt-7 text-xl font-semibold text-[#0F172A]">
          Requirements
        </h2>

        {skills.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-slate-200 bg-[#F8FAFA] px-3 py-1 text-xs font-normal text-[#667085]"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm font-normal text-[#667085]">
            Skills not added.
          </p>
        )}

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <DetailItem
            icon={<FiBriefcase />}
            label="Company"
            value={job.company_name || "Company not added"}
          />

          <DetailItem
            icon={<FiMapPin />}
            label="Location"
            value={job.location || "Location not added"}
          />

          <DetailItem
            icon={<FiFileText />}
            label="Work mode"
            value={formatValue(job.work_mode)}
          />

          <DetailItem
            icon={<SalaryBadge />}
            label="Salary"
            value={formatSalary(job)}
          />

          <DetailItem
            icon={<FiFileText />}
            label="Created"
            value={formatDate(job.created_at)}
          />

          <DetailItem
            icon={<FiEye />}
            label="Public preview"
            value={`Available at /jobs/${job.id}`}
          />
        </div>
      </div>
    </section>
  );
}

export default function RecruiterJobDetailsView() {
  const params = useParams();
  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadJobDetails({ showSuccessMessage = false } = {}) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsLoading(true);

      const [jobData, applicationsData] = await Promise.all([
        getRecruiterJob(jobId),
        listRecruiterJobApplications(jobId).catch(() => []),
      ]);

      setJob(jobData);
      setApplicationsCount(
        Array.isArray(applicationsData) ? applicationsData.length : 0
      );

      if (showSuccessMessage) {
        setStatusMessage("Job details refreshed.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not load job details.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  async function changeJobStatus(nextStatus) {
    if (!job) return;

    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsUpdatingStatus(true);

      const updatedJob = await updateRecruiterJob(job.id, {
        status: nextStatus,
      });

      setJob(updatedJob);
      setStatusMessage(`Job moved to ${nextStatus}.`);
    } catch (error) {
      setErrorMessage(error.message || "Could not update job status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function closeJob() {
    if (!job) return;

    const confirmed = window.confirm(
      "This will mark the job as closed. Continue?"
    );

    if (!confirmed) return;

    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsUpdatingStatus(true);
      const closedJob = await closeRecruiterJob(job.id);
      setJob(closedJob);
      setStatusMessage("Job closed successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Could not close job.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <RecruiterShell>
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm font-normal text-[#667085]">
          Loading job workspace...
        </div>
      ) : errorMessage && !job ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <p className="text-sm font-normal text-red-600">{errorMessage}</p>
          <button
            type="button"
            onClick={() => loadJobDetails()}
            className="mt-4 rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      ) : job ? (
        <section>
          <div className="mb-5 text-xs font-normal text-[#98A2B3]">
            Jobs / {job.title}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[28px] font-semibold tracking-tight text-[#0F172A]">
                    {job.title || "Untitled role"}
                  </h1>

                  <span
                    className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>
                </div>

                <p className="mt-3 text-sm font-normal text-[#667085]">
                  {formatValue(job.job_type)} · {formatValue(job.work_mode)} ·{" "}
                  {job.location || "Location not added"} · {formatSalary(job)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#667085] transition hover:border-[#2E8D76] hover:text-[#2E8D76]"
                >
                  <FiEye />
                  Preview
                </Link>

                <Link
                  href={`/recruiter/jobs/${job.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#667085] transition hover:border-[#F7631E] hover:text-[#F7631E]"
                >
                  <FiEdit3 />
                  Edit
                </Link>

                <Link
                  href={`/recruiter/jobs/${job.id}/pipeline`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2E8D76] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#23725f]"
                >
                  <FiGitBranch />
                  Go to hiring pipeline
                </Link>

                <button
                  type="button"
                  onClick={() => loadJobDetails({ showSuccessMessage: true })}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#667085] transition hover:border-[#2E8D76] hover:text-[#2E8D76]"
                >
                  <FiRefreshCw />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-slate-100 py-4">
              <p className="text-sm font-normal text-[#0F172A]">
                {applicationsCount} candidate
                {applicationsCount === 1 ? "" : "s"}
              </p>

              <Link
                href={`/recruiter/jobs/${job.id}/pipeline`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#2E8D76]"
              >
                Go to the hiring pipeline
                <FiGitBranch size={15} />
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {TABS.map((tab) => {
                const isSelected = activeTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`rounded-lg border px-4 py-2 text-sm font-normal transition ${
                      isSelected
                        ? "border-[#2E8D76] bg-[#EAF5F1] text-[#2E8D76]"
                        : "border-transparent text-[#2E8D76] hover:bg-[#EAF5F1]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => changeJobStatus("active")}
                disabled={isUpdatingStatus}
                className="rounded-xl bg-[#EAF5F1] px-4 py-2 text-xs font-normal text-[#2E8D76] disabled:opacity-60"
              >
                Set active
              </button>

              <button
                type="button"
                onClick={() => changeJobStatus("draft")}
                disabled={isUpdatingStatus}
                className="rounded-xl bg-yellow-50 px-4 py-2 text-xs font-normal text-yellow-700 disabled:opacity-60"
              >
                Set draft
              </button>

              <button
                type="button"
                onClick={closeJob}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-normal text-red-700 disabled:opacity-60"
              >
                {isUpdatingStatus ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiTrash2 />
                )}
                Close job
              </button>
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
              {errorMessage}
            </p>
          ) : null}

          {statusMessage ? (
            <p className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
              {statusMessage}
            </p>
          ) : null}

          <div className="mt-7">
            {activeTab === "details" ? (
              <JobDetailsTab job={job} applicationsCount={applicationsCount} />
            ) : null}

            {activeTab === "questions" ? (
              <JobQuestionsManager jobId={job.id} />
            ) : null}

            {activeTab === "candidates" ? (
              <RecruiterJobApplicationsPanel jobId={job.id} />
            ) : null}
          </div>
        </section>
      ) : null}
    </RecruiterShell>
  );
}