import { FiMapPin, FiBookmark } from "react-icons/fi";

export default function JobCard({ job }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-sm font-extrabold text-blue-700">
            {job.company.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-950">{job.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {job.company} · <FiMapPin className="inline" size={13} /> {job.location} ({job.mode})
            </p>
          </div>
        </div>

        <FiBookmark className="text-slate-400" size={20} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold">{job.type}</span>
        <span className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold">{job.salary}</span>
        {job.tags.map((tag) => (
          <span key={tag} className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold">
            {tag}
          </span>
        ))}
      </div>

      <div className="my-5 h-px bg-slate-200" />

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-blue-700">{job.match}</p>
          <p className="text-xs text-slate-500">{job.status}</p>
        </div>

        <div className="flex gap-3">
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:border-blue-700 hover:text-blue-700">
            View Details
          </button>

          <button className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800">
            Apply Now
          </button>
        </div>
      </div>
    </article>
  );
}