"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiFileText,
  FiFilter,
  FiLoader,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import SecureCvButton from "@/components/common/SecureCvButton";
import RecruiterShell from "@/components/recruiter/RecruiterShell";
import {
  listRecruiterApplications,
  updateRecruiterApplicationStatus,
} from "@/lib/api/applicationsApi";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Screening", value: "screening" },
  { label: "Qualified", value: "qualified" },
  { label: "Interview", value: "interview" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Offer", value: "offer" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

const MOVE_STATUS_OPTIONS = [
  { label: "Applied", value: "applied" },
  { label: "Screening", value: "screening" },
  { label: "Qualified", value: "qualified" },
  { label: "Interview", value: "interview" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Offer", value: "offer" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_STYLES = {
  applied: "bg-orange-50 text-[#F7631E]",
  screening: "bg-blue-50 text-blue-700",
  qualified: "bg-purple-50 text-purple-700",
  interview: "bg-sky-50 text-sky-700",
  shortlisted: "bg-amber-50 text-amber-700",
  offer: "bg-yellow-50 text-yellow-700",
  hired: "bg-[#EAF5F1] text-[#2E8D76]",
  rejected: "bg-red-50 text-red-700",
  screening_disqualified: "bg-red-50 text-red-700",
  offer_declined: "bg-red-50 text-red-700",
};

function getStatusLabel(status) {
  return (
    MOVE_STATUS_OPTIONS.find((option) => option.value === status)?.label ||
    status ||
    "Applied"
  );
}

function getStatusStyle(status) {
  return STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
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

function getCandidateName(candidate) {
  return candidate?.name || "Candidate";
}

function getCandidateInitial(candidate) {
  const name = getCandidateName(candidate);
  return name.trim().charAt(0).toUpperCase() || "C";
}

function getCandidateCvUrl(application) {
  return application?.candidate?.cv_url || application?.cv_url || "";
}

function CandidateCard({ application, isBusy, onMoveStatus }) {
  const candidate = application?.candidate || {};
  const job = application?.job || {};
  const cvUrl = getCandidateCvUrl(application);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/50">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EAF5F1] text-lg font-semibold text-[#2E8D76]">
            {getCandidateInitial(candidate)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-[#0F172A]">
                {getCandidateName(candidate)}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                  application.status
                )}`}
              >
                {getStatusLabel(application.status)}
              </span>
            </div>

            <p className="mt-1 break-all text-sm font-normal text-[#667085]">
              {candidate.email || "Email not available"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F8FAFA] px-3 py-1 text-xs font-normal text-[#667085]">
                {candidate.current_role || "Role not added"}
              </span>

              <span className="rounded-full bg-[#F8FAFA] px-3 py-1 text-xs font-normal text-[#667085]">
                {candidate.location || "Location not added"}
              </span>

              <span className="rounded-full bg-[#F8FAFA] px-3 py-1 text-xs font-normal text-[#667085]">
                {candidate.experience_years || 0} years exp
              </span>

              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-normal text-[#F7631E]">
                Strength {candidate.profile_strength || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="rounded-xl bg-[#F8FAFA] px-4 py-3 xl:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
              Applied for
            </p>

            <p className="mt-1 text-sm font-semibold text-[#0F172A]">
              {job.title || "Job not available"}
            </p>

            <p className="mt-1 text-xs font-normal text-[#667085]">
              {job.company_name || "Company"} ·{" "}
              {formatDate(application.applied_at)}
            </p>
          </div>

          <select
            value={application.status || "applied"}
            disabled={isBusy}
            onChange={(event) =>
              onMoveStatus(application.id, event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#0F172A] outline-none transition focus:border-[#2E8D76] focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {MOVE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Move to {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {application.cover_note ? (
        <p className="mt-4 rounded-xl bg-[#F8FAFA] px-4 py-3 text-sm font-normal leading-6 text-[#667085]">
          {application.cover_note}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {cvUrl ? (
          <SecureCvButton
            cvUrl={cvUrl}
            label="View CV"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#667085] transition hover:border-[#2E8D76] hover:text-[#2E8D76]"
          />
        ) : (
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-normal text-slate-400">
            <FiFileText />
            CV not attached
          </span>
        )}

        {job.id ? (
          <Link
            href={`/recruiter/jobs/${job.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#667085] transition hover:border-[#2E8D76] hover:text-[#2E8D76]"
          >
            <FiBriefcase />
            Job workspace
          </Link>
        ) : null}

        {job.id ? (
          <Link
            href={`/recruiter/jobs/${job.id}/pipeline`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2E8D76] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#23725f]"
          >
            ATS pipeline
          </Link>
        ) : null}
      </div>

      {candidate.skills ? (
        <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-xs font-normal leading-5 text-[#F7631E]">
          Skills: {candidate.skills}
        </p>
      ) : null}
    </article>
  );
}

export default function RecruiterCandidatesView() {
  const [applications, setApplications] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyApplicationId, setBusyApplicationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadApplications({ showSuccessMessage = false } = {}) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsLoading(true);

      const data = await listRecruiterApplications();

      setApplications(Array.isArray(data) ? data : []);

      if (showSuccessMessage) {
        setStatusMessage("Candidates refreshed.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not load candidates.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleMoveStatus(applicationId, nextStatus) {
    setErrorMessage("");
    setStatusMessage("");

    if (!applicationId || !nextStatus) {
      setErrorMessage("Application or status is missing.");
      return;
    }

    try {
      setBusyApplicationId(applicationId);

      await updateRecruiterApplicationStatus(applicationId, {
        status: nextStatus,
        note: `Moved to ${nextStatus} from candidates page.`,
      });

      setStatusMessage("Candidate status updated.");
      await loadApplications();
    } catch (error) {
      setErrorMessage(error.message || "Could not update candidate status.");
    } finally {
      setBusyApplicationId(null);
    }
  }

  const filteredApplications = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();

    return applications.filter((application) => {
      const candidate = application?.candidate || {};
      const job = application?.job || {};

      const matchesStatus =
        activeStatus === "all" || application.status === activeStatus;

      const searchableText = [
        candidate.name,
        candidate.email,
        candidate.skills,
        candidate.current_role,
        candidate.location,
        job.title,
        job.company_name,
        application.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !lowerSearch || searchableText.includes(lowerSearch);

      return matchesStatus && matchesSearch;
    });
  }, [applications, activeStatus, searchTerm]);

  const stats = useMemo(() => {
    return [
      {
        label: "Total candidates",
        value: applications.length,
      },
      {
        label: "Screening",
        value: applications.filter((item) => item.status === "screening")
          .length,
      },
      {
        label: "Interviews",
        value: applications.filter((item) => item.status === "interview")
          .length,
      },
      {
        label: "Hired",
        value: applications.filter((item) => item.status === "hired").length,
      },
    ];
  }, [applications]);

  return (
    <RecruiterShell>
      <section>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F7631E]">
              Hire
            </p>

            <h1 className="mt-3 text-[34px] font-semibold tracking-tight text-[#0F172A] md:text-[42px]">
              Candidates
            </h1>

            <p className="mt-3 max-w-3xl text-sm font-normal leading-6 text-[#667085]">
              Manage every applicant across your jobs, update ATS status, and
              open candidate CVs through the secure preview flow.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadApplications({ showSuccessMessage: true })}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#667085] shadow-sm transition hover:border-[#2E8D76] hover:text-[#2E8D76] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
            Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98A2B3]">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-semibold text-[#0F172A]">
                {isLoading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search candidates, jobs, skills..."
                className="w-full rounded-xl border border-slate-200 bg-[#F8FAFA] py-3 pl-11 pr-4 text-sm font-normal text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2E8D76] focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = activeStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveStatus(option.value)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-normal transition ${
                      isSelected
                        ? "bg-[#F7631E] text-white"
                        : "text-[#667085] hover:bg-orange-50 hover:text-[#F7631E]"
                    }`}
                  >
                    {option.value === "all" ? <FiFilter size={14} /> : null}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
            {errorMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-[#667085]">
              Loading candidates...
            </div>
          ) : filteredApplications.length ? (
            filteredApplications.map((application) => (
              <CandidateCard
                key={application.id}
                application={application}
                isBusy={busyApplicationId === application.id}
                onMoveStatus={handleMoveStatus}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#EAF5F1] text-[#2E8D76]">
                <FiUsers size={26} />
              </div>

              <p className="mt-5 text-base font-semibold text-[#0F172A]">
                No candidates found.
              </p>

              <p className="mx-auto mt-2 max-w-xl text-sm font-normal leading-6 text-[#667085]">
                Candidate applications will appear here after users apply to your
                active jobs.
              </p>
            </div>
          )}
        </div>
      </section>
    </RecruiterShell>
  );
}