import JobCard from "@/components/home/JobCard";
import { jobs } from "@/lib/constants/homeData";

export default function JobsList() {
  return (
    <section className="bg-slate-50 px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Recommended for You
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Based on your profile and recent activity.
            </p>
          </div>

          <button className="hidden text-sm font-bold text-blue-700 md:block">
            Sort by: Recommended⌄
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button className="rounded-xl border border-slate-300 bg-white px-10 py-3 text-sm font-bold text-blue-700 hover:border-blue-700">
            Load More Roles⌄
          </button>
        </div>
      </div>
    </section>
  );
}