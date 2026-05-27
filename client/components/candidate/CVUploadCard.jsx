import Link from "next/link";
import { LuFileUp, LuUpload } from "react-icons/lu";

export default function CVUploadCard() {
  return (
    <section className="flex h-screen items-center justify-center overflow-hidden bg-[#eef3ff] px-5 pt-16">
      <div className="w-full max-w-125 text-center">
        <h1 className="text-[26px] font-extrabold leading-tight text-slate-950 md:text-[32px]">
          Upload your CV to build your
          <br />
          AI profile
        </h1>

        <p className="mt-2 text-[13px] font-medium text-slate-500">
          Our AI will extract your skills, experience, and education instantly.
        </p>

        <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
          <label
            htmlFor="cv-upload"
            className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 px-5 py-7 transition hover:border-blue-500 hover:bg-blue-50/30"
          >
            <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" className="hidden" />

            <LuFileUp className="mx-auto text-blue-800" size={30} />

            <h2 className="mt-3 text-[20px] font-extrabold text-slate-900">
              Drag and drop your file here
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              or click to browse your CV
            </p>

            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
              <LuUpload size={14} />
              PDF, DOCX up to 10MB
            </div>
          </label>

          <Link
            href="/candidate/analyzing"
            className="mt-4 inline-flex rounded-lg bg-blue-700 px-12 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/20"
          >
            Parse My CV
          </Link>
        </div>
      </div>
    </section>
  );
}