"use client";

import { useEffect, useState } from "react";
import {
  FiSearch,
  FiMapPin,
  FiSliders,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";

import { jobFilters } from "@/lib/constants/homeData";
import { getStoredUser } from "@/lib/utils/tokenStorage";

export default function JobSearchHero() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    setCurrentUser(storedUser);
  }, []);

  const isLoggedIn = Boolean(currentUser);

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-white via-sky-50 to-blue-100 px-6 pt-28 pb-12 lg:px-8">
      <div className="absolute -right-28 top-24 h-80 w-80 rounded-full border-[22px] border-cyan-300/70" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              AI job matching workspace
            </span>

            <h1 className="mt-6 max-w-3xl text-[42px] font-extrabold leading-tight tracking-tight text-slate-950 md:text-[56px]">
              Jobs, talent and hiring{" "}
              <span className="bg-linear-to-r from-blue-800 to-sky-500 bg-clip-text text-transparent">
                reimagined for the AI era
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-[16px] leading-8 text-slate-600">
              {isLoggedIn
                ? "Welcome back. Your AI-powered job discovery workspace is ready."
                : "Explore active roles, create your candidate profile, and unlock AI-powered job matches after signing in."}
            </p>
          </div>

          <div className="hidden lg:block">
            {isLoggedIn ? (
              <div className="rounded-3xl bg-white/90 p-6 shadow-2xl shadow-blue-950/10 ring-1 ring-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recommended Match
                </p>

                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-950">
                        Senior Frontend Engineer
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        92% match · React · Hybrid
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700">
                      <LuSparkles size={12} />
                      AI Pick
                    </span>
                  </div>

                  <div className="mt-5 h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[92%] rounded-full bg-blue-700" />
                  </div>

                  <p className="mt-3 text-xs font-bold text-blue-700">
                    Strong match based on your uploaded CV and frontend skills.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-white/90 p-6 shadow-2xl shadow-blue-950/10 ring-1 ring-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Public job discovery
                </p>

                <div className="mt-5 grid gap-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-700">
                        <FiBriefcase size={20} />
                      </div>

                      <div>
                        <h3 className="text-lg font-extrabold text-slate-950">
                          Browse active jobs
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          View featured openings from trusted companies.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-700">
                        <LuSparkles size={20} />
                      </div>

                      <div>
                        <h3 className="text-lg font-extrabold text-slate-950">
                          Unlock AI matches
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Login and upload your CV to see personalized match
                          scores.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                        <FiUsers size={20} />
                      </div>

                      <div>
                        <h3 className="text-lg font-extrabold text-slate-950">
                          Smarter hiring journey
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Candidate matching becomes available after profile
                          setup.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
          <div className="grid gap-3 md:grid-cols-[1fr_260px_170px]">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-4">
              <FiSearch className="text-slate-400" size={20} />
              <input
                placeholder="Search by job title, company, or keywords..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-4">
              <FiMapPin className="text-slate-400" size={20} />
              <input
                placeholder="City, state"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <button className="rounded-xl bg-blue-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-800">
              Find Roles
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
              <FiSliders size={14} />
              Filters:
            </span>

            {jobFilters.map((filter) => (
              <button
                key={filter}
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-700"
              >
                {filter}⌄
              </button>
            ))}

            <button className="ml-auto text-xs font-bold text-blue-700">
              Clear All
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}