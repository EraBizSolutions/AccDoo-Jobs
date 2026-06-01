"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/home/Navbar";
import {
  closeRecruiterJob,
  getRecruiterDashboard,
} from "@/lib/api/recruiterApi";
import { getAccessToken } from "@/lib/utils/tokenStorage";

export default function RecruiterDashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadDashboard() {
    try {
      setIsLoading(true);
      const data = await getRecruiterDashboard();
      setDashboard(data);
    } catch (error) {
      setErrorMessage(error.message || "Could not load recruiter dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    loadDashboard();
  }, [router]);

  async function handleCloseJob(jobId) {
    setErrorMessage("");
    setStatusMessage("");

    const confirmed = window.confirm(
      "This will mark the job as closed. You can recover it later from Manage Jobs. Continue?"
    );

    if (!confirmed) return;

    try {
      await closeRecruiterJob(jobId);
      setStatusMessage("Job closed successfully.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error.message || "Could not close job.");
    }
  }

  const stats = [
    ["Total jobs", dashboard?.total_jobs || 0],
    ["Active", dashboard?.active_jobs || 0],
    ["Draft", dashboard?.draft_jobs || 0],
    ["Closed", dashboard?.closed_jobs || 0],
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      <Navbar />

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Recruiter dashboard
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
              Manage your hiring pipeline
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/recruiter/profile"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm"
            >
              Company profile
            </Link>

            <Link
              href="/recruiter/jobs"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm"
            >
              Manage jobs
            </Link>

            <Link
              href="/recruiter/jobs/create"
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-700/20"
            >
              + Create job
            </Link>
          </div>
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

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-blue-950/5"
            >
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <p className="mt-3 text-4xl font-extrabold text-slate-950">
                {isLoading ? "..." : value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-blue-950/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-950">
              Recent job posts
            </h2>

            <Link
              href="/recruiter/jobs"
              className="text-sm font-extrabold text-blue-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-500">
                Loading recent jobs...
              </p>
            ) : dashboard?.recent_jobs?.length ? (
              dashboard.recent_jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="font-extrabold text-slate-950">{job.title}</p>
                    <p className="text-sm font-semibold text-slate-500">
                      {job.company_name} · {job.location || "Location not added"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase text-blue-700">
                      {job.status}
                    </span>

                    <Link
                      href={`/recruiter/jobs/${job.id}/edit`}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-blue-700 shadow-sm"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCloseJob(job.id)}
                      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-500">
                No job posts yet. Create your first job post.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}