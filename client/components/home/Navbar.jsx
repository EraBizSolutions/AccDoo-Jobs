"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsBriefcaseFill } from "react-icons/bs";
import { IoNotificationsOutline, IoClose } from "react-icons/io5";
import { HiOutlineMenuAlt3 } from "react-icons/hi";

import { clearAuthData, getStoredUser } from "@/lib/utils/tokenStorage";

export default function Navbar() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    setCurrentUser(storedUser);
  }, []);

  function handleLogout() {
    clearAuthData();
    setCurrentUser(null);
    setOpen(false);
    router.push("/login");
  }

  const firstName = currentUser?.name?.split(" ")[0];

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-[22px] font-extrabold text-blue-700"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-700 text-white shadow-md shadow-blue-700/20">
            <BsBriefcaseFill size={14} />
          </span>
          JobsEra
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <button className="text-sm font-semibold text-slate-700 hover:text-blue-700">
            + Post a job
          </button>

          {currentUser ? (
            <>
              <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                Hi, {firstName || "Candidate"}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-sm font-semibold text-slate-700 hover:text-blue-700"
              >
                Register
              </Link>

              <Link
                href="/login"
                className="rounded-full bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
              >
                Login
              </Link>
            </>
          )}

          <button
            aria-label="Notifications"
            className="grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-100"
          >
            <IoNotificationsOutline size={20} />
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-full text-slate-800 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          <HiOutlineMenuAlt3 size={24} />
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 md:hidden">
          <div className="ml-auto h-screen w-[82%] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 text-xl font-extrabold text-blue-700"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-700 text-white">
                  <BsBriefcaseFill size={14} />
                </span>
                JobsEra
              </Link>

              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <IoClose size={28} />
              </button>
            </div>

            <div className="mt-10 space-y-6">
              <button className="block text-lg font-semibold text-slate-800">
                + Post a job
              </button>

              {currentUser ? (
                <>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Signed in as
                    </p>
                    <p className="text-base font-extrabold text-blue-700">
                      {currentUser.name || "Candidate"}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block text-lg font-semibold text-slate-800"
                  >
                    Register
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}