"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LuScanText,
  LuCircleCheck,
  LuSparkles,
  LuGraduationCap,
  LuShieldCheck,
} from "react-icons/lu";

function ProcessPill({ icon, label, active }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-normal ${
        active
          ? "bg-[#F7631E] text-white"
          : "bg-white text-[#585958] ring-1 ring-slate-200"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

export default function AnalyzingCard() {
  const router = useRouter();

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push("/");
    }, 3500);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#F9FBFB] px-5 py-12 font-sans">
      <div className="w-full max-w-[470px] text-center">
        <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
          AI extraction process
        </p>

        <h1 className="mt-3 text-[32px] font-medium tracking-tight text-[#202020]">
          Let’s build your profile
        </h1>

        <p className="mx-auto mt-3 max-w-[360px] text-sm font-normal leading-6 text-[#585958]">
          JobsEra is extracting your experience, skills, education, and matching
          signals.
        </p>

        <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70">
          <div className="h-1 rounded-full bg-linear-to-r from-[#F7631E] via-orange-400 to-[#1D554C]" />

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-[#F9FBFB] px-5 py-7">
            <div className="mx-auto grid h-13 w-13 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <LuScanText size={25} />
            </div>

            <h2 className="mt-4 text-[24px] font-medium tracking-tight text-[#202020]">
              Analyzing your CV...
            </h2>

            <p className="mt-2 text-xs font-normal leading-5 text-slate-400">
              Extracting intelligence from your uploaded document
            </p>

            <div className="mx-auto mt-5 h-2 max-w-[240px] overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[68%] animate-pulse rounded-full bg-[#F7631E]" />
            </div>

            <p className="mt-4 text-[11px] font-normal text-[#F7631E]">
              Redirecting to your job discovery workspace...
            </p>
          </div>

          <div className="my-5 h-22x bg-slate-200" />

          <p className="text-[10px] font-normal uppercase tracking-[0.18em] text-slate-400">
            Matching signals
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <ProcessPill
              icon={<LuCircleCheck size={12} />}
              label="Skills mapped"
            />

            <ProcessPill
              icon={<LuCircleCheck size={12} />}
              label="Experience parsed"
            />

            <ProcessPill
              icon={<LuGraduationCap size={12} />}
              label="Education"
            />

            <ProcessPill
              icon={<LuSparkles size={12} />}
              label="Match score"
              active
            />
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-[12px] font-normal text-slate-400">
          <LuShieldCheck size={13} />
          Secure candidate profile processing
        </p>
      </div>
    </section>
  );
}