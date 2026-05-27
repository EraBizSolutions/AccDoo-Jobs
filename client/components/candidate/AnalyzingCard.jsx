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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
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
    <section className="flex min-h-screen items-center justify-center overflow-hidden bg-[#fbf9ff] px-5 pt-24 pb-8">
      <div className="w-full max-w-[430px] text-center">
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-950">
          Let's build your profile
        </h1>

        <p className="mx-auto mt-1 max-w-[330px] text-[11px] leading-5 text-slate-500">
          Our AI is extracting your experience, skills, and matching signals.
        </p>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-xl shadow-blue-700/10">
          <div className="h-1 rounded-full bg-linear-to-r from-blue-800 via-blue-600 to-sky-400" />

          <div className="mt-2 rounded-xl border border-dashed border-slate-300 bg-[#fbf9ff] px-4 py-5">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-blue-200 text-blue-700">
              <LuScanText size={22} />
            </div>

            <h2 className="mt-3 text-[19px] font-extrabold text-slate-900">
              Analyzing your CV...
            </h2>

            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Extracting intelligence from document_v2.pdf
            </p>

            <div className="mx-auto mt-4 h-2 max-w-[210px] overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[64%] animate-pulse rounded-full bg-blue-700" />
            </div>

            <p className="mt-3 text-[10px] font-bold text-blue-700">
              Redirecting to your home dashboard...
            </p>
          </div>

          <div className="my-3 h-px bg-slate-200" />

          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            AI Extraction Process
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
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
              label="Match Score"
              active
            />
          </div>
        </div>

        <p className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
          <LuShieldCheck size={12} />
          Secure, encrypted processing
        </p>
      </div>
    </section>
  );
}