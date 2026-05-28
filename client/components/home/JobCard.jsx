import {
  FiMapPin,
  FiShare2,
  FiBriefcase,
  FiDollarSign,
  FiClock,
  FiArrowRight,
  FiLock,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { LuSparkles } from "react-icons/lu";

function JobMetaItem({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
      {icon}
      {children}
    </span>
  );
}

export default function JobCard({ job, isLoggedIn = false }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-lg hover:shadow-blue-950/5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-slate-100 bg-slate-50 text-sm font-extrabold text-blue-700 shadow-sm">
            {job.logoText}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold leading-snug text-slate-950 md:text-xl">
                {job.title}
              </h3>

              {isLoggedIn && job.aiRecommended ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700">
                  <LuSparkles size={12} />
                  AI Pick
                </span>
              ) : null}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <p className="text-sm font-extrabold text-emerald-700">
                {job.company}
              </p>

              {job.verified ? (
                <MdVerified className="text-emerald-600" size={16} />
              ) : null}
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-800">
              {job.category}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              <JobMetaItem icon={<FiBriefcase size={15} />}>
                {job.type}
              </JobMetaItem>

              <JobMetaItem icon={<FiMapPin size={15} />}>
                {job.location}
              </JobMetaItem>

              {job.salary ? (
                <JobMetaItem icon={<FiDollarSign size={15} />}>
                  {job.salary}
                </JobMetaItem>
              ) : null}

              <JobMetaItem icon={<FiClock size={15} />}>
                {job.mode}
              </JobMetaItem>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-5 lg:min-w-60 lg:items-end">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-800 transition hover:text-blue-700">
              <FiShare2 size={15} />
              Share
            </button>

            <button className="inline-flex items-center gap-1.5 text-sm font-extrabold text-orange-500 transition hover:text-orange-600">
              Apply
              <FiArrowRight size={15} />
            </button>
          </div>

          {isLoggedIn ? (
            <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 lg:w-52">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold uppercase tracking-wide text-blue-500">
                  AI Match
                </span>
                <span className="text-lg font-black text-blue-700">
                  {job.match}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-blue-700"
                  style={{ width: job.match }}
                />
              </div>

              <p className="mt-2 text-xs font-bold text-slate-600">
                {job.status}
              </p>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:w-52">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <FiLock size={13} />
                AI Match Locked
              </div>

              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                Login and upload your CV to unlock personalized match scores.
              </p>
            </div>
          )}

          <p className="text-sm font-semibold text-slate-400">
            Posted on {job.postedDate}
          </p>
        </div>
      </div>
    </article>
  );
}