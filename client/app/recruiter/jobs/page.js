"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiEdit3,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiBriefcase,
} from "react-icons/fi";

import Navbar from "@/components/home/Navbar";
import {
  closeRecruiterJob,
  listRecruiterJobs,
  updateRecruiterJob,
} from "@/lib/api/recruiterApi";

const FILTERS = ["all", "active", "draft", "closed"];

function statusClass(status) {
  if (status === "active") {
    return "bg-green-50 text-green-700";
  }

  if (status === "draft") {
    return "bg-yellow-50 text-yellow-700";
  }

  if (status === "closed") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadJobs() {
    setErrorMessage("");

    try {
      setIsLoading(true);
      const data = await listRecruiterJobs();
      setJobs(Array.isArray(data) ? data : []);
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

  const filteredJobs = useMemo(() => {
    if (activeFilter === "all") return jobs;

    return jobs.filter((job) => job.status === activeFilter);
  }, [jobs, activeFilter]);

  return (
    <main className="min-h-screen bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto max-w-36.2517.5pxxl px-5 py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
              Recruiter jobs
            </p>
            <h1 className="mt-2 text-[34px] font-medium tracking-tight text-[#202020]">
              Manage job posts
            </h1>
            <p className="mt-3 max-w-36.2530xl text-sm font-normal leading-6 text-[#585958]">
              Create, edit, publish, draft, or close your job openings from one calm control room.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadJobs}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] shadow-sm transition hover:border-[#F7631E] hover:text-[#F7631E]"
            >
              <FiRefreshCw />
              Refresh
            </button>

            <Link
              href="/recruiter/jobs/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#e85512]"
            >
              <FiPlus />
              Create job
            </Link>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
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
                    : "text-[#585958] hover:bg-orange-50 hover:text-[#F7631E]"
                }`}
              >
                {filter}
              </button>
            );
          })}
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

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
          {isLoading ? (
            <p className="p-6 text-sm font-normal text-[#585958]">
              Loading jobs...
            </p>
          ) : filteredJobs.length ? (
            <div className="divide-y divide-slate-100">
              {filteredJobs.map((job) => (
                <div key={job.id} className="p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
                        <FiBriefcase size={20} />
                      </div>

                      <div>
                        <p className="text-xl font-medium text-[#202020]">
                          {job.title}
                        </p>
                        <p className="mt-1 text-sm font-normal text-[#585958]">
                          {job.company_name} · {job.location || "Location not added"} ·{" "}
                          {job.work_mode || "Work mode not added"}
                        </p>
                        <span
                          className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-normal uppercase tracking-wide ${statusClass(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/recruiter/jobs/${job.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
                      >
                        <FiEdit3 />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => changeStatus(job.id, "active")}
                        className="rounded-lg bg-green-50 px-3 py-2 text-xs font-normal text-green-700"
                      >
                        Active
                      </button>

                      <button
                        type="button"
                        onClick={() => changeStatus(job.id, "draft")}
                        className="rounded-lg bg-yellow-50 px-3 py-2 text-xs font-normal text-yellow-700"
                      >
                        Draft
                      </button>

                      <button
                        type="button"
                        onClick={() => closeJob(job.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-normal text-red-700"
                      >
                        <FiTrash2 />
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-base font-medium text-[#202020]">
                No jobs found.
              </p>
              <p className="mt-2 text-sm font-normal text-[#585958]">
                Create your first job post or change the filter.
              </p>
              <Link
                href="/recruiter/jobs/create"
                className="mt-5 inline-flex rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white"
              >
                Create job
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}