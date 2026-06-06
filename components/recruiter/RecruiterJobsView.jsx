"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBriefcase,
  FiEdit3,
  FiEye,
  FiGitBranch,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import RecruiterShell from "@/components/recruiter/RecruiterShell";
import {
  closeRecruiterJob,
  listRecruiterJobs,
  updateRecruiterJob,
} from "@/lib/api/recruiterApi";

const FILTERS = ["all", "active", "draft", "closed"];

function statusClass(status) {
  if (status === "active") {
    return "bg-[#EAF5F1] text-[#2E8D76]";
  }

  if (status === "draft") {
    return "bg-yellow-50 text-yellow-700";
  }

  if (status === "closed") {
    return "bg-red-50 text-red-700";
  }

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
    ).toLocaleString()}`;
  }

  if (job.salary_min) {
    return `From LKR ${Number(job.salary_min).toLocaleString()}`;
  }

  return `Up to LKR ${Number(job.salary_max).toLocaleString()}`;
}

function StatPill({ label, value, active }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        active
          ? "border-[#F7631E] bg-orange-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-normal uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          active ? "text-[#F7631E]" : "text-[#111827]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function JobRow({ job, onChangeStatus, onCloseJob }) {
  return (
    <article className="group border-b border-slate-100 bg-white px-6 py-5 transition hover:bg-[#FBFCFC]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <Link
          href={`/recruiter/jobs/${job.id}`}
          className="flex min-w-0 flex-1 gap-4"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-[#F7631E] transition group-hover:bg-[#F7631E] group-hover:text-white">
            <FiBriefcase size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-[#111827] transition group-hover:text-[#F7631E]">
                {job.title}
              </h2>
              <FiArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#F7631E]" />
            </div>

            <p className="mt-1 text-sm font-normal text-[#667085]">
              {job.company_name} · {job.location || "Location not added"} ·{" "}
              {formatValue(job.work_mode)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusClass(
                  job.status
                )}`}
              >
                {job.status}
              </span>

              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-normal text-[#667085]">
                {formatValue(job.job_type)}
              </span>

              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-normal text-[#667085]">
                {formatSalary(job)}
              </span>
            </div>
          </div>
        </Link>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Link
            href={`/recruiter/jobs/${job.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#667085] transition hover:border-[#2E8D76] hover:text-[#2E8D76]"
          >
            <FiEye />
            Details
          </Link>

          <Link
            href={`/recruiter/jobs/${job.id}/pipeline`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2E8D76] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#23725f]"
          >
            <FiGitBranch />
            ATS
          </Link>

          <Link
            href={`/recruiter/jobs/${job.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#667085] transition hover:border-[#F7631E] hover:text-[#F7631E]"
          >
            <FiEdit3 />
            Edit
          </Link>

          <button
            type="button"
            onClick={() => onChangeStatus(job.id, "active")}
            className="rounded-xl bg-[#EAF5F1] px-3 py-2 text-xs font-normal text-[#2E8D76]"
          >
            Active
          </button>

          <button
            type="button"
            onClick={() => onChangeStatus(job.id, "draft")}
            className="rounded-xl bg-yellow-50 px-3 py-2 text-xs font-normal text-yellow-700"
          >
            Draft
          </button>

          <button
            type="button"
            onClick={() => onCloseJob(job.id)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-normal text-red-700"
          >
            <FiTrash2 />
            Close
          </button>
        </div>
      </div>
    </article>
  );
}

export default function RecruiterJobsView() {
  const [jobs, setJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadJobs({ showSuccessMessage = false } = {}) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsLoading(true);
      const data = await listRecruiterJobs();
      setJobs(Array.isArray(data) ? data : []);

      if (showSuccessMessage) {
        setStatusMessage("Jobs refreshed successfully.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not load jobs.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function changeStatus(jobId, status) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      await updateRecruiterJob(jobId, { status });
      setStatusMessage(`Job moved to ${status}.`);
      await loadJobs();
    } catch (error) {
      setErrorMessage(error.message || "Could not update job.");
    }
  }

  async function closeJob(jobId) {
    setErrorMessage("");
    setStatusMessage("");

    const confirmed = window.confirm(
      "This will mark the job as closed. You can recover it later by setting it to active or draft. Continue?"
    );

    if (!confirmed) return;

    try {
      await closeRecruiterJob(jobId);
      setStatusMessage("Job closed successfully.");
      await loadJobs();
    } catch (error) {
      setErrorMessage(error.message || "Could not close job.");
    }
  }

  const stats = useMemo(() => {
    return [
      { label: "Total jobs", value: jobs.length, key: "all" },
      {
        label: "Active",
        value: jobs.filter((job) => job.status === "active").length,
        key: "active",
      },
      {
        label: "Draft",
        value: jobs.filter((job) => job.status === "draft").length,
        key: "draft",
      },
      {
        label: "Closed",
        value: jobs.filter((job) => job.status === "closed").length,
        key: "closed",
      },
    ];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();

    return jobs.filter((job) => {
      const matchesFilter =
        activeFilter === "all" || job.status === activeFilter;

      const matchesSearch =
        !lowerSearch ||
        job.title?.toLowerCase().includes(lowerSearch) ||
        job.company_name?.toLowerCase().includes(lowerSearch) ||
        job.location?.toLowerCase().includes(lowerSearch);

      return matchesFilter && matchesSearch;
    });
  }, [jobs, activeFilter, searchTerm]);

  return (
    <RecruiterShell>
      <section>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F7631E]">
              Recruiter jobs
            </p>

            <h1 className="mt-3 text-[34px] font-semibold tracking-tight text-[#111827] md:text-[42px]">
              Jobs
            </h1>

            <p className="mt-3 max-w-3xl text-sm font-normal leading-6 text-[#667085]">
              Manage job posts, custom questions, candidates, and ATS pipelines
              from one recruiter control room.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadJobs({ showSuccessMessage: true })}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#667085] shadow-sm transition hover:border-[#2E8D76] hover:text-[#2E8D76]"
            >
              <FiRefreshCw />
              Refresh
            </button>

            <Link
              href="/recruiter/jobs/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2E8D76] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#23725f]"
            >
              <FiPlus />
              Create new job
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatPill
              key={stat.key}
              label={stat.label}
              value={isLoading ? "..." : stat.value}
              active={activeFilter === stat.key}
            />
          ))}
        </div>

        <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search jobs..."
                className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFA] py-3 pl-11 pr-4 text-sm font-normal text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-[#2E8D76] focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const isSelected = activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-xl px-4 py-2 text-sm font-normal capitalize transition ${
                      isSelected
                        ? "bg-[#F7631E] text-white"
                        : "text-[#667085] hover:bg-orange-50 hover:text-[#F7631E]"
                    }`}
                  >
                    {filter}
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

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <p className="text-base font-semibold text-[#111827]">
                Job list
              </p>
              <p className="mt-1 text-xs font-normal text-[#667085]">
                {filteredJobs.length} visible job
                {filteredJobs.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs font-normal text-[#667085] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#2E8D76]" />
              Live from backend
            </div>
          </div>

          {isLoading ? (
            <p className="px-6 py-6 text-sm font-normal text-[#667085]">
              Loading jobs...
            </p>
          ) : filteredJobs.length ? (
            filteredJobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onChangeStatus={changeStatus}
                onCloseJob={closeJob}
              />
            ))
          ) : (
            <div className="p-10 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
                <FiBriefcase size={26} />
              </div>

              <p className="mt-5 text-base font-semibold text-[#111827]">
                No jobs found.
              </p>
              <p className="mt-2 text-sm font-normal text-[#667085]">
                Create your first job post or change the filter.
              </p>

              <Link
                href="/recruiter/jobs/create"
                className="mt-5 inline-flex rounded-xl bg-[#2E8D76] px-5 py-3 text-sm font-semibold text-white"
              >
                Create new job
              </Link>
            </div>
          )}
        </div>
      </section>
    </RecruiterShell>
  );
}