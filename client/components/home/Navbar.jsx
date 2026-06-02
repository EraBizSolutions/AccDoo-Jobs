"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsBriefcaseFill } from "react-icons/bs";
import { IoNotificationsOutline, IoClose } from "react-icons/io5";
import { HiOutlineMenuAlt3 } from "react-icons/hi";

import { getCurrentUser } from "@/lib/api/authApi";
import {
  clearAuthData,
  getStoredUser,
  saveAuthData,
  setSelectedLoginMode,
} from "@/lib/utils/tokenStorage";

export default function Navbar() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function syncCurrentUser() {
      const storedUser = getStoredUser();

      if (storedUser && isMounted) {
        setCurrentUser(storedUser);
      }

      try {
        const freshUser = await getCurrentUser();

        saveAuthData({
          user: freshUser,
        });

        if (isMounted) {
          setCurrentUser(freshUser);
        }
      } catch {
        if (!storedUser && isMounted) {
          setCurrentUser(null);
        }
      }
    }

    syncCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogout() {
    clearAuthData();
    setCurrentUser(null);
    setOpen(false);
    router.push("/login");
  }

  function handlePostJobClick() {
    setOpen(false);

    if (!currentUser) {
      setSelectedLoginMode("recruiter");
      router.push("/login");
      return;
    }

    const canRecruit =
      currentUser.role === "recruiter" || currentUser.role === "both";

    if (canRecruit) {
      router.push("/recruiter/jobs/create");
      return;
    }

    router.push("/recruiter/profile");
  }

  const firstName = currentUser?.name?.split(" ")[0];
  const canRecruit =
    currentUser?.role === "recruiter" || currentUser?.role === "both";

  return (
    <header className="w-full border-b border-slate-200 bg-white font-sans">
      <nav className="mx-auto flex h-[88px] max-w-36.2517.5pxxl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-[25px] font-semibold tracking-tight text-[#0C203A]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F7631E] text-white shadow-sm">
            <BsBriefcaseFill size={16} />
          </span>
          JobsEra
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <button
            type="button"
            onClick={handlePostJobClick}
            className="text-[17px] font-normal text-[#0C203A] transition hover:text-[#F7631E]"
          >
            {currentUser && !canRecruit ? "Become a recruiter" : "+ Post a job"}
          </button>

          {currentUser ? (
            <>
              <div className="rounded-full border border-slate-200 bg-[#F9FBFB] px-5 py-2.5 text-sm font-medium text-[#0C203A]">
                Hi, {firstName || "User"}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#e85512]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-[17px] font-normal text-[#0C203A] transition hover:text-[#F7631E]"
              >
                Register
              </Link>

              <Link
                href="/login"
                className="rounded-xl bg-[#F7631E] px-7 py-3 text-[16px] font-medium text-white shadow-sm transition hover:bg-[#e85512]"
              >
                Login
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label="Notifications"
            className="grid h-11 w-11 place-items-center rounded-full text-[#0C203A] transition hover:bg-slate-100"
          >
            <IoNotificationsOutline size={22} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-full text-[#0C203A] transition hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          <HiOutlineMenuAlt3 size={25} />
        </button>
      </nav>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 md:hidden">
          <div className="ml-auto h-screen w-[84%] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 text-xl font-semibold text-[#0C203A]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F7631E] text-white">
                  <BsBriefcaseFill size={15} />
                </span>
                JobsEra
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <IoClose size={28} />
              </button>
            </div>

            <div className="mt-10 space-y-6">
              <button
                type="button"
                onClick={handlePostJobClick}
                className="block text-lg font-medium text-[#0C203A]"
              >
                {currentUser && !canRecruit ? "Become a recruiter" : "+ Post a job"}
              </button>

              {currentUser ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-[#F9FBFB] px-4 py-3">
                    <p className="text-xs font-normal text-slate-500">
                      Signed in as
                    </p>
                    <p className="text-base font-medium text-[#0C203A]">
                      {currentUser.name || "User"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block text-lg font-medium text-[#0C203A]"
                  >
                    Register
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}