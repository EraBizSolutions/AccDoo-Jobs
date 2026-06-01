"use client";

import { useEffect, useState } from "react";

import JobCard from "@/components/home/JobCard";
import { listPublicActiveJobs } from "@/lib/api/jobsApi";
import { getStoredUser } from "@/lib/utils/tokenStorage";

export default function JobsList() {
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadJobs() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listPublicActiveJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Could not load jobs right now.");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const storedUser = getStoredUser();
    setCurrentUser(storedUser);

    loadJobs();
  }, []);

  const isLoggedIn = Boolean(currentUser);

  return (
    <section className="bg-slate-50 px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {isLoading
                ? "Loading jobs..."
                : isLoggedIn
                ? `${jobs.length} recommended jobs`
                : `${jobs.length} featured jobs`}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {isLoggedIn
                ? "AI-ranked roles based on your profile, skills, and recent activity."
                : "Explore active roles from trusted companies. Login to unlock AI match scores."}
            </p>
          </div>

          <button className="w-fit rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-700">
            {isLoggedIn ? "Sort by: Recommended⌄" : "Sort by: Latest⌄"}
          </button>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-sm font-bold text-red-600">{errorMessage}</p>

            <button
              type="button"
              onClick={loadJobs}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white"
            >
              Retry loading jobs
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
            Loading active job posts...
          </div>
        ) : jobs.length ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        ) : !errorMessage ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
            No active jobs yet. Recruiters can publish active jobs from their dashboard.
          </div>
        ) : null}

        {jobs.length ? (
          <div className="mt-10 text-center">
            <button className="rounded-xl border border-slate-300 bg-white px-10 py-3 text-sm font-bold text-blue-700 transition hover:border-blue-700 hover:bg-blue-50">
              Load More Roles⌄
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}