"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBriefcase,
  FiClock,
  FiFileText,
  FiLoader,
  FiMail,
  FiMapPin,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";

import SecureCvButton from "@/components/common/SecureCvButton";
import RecruiterShell from "@/components/recruiter/RecruiterShell";
import {
  listRecruiterJobApplications,
  updateRecruiterApplicationStatus,
} from "@/lib/api/applicationsApi";
import { getRecruiterJob } from "@/lib/api/recruiterApi";

const PIPELINE_COLUMNS = [
  { status: "applied", label: "Applied" },
  { status: "screening", label: "Screening" },
  { status: "qualified", label: "Qualified" },
  { status: "interview", label: "Interview" },
  { status: "shortlisted", label: "Shortlisted" },
  { status: "offer", label: "Offer" },
  { status: "hired", label: "Hired" },
  { status: "rejected", label: "Rejected" },
];

const STATUS_STYLES = {
  applied: "border-orange-100 bg-orange-50 text-[#F7631E]",
  screening: "border-blue-100 bg-blue-50 text-blue-700",
  qualified: "border-purple-100 bg-purple-50 text-purple-700",
  interview: "border-sky-100 bg-sky-50 text-sky-700",
  shortlisted: "border-amber-100 bg-amber-50 text-amber-700",
  offer: "border-yellow-100 bg-yellow-50 text-yellow-700",
  hired: "border-emerald-100 bg-[#EAF5F1] text-[#2E8D76]",
  rejected: "border-red-100 bg-red-50 text-red-700",
};

function formatDate(value) {
  if (!value) return "Date not available";

  try {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Date not available";
  }
}

function getCandidateName(candidate) {
  return candidate?.name || "Candidate";
}

function getCandidateInitial(candidate) {
  return getCandidateName(candidate).trim().charAt(0).toUpperCase() || "C";
}

function getCandidateCvUrl(application) {
  return application?.candidate?.cv_url || application?.cv_url || "";
}

function groupApplicationsByStatus(applications) {
  const groupedData = {};

  PIPELINE_COLUMNS.forEach((column) => {
    groupedData[column.status] = [];
  });

  applications.forEach((application) => {
    const status = application.status || "applied";

    if (!groupedData[status]) {
      groupedData[status] = [];
    }

    groupedData[status].push(application);
  });

  return groupedData;
}

function PipelineCard({
  application,
  isBusy,
  onDragStart,
  onStatusChange,
}) {
  const candidate = application?.candidate || {};
  const cvUrl = getCandidateCvUrl(application);

  return (
    <article
      draggable={!isBusy}
      onDragStart={(event) => onDragStart(event, application)}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60"
    >
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EAF5F1] text-base font-semibold text-[#2E8D76]">
          {getCandidateInitial(candidate)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0F172A]">
            {getCandidateName(candidate)}
          </p>

          <p className="mt-1 break-all text-xs font-normal text-[#667085]">
            {candidate.email || "Email not available"}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="flex items-center gap-2 text-xs font-normal text-[#667085]">
          <FiBriefcase className="shrink-0" />
          <span className="truncate">
            {candidate.current_role || "Role not added"}
          </span>
        </p>

        <p className="flex items-center gap-2 text-xs font-normal text-[#667085]">
          <FiMapPin className="shrink-0" />
          <span className="truncate">
            {candidate.location || "Location not added"}
          </span>
        </p>

        <p className="flex items-center gap-2 text-xs font-normal text-[#667085]">
          <FiClock className="shrink-0" />
          Applied {formatDate(application.applied_at)}
        </p>
      </div>

      {candidate.skills ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {String(candidate.skills)
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
            .slice(0, 4)
            .map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-normal text-[#F7631E]"
              >
                {skill}
              </span>
            ))}
        </div>
      ) : null}

      <div className="mt-4 rounded-xl bg-[#F8FAFA] px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">
          Match preview
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#F7631E]"
              style={{ width: `${application.match_score || 0}%` }}
            />
          </div>

          <span className="text-xs font-semibold text-[#0F172A]">
            {application.match_score || 0}%
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {cvUrl ? (
          <SecureCvButton
            cvUrl={cvUrl}
            label="View CV"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#667085] transition hover:border-[#2E8D76] hover:text-[#2E8D76]"
          />
        ) : (
          <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-normal text-slate-400">
            <FiFileText />
            CV not attached
          </span>
        )}

        <select
          value={application.status || "applied"}
          disabled={isBusy}
          onChange={(event) => onStatusChange(application.id, event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#0F172A] outline-none transition focus:border-[#2E8D76] focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {PIPELINE_COLUMNS.map((column) => (
            <option key={column.status} value={column.status}>
              Move to {column.label}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

function PipelineColumn({
  column,
  applications,
  draggingStatus,
  isBusy,
  onDragOver,
  onDrop,
  onDragStart,
  onStatusChange,
}) {
  const isDraggingOver = draggingStatus === column.status;

  return (
    <section
      onDragOver={(event) => onDragOver(event, column.status)}
      onDrop={(event) => onDrop(event, column.status)}
      className={`flex h-full min-h-[560px] w-[320px] shrink-0 flex-col rounded-3xl border p-4 transition ${
        isDraggingOver
          ? "border-[#F7631E] bg-orange-50"
          : "border-slate-200 bg-[#F8FAFA]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">
            {column.label}
          </p>

          <p className="mt-1 text-xs font-normal text-[#667085]">
            {applications.length} candidate(s)
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[column.status] ||
            "border-slate-200 bg-white text-[#667085]"
          }`}
        >
          {applications.length}
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {applications.length ? (
          applications.map((application) => (
            <PipelineCard
              key={application.id}
              application={application}
              isBusy={isBusy === application.id}
              onDragStart={onDragStart}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div className="grid min-h-[160px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-6 text-center">
            <div>
              <FiUser className="mx-auto text-slate-300" size={24} />
              <p className="mt-3 text-xs font-normal leading-5 text-slate-400">
                Drop candidates here or move them using the status dropdown.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function RecruiterAtsPipelineView() {
  const params = useParams();
  const router = useRouter();

  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [draggingApplication, setDraggingApplication] = useState(null);
  const [draggingStatus, setDraggingStatus] = useState("");
  const [busyApplicationId, setBusyApplicationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadPipeline({ showSuccessMessage = false } = {}) {
    if (!jobId) return;

    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsLoading(true);

      const [jobData, applicationData] = await Promise.all([
        getRecruiterJob(jobId),
        listRecruiterJobApplications(jobId),
      ]);

      setJob(jobData);
      setApplications(Array.isArray(applicationData) ? applicationData : []);

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
    loadPipeline();
  }, [jobId]);

  const groupedApplications = useMemo(
    () => groupApplicationsByStatus(applications),
    [applications]
  );

  const totalApplications = applications.length;
  const hiredCount = applications.filter(
    (application) => application.status === "hired"
  ).length;
  const interviewCount = applications.filter(
    (application) => application.status === "interview"
  ).length;
  const activePipelineCount = applications.filter(
    (application) =>
      !["hired", "rejected"].includes(application.status || "applied")
  ).length;

  function handleDragStart(event, application) {
    setDraggingApplication(application);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(application.id));
  }

  function handleDragOver(event, status) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDraggingStatus(status);
  }

  async function handleDrop(event, nextStatus) {
    event.preventDefault();

    const applicationId =
      draggingApplication?.id || Number(event.dataTransfer.getData("text/plain"));

    setDraggingStatus("");

    if (!applicationId || !nextStatus) {
      setDraggingApplication(null);
      return;
    }

    const currentApplication = applications.find(
      (application) => Number(application.id) === Number(applicationId)
    );

    if (!currentApplication || currentApplication.status === nextStatus) {
      setDraggingApplication(null);
      return;
    }

    await handleStatusChange(applicationId, nextStatus);

    setDraggingApplication(null);
  }

  async function handleStatusChange(applicationId, nextStatus) {
    if (!applicationId || !nextStatus) {
      setErrorMessage("Application or status is missing.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");

    try {
      setBusyApplicationId(applicationId);

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          Number(application.id) === Number(applicationId)
            ? { ...application, status: nextStatus }
            : application
        )
      );

      await updateRecruiterApplicationStatus(applicationId, {
        status: nextStatus,
        note: `Moved to ${nextStatus} from ATS pipeline.`,
      });

      setStatusMessage("Candidate moved successfully.");
      await loadPipeline();
    } catch (error) {
      setErrorMessage(error.message || "Could not update candidate status.");
      await loadPipeline();
    } finally {
      setBusyApplicationId(null);
    }
  }

  return (
    <RecruiterShell>
      <section>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-normal text-[#F7631E] transition hover:text-[#e85512]"
        >
          <FiArrowLeft />
          Back
        </button>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F7631E]">
              ATS pipeline
            </p>

            <h1 className="mt-3 text-[34px] font-semibold tracking-tight text-[#0F172A] md:text-[42px]">
              {job?.title || "Hiring pipeline"}
            </h1>

            <p className="mt-3 max-w-3xl text-sm font-normal leading-6 text-[#667085]">
              Drag candidates across stages, update their hiring status, and
              open CVs using the secure preview flow.
            </p>

            {job ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-normal text-[#F7631E]">
                  {job.company_name || "Company"}
                </span>

                <span className="rounded-full bg-[#F8FAFA] px-3 py-1 text-xs font-normal text-[#667085]">
                  {job.location || "Location not added"}
                </span>

                <span className="rounded-full bg-[#F8FAFA] px-3 py-1 text-xs font-normal text-[#667085]">
                  {job.job_type || "Job type"}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadPipeline({ showSuccessMessage: true })}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#667085] shadow-sm transition hover:border-[#2E8D76] hover:text-[#2E8D76] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
              Refresh
            </button>

            <Link
              href="/recruiter/candidates"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#e85512]"
            >
              <FiUser />
              All candidates
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98A2B3]">
              Total applicants
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#0F172A]">
              {isLoading ? "..." : totalApplications}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98A2B3]">
              Active pipeline
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#0F172A]">
              {isLoading ? "..." : activePipelineCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98A2B3]">
              Interviews
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#0F172A]">
              {isLoading ? "..." : interviewCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98A2B3]">
              Hired
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#0F172A]">
              {isLoading ? "..." : hiredCount}
            </p>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
            <FiAlertCircle className="mr-2 inline" />
            {errorMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
            {statusMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-[#667085]">
            Loading ATS pipeline...
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto pb-4">
            <div className="flex min-w-max gap-4">
              {PIPELINE_COLUMNS.map((column) => (
                <PipelineColumn
                  key={column.status}
                  column={column}
                  applications={groupedApplications[column.status] || []}
                  draggingStatus={draggingStatus}
                  isBusy={busyApplicationId}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && !applications.length ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#EAF5F1] text-[#2E8D76]">
              <FiMail size={26} />
            </div>

            <p className="mt-5 text-base font-semibold text-[#0F172A]">
              No applications yet.
            </p>

            <p className="mx-auto mt-2 max-w-xl text-sm font-normal leading-6 text-[#667085]">
              Once candidates apply to this job, they will appear in this ATS
              pipeline.
            </p>
          </div>
        ) : null}
      </section>
    </RecruiterShell>
  );
}