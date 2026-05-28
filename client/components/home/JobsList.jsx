import JobCard from "@/components/home/JobCard";
import { jobs } from "@/lib/constants/homeData";

export default function JobsList() {
  return (
    <section className="bg-slate-50 px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {jobs.length} recommended jobs
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              AI-ranked roles based on your profile, skills, and recent activity.
            </p>
          </div>

          <button className="w-fit rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-700">
            Sort by: Recommended⌄
          </button>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button className="rounded-xl border border-slate-300 bg-white px-10 py-3 text-sm font-bold text-blue-700 transition hover:border-blue-700 hover:bg-blue-50">
            Load More Roles⌄
          </button>
        </div>
      </div>
    </section>
  );
}