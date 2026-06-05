"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  FiBriefcase,
  FiExternalLink,
  FiFileText,
  FiGitBranch,
  FiLoader,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";

import RecruiterShell from "@/components/recruiter/RecruiterShell";
import { updateRecruiterApplicationStatus } from "@/lib/api/applicationsApi";
import { getRecruiterJobAtsPipeline } from "@/lib/api/recruiterApi";

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

const COLUMN_TONES = {
  applied: "border-orange-100 bg-orange-50/40",
  screening: "border-blue-100 bg-blue-50/40",
  qualified: "border-purple-100 bg-purple-50/40",
  screening_disqualified: "border-red-100 bg-red-50/40",
  interview: "border-sky-100 bg-sky-50/40",
  shortlisted: "border-amber-100 bg-amber-50/40",
  offer: "border-yellow-100 bg-yellow-50/40",
  hired: "border-emerald-100 bg-emerald-50/40",
  offer_declined: "border-red-100 bg-red-50/40",
  rejected: "border-red-100 bg-red-50/40",
};

function getColumnTone(status) {
  return COLUMN_TONES[status] || "border-slate-100 bg-slate-50";
}

function formatDate(dateValue) {
  if (!dateValue) return "Date not available";

  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(dateValue));
  } catch {
    return "Date not available";
  }
}

function CandidateCard({ application, onDragStart, onStatusChange, isBusy }) {
  const candidate = application.candidate || {};

  return (
    <article
      draggable={!isBusy}
      onDragStart={(event) => onDragStart(event, application.id)}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isBusy ? "cursor-not-allowed opacity-60" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF5F1] text-[#2E8D76]">
          <FiUser size={18} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#0F172A]">
            {candidate.name || "Candidate"}
          </p>
          <p className="mt-1 truncate text-xs font-normal text-[#667085]">
            {candidate.email || "Email not available"}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-xs font-normal text-[#667085]">
        <p>{candidate.current_role || "Current role not added"}</p>
        <p>{candidate.location || "Location not added"}</p>
        <p>Applied {formatDate(application.applied_at)}</p>
      </div>

      {candidate.skills ? (
        <p className="mt-3 line-clamp-2 rounded-lg bg-[#F8FAFA] px-3 py-2 text-xs font-normal leading-5 text-[#667085]">
          {candidate.skills}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {application.cv_url ? (
          <a
            href={application.cv_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#667085] transition hover:border-[#2E8D76] hover:text-[#2E8D76]"
          >
            <FiFileText />
            CV
            <FiExternalLink size={12} />
          </a>
        ) : null}
      </div>

      <select
        value={application.status}
        disabled={isBusy}
        onChange={(event) => onStatusChange(application.id, event.target.value)}
        className="mt-3 w-full rounded-lg border border-slate-200 bg-[#F8FAFA] px-3 py-2 text-xs font-normal text-[#0F172A] outline-none transition focus:border-[#2E8D76] focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Move to {option.label}
          </option>
        ))}
      </select>
    </article>
  );
}

function PipelineColumn({
  column,
  onDropApplication,
  onDragOver,
  onDragStart,
  onStatusChange,
  busyApplicationId,
}) {
  const applications = column.applications || [];

  return (
    <section
      onDrop={(event) => onDropApplication(event, column.status)}
      onDragOver={onDragOver}
      className={`flex min-h-[590px] w-[300px] shrink-0 flex-col rounded-xl border p-4 ${getColumnTone(
        column.status
      )}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2E8D76]" />
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A]">
              {column.label}
            </h2>
            <p className="mt-0.5 text-xs font-normal text-[#667085]">
              {applications.length} candidate{applications.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <span className="grid h-7 min-w-7 place-items-center rounded-md bg-white px-2 text-xs font-semibold text-[#667085] shadow-sm">
          {applications.length}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {applications.length ? (
          applications.map((application) => (
            <CandidateCard
              key={application.id}
              application={application}
              onDragStart={onDragStart}
              onStatusChange={onStatusChange}
              isBusy={busyApplicationId === application.id}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-5 text-center">
            <FiUser className="mx-auto text-slate-300" size={22} />
            <p className="mt-3 text-xs font-normal leading-5 text-[#667085]">
              Drop candidates here or move them using the card selector.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function RecruiterAtsPipelineView() {
  const params = useParams();
  const jobId = params.jobId;

  const [pipeline, setPipeline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyApplicationId, setBusyApplicationId] = useState(null);
  const [draggedApplicationId, setDraggedApplicationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadPipeline({ showSuccessMessage = false } = {}) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsLoading(true);
      const data = await getRecruiterJobAtsPipeline(jobId);
      setPipeline(data);

      if (showSuccessMessage) {
        setStatusMessage("Pipeline refreshed.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not load ATS pipeline.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (jobId) {
      loadPipeline();
    }
  }, [jobId]);

  const totalApplications = useMemo(() => {
    return (pipeline?.columns || []).reduce(
      (total, column) => total + (column.applications?.length || 0),
      0
    );
  }, [pipeline]);

  function handleDragStart(event, applicationId) {
    event.dataTransfer.setData("applicationId", String(applicationId));
    setDraggedApplicationId(applicationId);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  async function moveApplication(applicationId, nextStatus) {
    if (!applicationId || !nextStatus) return;

    setErrorMessage("");
    setStatusMessage("");

    try {
      setBusyApplicationId(Number(applicationId));

      await updateRecruiterApplicationStatus(applicationId, {
        status: nextStatus,
        note: `Moved to ${nextStatus} from ATS pipeline.`,
      });

      setStatusMessage("Candidate moved successfully.");
      await loadPipeline();
    } catch (error) {
      setErrorMessage(error.message || "Could not move candidate.");
    } finally {
      setBusyApplicationId(null);
      setDraggedApplicationId(null);
    }
  }

  async function handleDropApplication(event, nextStatus) {
    event.preventDefault();

    const applicationId =
      event.dataTransfer.getData("applicationId") || draggedApplicationId;

    await moveApplication(applicationId, nextStatus);
  }

  return (
    <RecruiterShell>
      <section>
        <div className="mb-5 text-xs font-normal text-[#98A2B3]">
          Jobs / {pipeline?.job?.title || "Pipeline"} / Hiring pipeline
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-[#EAF5F1] px-3 py-1 text-xs font-semibold text-[#2E8D76]">
                <FiGitBranch />
                Hiring pipeline
              </div>

              <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-[#0F172A]">
                {pipeline?.job?.title || "ATS pipeline"}
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-normal leading-6 text-[#667085]">
                Drag candidates across stages or use the dropdown inside each card.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/recruiter/jobs/${jobId}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-normal text-[#667085] transition hover:border-[#2E8D76] hover:text-[#2E8D76]"
              >
                <FiBriefcase />
                Job details
              </Link>

              <button
                type="button"
                onClick={() => loadPipeline({ showSuccessMessage: true })}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2E8D76] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#23725f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFA] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98A2B3]">
                Total candidates
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#0F172A]">
                {isLoading ? "..." : totalApplications}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#F8FAFA] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98A2B3]">
                Pipeline stages
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#0F172A]">
                {isLoading ? "..." : pipeline?.columns?.length || 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#F8FAFA] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98A2B3]">
                Company
              </p>
              <p className="mt-3 line-clamp-1 text-xl font-semibold text-[#0F172A]">
                {pipeline?.job?.company_name || "Not loaded"}
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F7631E]">
                Board mode
              </p>
              <p className="mt-3 text-xl font-semibold text-[#0F172A]">
                Drag & Drop
              </p>
            </div>
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

        <div className="mt-7 overflow-x-auto pb-6">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm font-normal text-[#667085]">
              Loading ATS pipeline...
            </div>
          ) : pipeline?.columns?.length ? (
            <div className="flex min-w-max gap-4">
              {pipeline.columns.map((column) => (
                <PipelineColumn
                  key={column.status}
                  column={column}
                  onDropApplication={handleDropApplication}
                  onDragOver={handleDragOver}
                  onDragStart={handleDragStart}
                  onStatusChange={moveApplication}
                  busyApplicationId={busyApplicationId}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <FiGitBranch className="mx-auto text-[#2E8D76]" size={30} />
              <p className="mt-4 text-base font-semibold text-[#0F172A]">
                Pipeline is empty.
              </p>
              <p className="mt-2 text-sm font-normal text-[#667085]">
                Candidate cards will appear here after applications are submitted.
              </p>
            </div>
          )}
        </div>
      </section>
    </RecruiterShell>
  );
}