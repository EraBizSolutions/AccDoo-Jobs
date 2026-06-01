"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Navbar from "@/components/home/Navbar";
import {
  closeRecruiterJob,
  listRecruiterJobs,
  updateRecruiterJob,
} from "@/lib/api/recruiterApi";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadJobs() {
    try {
      setIsLoading(true);
      const data = await listRecruiterJobs();
      setJobs(data);
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

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      <Navbar />

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Recruiter jobs
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
              Manage job posts
            </h1>
          </div>

          <Link
            href="/recruiter/jobs/create"
            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-700/20"
          >
            + Create job
          </Link>
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {errorMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-xl shadow-blue-950/5">
          {isLoading ? (
            <p className="p-6 text-sm font-bold text-slate-500">Loading jobs...</p>
          ) : jobs.length ? (
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <div key={job.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-extrabold text-slate-950">
                        {job.title}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {job.company_name} · {job.location || "Location not added"} ·{" "}
                        {job.work_mode || "Work mode not added"}
                      </p>
                      <p className="mt-2 text-xs font-extrabold uppercase text-blue-700">
                        {job.status}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/recruiter/jobs/${job.id}/edit`}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => changeStatus(job.id, "active")}
                        className="rounded-lg bg-green-50 px-3 py-2 text-xs font-extrabold text-green-700"
                      >
                        Active
                      </button>

                      <button
                        type="button"
                        onClick={() => changeStatus(job.id, "draft")}
                        className="rounded-lg bg-yellow-50 px-3 py-2 text-xs font-extrabold text-yellow-700"
                      >
                        Draft
                      </button>

                      <button
                        type="button"
                        onClick={() => closeJob(job.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-sm font-bold text-slate-500">
              No jobs yet. Create your first job post.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}