"use client";

import { useEffect, useState } from "react";
import {
  FiBriefcase,
  FiExternalLink,
  FiFileText,
  FiLoader,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";

import {
  listRecruiterJobApplications,
  updateRecruiterApplicationStatus,
} from "@/lib/api/applicationsApi";

const STATUS_OPTIONS = [
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
  qualified: "bg-emerald-50 text-emerald-700",
  interview: "bg-purple-50 text-purple-700",
  shortlisted: "bg-indigo-50 text-indigo-700",
  offer: "bg-yellow-50 text-yellow-700",
  hired: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  screening_disqualified: "bg-red-50 text-red-700",
  offer_declined: "bg-red-50 text-red-700",
};

function getStatusLabel(status) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ||
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

function CandidateInfo({ candidate }) {
  return (
    <div className="flex gap-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
        <FiUser size={20} />
      </div>

      <div>
        <p className="text-base font-medium text-[#202020]">
          {candidate?.name || "Candidate name not available"}
        </p>
        <p className="mt-1 text-sm font-normal text-[#585958]">
          {candidate?.email || "Email not available"}
        </p>

        <div className="mt-2 flex flex-wrap gap-2 text-xs font-normal text-[#585958]">
          {candidate?.current_role ? (
            <span className="rounded-full bg-white px-3 py-1">
              {candidate.current_role}
            </span>
          ) : null}

          {candidate?.location ? (
            <span className="rounded-full bg-white px-3 py-1">
              {candidate.location}
            </span>
          ) : null}

          <span className="rounded-full bg-white px-3 py-1">
            {candidate?.experience_years || 0} years exp
          </span>

          <span className="rounded-full bg-white px-3 py-1">
            Strength {candidate?.profile_strength || 0}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterJobApplicationsPanel({ jobId }) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyApplicationId, setBusyApplicationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadApplications({ showSuccessMessage = false } = {}) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsLoading(true);
      const data = await listRecruiterJobApplications(jobId);
      setApplications(Array.isArray(data) ? data : []);

      if (showSuccessMessage) {
        setStatusMessage("Applications refreshed.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not load job applications.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (jobId) {
      loadApplications();
    }
  }, [jobId]);

  async function handleStatusChange(applicationId, status) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setBusyApplicationId(applicationId);

      await updateRecruiterApplicationStatus(applicationId, {
        status,
        note: `Moved to ${status} from recruiter job detail page.`,
      });

      setStatusMessage("Candidate status updated successfully.");
      await loadApplications();
    } catch (error) {
      setErrorMessage(error.message || "Could not update candidate status.");
    } finally {
      setBusyApplicationId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-normal uppercase tracking-[0.2em] text-[#F7631E]">
            <FiBriefcase />
            Applications
          </p>

          <h2 className="mt-2 text-2xl font-medium tracking-tight text-[#202020]">
            Candidates for this job
          </h2>

          <p className="mt-2 max-w-2xl text-sm font-normal leading-6 text-[#585958]">
            Review candidates who applied and move them through the hiring stages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadApplications({ showSuccessMessage: true })}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
          Refresh
        </button>
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

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="rounded-2xl bg-[#F9FBFB] px-4 py-4 text-sm font-normal text-[#585958]">
            Loading applications...
          </p>
        ) : applications.length ? (
          applications.map((application) => {
            const candidate = application.candidate || {};
            const isBusy = busyApplicationId === application.id;

            return (
              <article
                key={application.id}
                className="rounded-2xl border border-slate-100 bg-[#F9FBFB] p-4"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <CandidateInfo candidate={candidate} />

                  <div className="flex flex-col gap-3 lg:items-end">
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-normal uppercase tracking-wide ${getStatusStyle(
                        application.status
                      )}`}
                    >
                      {getStatusLabel(application.status)}
                    </span>

                    <p className="text-xs font-normal text-[#585958]">
                      Applied {formatDate(application.applied_at)}
                    </p>

                    <select
                      value={application.status}
                      onChange={(event) =>
                        handleStatusChange(application.id, event.target.value)
                      }
                      disabled={isBusy}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#202020] outline-none transition focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          Move to {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {application.cover_note ? (
                  <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-normal leading-6 text-[#585958]">
                    {application.cover_note}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {application.cv_url ? (
                    <a
                      href={application.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
                    >
                      <FiFileText />
                      View CV
                      <FiExternalLink size={13} />
                    </a>
                  ) : null}

                  {candidate?.skills ? (
                    <span className="rounded-xl bg-white px-3 py-2 text-xs font-normal text-[#585958]">
                      Skills: {candidate.skills}
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F9FBFB] p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <FiUser size={24} />
            </div>
            <p className="mt-4 text-base font-medium text-[#202020]">
              No candidates yet.
            </p>
            <p className="mt-2 text-sm font-normal leading-6 text-[#585958]">
              When candidates apply, they will appear here and inside your ATS
              pipeline.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}