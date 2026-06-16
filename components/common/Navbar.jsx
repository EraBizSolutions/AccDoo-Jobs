"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiUser,
  FiX,
} from "react-icons/fi";

import HomeLogo from "@/components/common/HomeLogo";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import ThemeToggle from "@/components/common/ThemeToggle";
import { homeInter } from "@/components/home/homeFonts";
import { getCurrentUser } from "@/lib/api/authApi";
import {
  clearAuthData,
  getStoredUser,
  saveAuthData,
  setSelectedLoginMode,
} from "@/lib/utils/tokenStorage";

const THEME_STORAGE_KEY = "accdoo-theme-mode";

function PostJobButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10.25 w-37.25 items-center justify-center rounded-full border-hairline border-blue-400 bg-blue-50 p-2.5 text-accdoo-primary shadow-post-job-inset transition hover:-translate-y-px active:translate-y-0 dark:border-white/15 dark:bg-white/5 dark:text-white ${homeInter.className}`}
    >
      <span className="inline-flex h-6 w-32.25 items-center justify-center gap-3">
        <span className="whitespace-nowrap text-[16px] font-semibold leading-none">
          Post a Job
        </span>
        <span className="relative block h-6 w-6 shrink-0" aria-hidden="true">
          <span className="absolute left-1/2 top-1/2 h-0.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
          <span className="absolute left-1/2 top-1/2 h-4.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
        </span>
      </span>
    </button>
  );
}

export default function Navbar() {
  const router = useRouter();
  const profileMenuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme = storedTheme === "dark" ? "dark" : "light";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");

    queueMicrotask(() => {
      setTheme(nextTheme);
      setThemeReady(true);
    });
  }, []);

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

    function handleAuthUpdate() {
      setCurrentUser(getStoredUser());
    }

    window.addEventListener("jobsera:auth-updated", handleAuthUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("jobsera:auth-updated", handleAuthUpdate);
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  function handleLogout() {
    clearAuthData();
    setCurrentUser(null);
    setOpen(false);
    setProfileOpen(false);
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

  function handleProfileClick() {
    setOpen(false);
    setProfileOpen(false);

    if (currentUser?.role === "recruiter") {
      router.push("/recruiter/dashboard");
      return;
    }

    router.push("/candidate/profile");
  }

  const isLoggedIn = Boolean(currentUser);
  const isDark = theme === "dark";
  const canRecruit =
    currentUser?.role === "recruiter" || currentUser?.role === "both";

  return (
    <header className="sticky top-0 z-50 w-full bg-nav font-sans shadow-nav-line dark:shadow-none">
      <nav className="mx-auto flex h-13.5 w-full max-w-360 items-center justify-between px-17 max-xl:px-10 max-md:h-16.5 max-md:px-6.5">
        <HomeLogo inverted={isDark} />

        <div className="hidden items-center gap-4.5 md:flex">
          <PostJobButton onClick={handlePostJobClick} />

          {!isLoggedIn ? (
            <>
              <Link
                href="/register"
                className="text-[11px] font-bold leading-none text-accdoo-primary transition hover:opacity-75 dark:text-white"
              >
                Register
              </Link>

              <Link
                href="/login"
                className="text-[11px] font-bold leading-none text-accdoo-primary transition hover:opacity-75 dark:text-white"
              >
                Login
              </Link>
            </>
          ) : null}

          <div className="flex items-center gap-2.5">
            {themeReady ? (
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            ) : (
              <span className="h-5.75 w-12 rounded-full bg-theme-track dark:bg-slate-900" />
            )}

            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-6 w-6 place-items-center rounded-full text-nav-text transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
            >
              <FiBell size={15} />
              <span className="absolute right-0.75 top-0.5 h-1.25 w-1.25 rounded-full bg-red-500" />
            </button>
          </div>

          {isLoggedIn ? (
            <>
              <span className="h-8 w-0.5 rounded-full bg-slate-300/55 dark:bg-white/10" />

              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="flex items-center gap-2.25"
                  aria-label="Open profile menu"
                >
                  <span className="h-8 w-8 rounded-full">
                    <ProfileAvatar user={currentUser} />
                  </span>

                  <span className="hidden max-w-35 text-left lg:block">
                    <span
                      className="block text-[9px] font-medium leading-[1.1] text-slate-400 dark:text-white/60"
                    >
                      {canRecruit ? "Enterprise" : "Candidate"}
                    </span>
                    <span
                      className="block truncate text-[11px] font-semibold leading-tight text-nav-text dark:text-white"
                    >
                      {currentUser.name || "User"}
                    </span>
                  </span>

                  <FiChevronDown size={12} className="text-slate-400 dark:text-white/60" />
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+13px)] z-50 w-62.5 overflow-hidden rounded-[18px] border border-line-soft bg-surface p-3 shadow-2xl shadow-slate-950/15">
                    <div className="flex items-center gap-3 rounded-[14px] bg-black/3 p-3 dark:bg-white/6">
                      <div className="h-10 w-10 shrink-0 rounded-full">
                        <ProfileAvatar user={currentUser} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-text-main">
                          {currentUser.name || "User"}
                        </p>
                        <p className="truncate text-[11px] font-medium text-text-muted">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <button
                        type="button"
                        onClick={handleProfileClick}
                        className="flex w-full items-center gap-3 rounded-[13px] px-3 py-3 text-left text-[13px] font-semibold text-text-main transition hover:bg-blue-600/10 hover:text-blue-600"
                      >
                        <FiUser size={15} />
                        Profile
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-[13px] px-3 py-3 text-left text-[13px] font-semibold text-red-500 transition hover:bg-red-500/10"
                      >
                        <FiLogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-8.5 w-8.5 place-items-center rounded-full text-text-main md:hidden"
          aria-label="Open menu"
        >
          <FiMenu size={27} />
        </button>
      </nav>

      {open ? (
        <div className="fixed inset-0 z-100 md:hidden">
          <aside className="flex h-dvh w-full flex-col overflow-hidden bg-gradient-to-b from-blue-600 to-blue-800 text-white dark:from-slate-900 dark:to-black">
            <div className="flex h-20.5 shrink-0 items-center justify-between bg-white px-7 dark:bg-slate-950">
              <HomeLogo inverted={isDark} className="h-6" />

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-full text-nav-text transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
              >
                <FiX size={25} />
              </button>
            </div>

            <div className="flex items-center justify-between px-7 pt-6.5">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="flex items-center gap-2.5 text-left"
                >
                  <span className="h-9 w-9 rounded-full">
                    <ProfileAvatar user={currentUser} />
                  </span>

                  <span>
                    <span className="block text-[9px] font-medium leading-[1.15] text-white/75">
                      {canRecruit ? "Enterprise" : "Candidate"}
                    </span>
                    <span className="block text-[12px] font-semibold leading-[1.2] text-white">
                      {currentUser?.name || "User"}
                    </span>
                  </span>
                </button>
              ) : (
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    Welcome to AccDoo
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-white/70">
                    Find your next opportunity
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                {themeReady ? (
                  <ThemeToggle theme={theme} onToggle={toggleTheme} />
                ) : null}

                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative grid h-6.5 w-6.5 place-items-center rounded-full text-white"
                >
                  <FiBell size={16} />
                  <span className="absolute right-1 top-1 h-1.25 w-1.25 rounded-full bg-red-500" />
                </button>
              </div>
            </div>

            <div className="mt-8 px-7">
              <div className="divide-y divide-white/25 border-b border-white/25">
                {!isLoggedIn ? (
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block py-4.5 text-[16px] font-medium text-white"
                  >
                    Register
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={handlePostJobClick}
                  className="block w-full py-4.5 text-left text-[16px] font-medium text-white"
                >
                  Post a Job
                </button>

                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="block w-full py-4.5 text-left text-[16px] font-medium text-white"
                  >
                    Profile
                  </button>
                ) : null}

                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block py-4.5 text-[16px] font-medium text-white"
                >
                  About
                </Link>

                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block py-4.5 text-[16px] font-medium text-white"
                >
                  Contact us
                </Link>

                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full py-4.5 text-left text-[16px] font-medium text-white"
                  >
                    Logout
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-auto px-9 pb-5.5">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="mb-3 grid h-10.5 w-full place-items-center rounded-md bg-amber-500 text-[13px] font-semibold text-white shadow-action"
                  >
                    Sign Up
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="grid h-10.5 w-full place-items-center rounded-md border border-white/30 bg-white/3 text-[13px] font-semibold text-white"
                  >
                    Login
                  </Link>
                </>
              ) : null}

              <p className="mt-3.75 text-center text-[10px] font-medium text-white/65">
                &copy; accdoo.jobs 2026
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
