import Link from "next/link";
import { LuFileUp, LuUpload } from "react-icons/lu";

export default function CVUploadCard() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#F9FBFB] px-5 py-12 font-sans">
      <div className="w-full max-w-[520px] text-center">
        <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
          Candidate AI profile
        </p>

        <h1 className="mt-3 text-[34px] font-medium leading-tight tracking-tight text-[#202020] md:text-[44px]">
          Upload your CV to build your AI profile
        </h1>

        <p className="mx-auto mt-4 max-w-[420px] text-[15px] font-normal leading-7 text-[#585958]">
          JobsEra reads your skills, experience, and education to prepare better
          job recommendations.
        </p>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70">
          <label
            htmlFor="cv-upload"
            className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-[#F9FBFB] px-5 py-10 transition hover:border-[#F7631E] hover:bg-orange-50/40"
          >
            <input
              id="cv-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
            />

            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <LuFileUp size={28} />
            </div>

            <h2 className="mt-5 text-[24px] font-medium tracking-tight text-[#202020]">
              Drag and drop your file here
            </h2>

            <p className="mt-2 text-sm font-normal text-[#585958]">
              or click to browse your CV
            </p>

            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-[#F7631E] shadow-sm ring-1 ring-orange-100">
              <LuUpload size={14} />
              PDF, DOCX up to 10MB
            </div>
          </label>

          <Link
            href="/candidate/analyzing"
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#F7631E] px-12 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#e85512]"
          >
            Parse My CV
          </Link>

          <p className="mt-4 text-xs font-normal leading-5 text-slate-400">
            Your CV is used only to improve profile matching and job discovery.
          </p>
        </div>
      </div>
    </section>
  );
}