"use client";

import { useEffect, useMemo, useState } from "react";

import JobCard from "@/components/home/JobCard";
import { homeInter } from "@/components/home/homeFonts";
import { listPublicActiveJobs } from "@/lib/api/jobsApi";
import { getStoredUser } from "@/lib/utils/tokenStorage";

const DEFAULT_VISIBLE_COUNT = 18;
const LOAD_MORE_COUNT = 8;

const initialFilters = {
  search: "",
  location: "",
  jobType: "",
  workMode: "",
  salaryRange: "",
  techStacks: [],
};

const SORT_TABS = [
  { label: "Recommended", value: "recommended" },
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getJobSearchText(job) {
  return normalize(
    [
      job.title,
      job.company_name,
      job.description,
      job.location,
      job.job_type,
      job.work_mode,
      job.required_skills,
      job.match_label,
      job.match_summary,
    ].join(" ")
  );
}

function getSalaryHighValue(job) {
  return Number(job.salary_max || job.salary_min || 0);
}

function getCreatedTime(job) {
  if (job.created_at) {
    const createdTime = new Date(job.created_at).getTime();

    if (!Number.isNaN(createdTime)) {
      return createdTime;
    }
  }

  return Number(job.id || 0);
}

function getMatchScore(job) {
  if (job.match_score === null || job.match_score === undefined) {
    return null;
  }

  const score = Number(job.match_score);

  if (Number.isNaN(score)) {
    return null;
  }

  return Math.max(0, Math.min(100, score));
}

function matchesSalaryRange(job, range) {
  if (!range) return true;

  const salary = getSalaryHighValue(job);

  if (!salary) return false;

  if (range === "200000+") {
    return salary >= 200000;
  }

  const [min, max] = range.split("-").map(Number);

  return salary >= min && salary <= max;
}

function matchesTechStacks(job, techStacks) {
  if (!Array.isArray(techStacks) || techStacks.length === 0) {
    return true;
  }

  const skills = normalize(job.required_skills);

  return techStacks.some((tech) => skills.includes(normalize(tech)));
}

function filterJobs(jobs, filters) {
  const search = normalize(filters.search);
  const location = normalize(filters.location);
  const jobType = normalize(filters.jobType);
  const workMode = normalize(filters.workMode);

  return jobs.filter((job) => {
    const searchableText = getJobSearchText(job);

    const matchesSearch = search ? searchableText.includes(search) : true;

    const jobLocation = normalize(job.location);

    const matchesLocation = location
      ? jobLocation.includes(location) || location.includes(jobLocation)
      : true;

    const matchesJobType = jobType
      ? normalize(job.job_type).includes(jobType)
      : true;

    const matchesWorkMode = workMode
      ? normalize(job.work_mode).includes(workMode)
      : true;

    const matchesTechStack = matchesTechStacks(job, filters.techStacks);
    const matchesSalary = matchesSalaryRange(job, filters.salaryRange);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesJobType &&
      matchesWorkMode &&
      matchesTechStack &&
      matchesSalary
    );
  });
}

function sortByRecommended(jobs) {
  return jobs.sort((a, b) => {
    const aMatchScore = getMatchScore(a);
    const bMatchScore = getMatchScore(b);

    const aHasMatch = aMatchScore !== null;
    const bHasMatch = bMatchScore !== null;

    if (aHasMatch && bHasMatch && bMatchScore !== aMatchScore) {
      return bMatchScore - aMatchScore;
    }

    if (aHasMatch && !bHasMatch) {
      return -1;
    }

    if (!aHasMatch && bHasMatch) {
      return 1;
    }

    return getCreatedTime(b) - getCreatedTime(a);
  });
}

function sortByPopular(jobs) {
  return jobs.sort((a, b) => {
    const aMatchScore = getMatchScore(a) || 0;
    const bMatchScore = getMatchScore(b) || 0;

    const aText = getJobSearchText(a);
    const bText = getJobSearchText(b);

    const aPopularScore =
      aMatchScore * 0.7 +
      (aText.includes("software") ? 8 : 0) +
      (aText.includes("developer") ? 8 : 0) +
      (aText.includes("engineer") ? 8 : 0) +
      (aText.includes("designer") ? 6 : 0) +
      (aText.includes("remote") ? 5 : 0);

    const bPopularScore =
      bMatchScore * 0.7 +
      (bText.includes("software") ? 8 : 0) +
      (bText.includes("developer") ? 8 : 0) +
      (bText.includes("engineer") ? 8 : 0) +
      (bText.includes("designer") ? 6 : 0) +
      (bText.includes("remote") ? 5 : 0);

    if (bPopularScore !== aPopularScore) {
      return bPopularScore - aPopularScore;
    }

    return getCreatedTime(b) - getCreatedTime(a);
  });
}

function sortJobs(jobs, sortMode) {
  const clonedJobs = [...jobs];

  if (sortMode === "recommended") {
    return sortByRecommended(clonedJobs);
  }

  if (sortMode === "latest") {
    return clonedJobs.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
  }

  if (sortMode === "popular") {
    return sortByPopular(clonedJobs);
  }

  return sortByRecommended(clonedJobs);
}

function CardSkeleton() {
  return (
    <div className="h-44 rounded-2xl bg-card shadow-card max-md:h-37.5 max-md:rounded-[10px]">
      <div className="flex h-full animate-pulse gap-4 p-4">
        <div className="h-11 w-11 rounded-lg bg-black/10 dark:bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-black/10 dark:bg-white/10" />
          <div className="h-3 w-1/3 rounded bg-black/10 dark:bg-white/10" />
          <div className="h-3 w-4/5 rounded bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function JobsList() {
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [sortMode, setSortMode] = useState("recommended");
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadJobs() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listPublicActiveJobs();

      setJobs(Array.isArray(data) ? data : []);
      setVisibleCount(DEFAULT_VISIBLE_COUNT);
    } catch (error) {
      setErrorMessage(error.message || "Could not load jobs right now.");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      setCurrentUser(getStoredUser());
      loadJobs();
    });

    function handleAuthUpdate() {
      setCurrentUser(getStoredUser());
      loadJobs();
    }

    window.addEventListener("jobsera:auth-updated", handleAuthUpdate);

    return () => {
      window.removeEventListener("jobsera:auth-updated", handleAuthUpdate);
    };
  }, []);

  useEffect(() => {
    function handleFiltersChanged(event) {
      setFilters({
        ...initialFilters,
        ...(event.detail || {}),
      });

      setVisibleCount(DEFAULT_VISIBLE_COUNT);
    }

    window.addEventListener("AccDoo:jobFiltersChanged", handleFiltersChanged);

    return () => {
      window.removeEventListener(
        "AccDoo:jobFiltersChanged",
        handleFiltersChanged
      );
    };
  }, []);

  const isLoggedIn = Boolean(currentUser);

  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);

  const sortedJobs = useMemo(
    () => sortJobs(filteredJobs, sortMode),
    [filteredJobs, sortMode]
  );

  const visibleJobs = sortedJobs.slice(0, visibleCount);
  const hasMoreJobs = visibleCount < sortedJobs.length;
  const hiddenJobsCount = Math.max(sortedJobs.length - visibleCount, 0);

  function handleLoadMore() {
    setVisibleCount((currentCount) => currentCount + LOAD_MORE_COUNT);
  }

  function handleSortChange(nextSortMode) {
    setSortMode(nextSortMode);
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  }

  return (
    <section className={`px-17 pb-18.5 pt-5 max-xl:px-10 max-md:px-6 max-md:pb-11 max-md:pt-7 ${homeInter.className}`}>
      <div className="mx-auto w-full max-w-315">
        <div className="mb-7 flex h-17 items-center justify-between rounded-[7px] bg-surface px-12 shadow-sort-bar ring-1 ring-black/2.5 max-md:h-auto max-md:flex-col max-md:gap-11 max-md:bg-transparent max-md:px-0 max-md:shadow-none max-md:ring-0">
          <div className="order-1 max-md:order-2 max-md:text-center">
            <p className="text-[14px] font-medium leading-none text-gray-800 dark:text-slate-300 max-md:text-[13px]">
              {isLoading
                ? "Loading opportunities..."
                : `${sortedJobs.length} active opportunities`}
            </p>
          </div>

          <div className="order-2 flex items-center justify-center gap-2 max-md:order-1 max-md:mx-auto max-md:grid max-md:w-full max-md:max-w-88 max-md:grid-cols-[1.5fr_1fr_1fr] max-md:gap-3">
            {SORT_TABS.map((tab) => {
              const isActive = sortMode === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleSortChange(tab.value)}
                  className={`h-10.25 min-w-0 whitespace-nowrap rounded-sort text-[14px] font-semibold leading-none transition active:scale-98 max-md:h-11 max-md:w-full max-md:px-2 max-md:text-[12px] ${
                    isActive
                      ? "w-35.25 bg-secondary-blue p-2.5 text-white shadow-sort-active max-md:px-3 max-md:py-0"
                      : "px-6 text-text-muted hover:bg-secondary-blue/10 hover:text-secondary-blue max-md:px-1"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-7 rounded-[13px] border border-red-200 bg-red-50 px-5 py-4 dark:border-red-500/30 dark:bg-red-500/10">
            <p className="text-[13px] font-semibold text-red-600 dark:text-red-300">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadJobs}
              className="mt-3 h-8.5 rounded-md bg-red-600 px-4 text-[12px] font-semibold text-white"
            >
              Retry loading jobs
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mx-auto grid max-w-245 grid-cols-2 gap-x-10.5 gap-y-5.5 max-md:grid-cols-1 max-md:gap-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={`job-skeleton-${index}`} />
            ))}
          </div>
        ) : visibleJobs.length ? (
          <div className="mx-auto grid max-w-245 grid-cols-2 gap-x-10.5 gap-y-5.5 max-md:grid-cols-1 max-md:gap-y-3">
            {visibleJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                isLoggedIn={isLoggedIn}
                colorIndex={index}
              />
            ))}
          </div>
        ) : !errorMessage ? (
          <div className="rounded-[13px] border border-line-soft bg-card px-8 py-10 text-center shadow-card">
            <p className="text-[16px] font-semibold text-text-main">
              No matching jobs found.
            </p>

            <p className="mt-2 text-[13px] font-medium text-text-muted">
              Try changing your search keywords, location, or filters.
            </p>
          </div>
        ) : null}

        {!isLoading && visibleJobs.length && hasMoreJobs ? (
          <div className="mt-13.5 flex flex-col items-center justify-center gap-2.5 max-md:mt-8.5">
            <button
              type="button"
              onClick={handleLoadMore}
              className="h-9 rounded-[5px] border border-load-border bg-surface px-5.5 text-[12px] font-bold text-text-main shadow-sm transition hover:border-accdoo-primary hover:text-accdoo-primary active:scale-98 dark:border-white/25"
            >
              Load More
            </button>

            <p className="text-[10px] font-semibold text-text-soft">
              {hiddenJobsCount} more job{hiddenJobsCount === 1 ? "" : "s"} available
            </p>
          </div>
        ) : null}

        {!isLoading && visibleJobs.length && !hasMoreJobs ? (
          <div className="mt-13.5 flex justify-center max-md:mt-8.5">
            <p className="rounded-[5px] border border-load-border px-4.5 py-2.5 text-[12px] font-semibold text-text-muted dark:border-white/25">
              All jobs loaded
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
