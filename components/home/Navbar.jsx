"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSun,
  FiUser,
  FiX,
} from "react-icons/fi";

import { getCurrentUser } from "@/lib/api/authApi";
import {
  clearAuthData,
  getStoredUser,
  saveAuthData,
  setSelectedLoginMode,
} from "@/lib/utils/tokenStorage";

const THEME_STORAGE_KEY = "accdoo-theme-mode";

function AccDooLogo({ isDark = false }) {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="AccDoo home">
      <img
        src="/accdoo-logo.svg"
        alt="AccDoo"
        className={`h-[24px] w-auto object-contain max-md:h-[18px] ${
          isDark ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}

function ProfileAvatar({ user }) {
  const firstLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.trim()?.charAt(0)?.toUpperCase() ||
    "K";

  return (
    <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[#D8E8FF] text-[12px] font-semibold text-[#0152A4]">
      {firstLetter}
    </span>
  );
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className={`relative inline-flex h-[23px] w-[48px] items-center rounded-full border p-[2px] transition ${
        isDark
          ? "border-white/10 bg-[#111827]"
          : "border-[#D7DFEA] bg-[#EDF3FB]"
      }`}
    >
      <span
        className={`grid h-[17px] w-[17px] place-items-center rounded-full bg-[#155DFC] text-white shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-[25px]" : "translate-x-0"
        }`}
      >
        {isDark ? <FiMoon size={9} /> : <FiSun size={9} />}
      </span>
    </button>
  );
}

function PostJobButton({ onClick, isDark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[31px] items-center justify-center gap-[7px] rounded-full border px-[15px] text-[12px] font-bold leading-none shadow-[inset_0_3px_4px_rgba(0,0,0,0.08),0_3px_8px_rgba(1,82,164,0.08)] transition hover:-translate-y-[1px] active:translate-y-0"
      style={{
        color: isDark ? "#FFFFFF" : "#0152A4",
        backgroundColor: isDark ? "rgba(255,255,255,0.065)" : "#EBF5FF",
        borderColor: isDark ? "rgba(255,255,255,0.14)" : "#4CA5FF",
      }}
    >
      <span>Post a Job</span>
      <span className="text-[17px] font-medium leading-none">+</span>
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

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setThemeReady(true);
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

  const navTextColor = isDark ? "#FFFFFF" : "#071F3A";
  const mutedTextColor = isDark ? "rgba(255,255,255,0.62)" : "#A7AFBD";
  const authLinkColor = isDark ? "#FFFFFF" : "#0152A4";

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--nav-bg)] font-sans shadow-[0_1px_0_rgba(2,18,38,0.055)] dark:shadow-none">
      <nav className="mx-auto flex h-[54px] w-full max-w-[1440px] items-center justify-between px-[68px] max-xl:px-10 max-md:h-[66px] max-md:px-[26px]">
        <AccDooLogo isDark={isDark} />

        <div className="hidden items-center gap-[18px] md:flex">
          <PostJobButton onClick={handlePostJobClick} isDark={isDark} />

          {!isLoggedIn ? (
            <>
              <Link
                href="/register"
                className="text-[11px] font-bold leading-none transition hover:opacity-75"
                style={{ color: authLinkColor }}
              >
                Register
              </Link>

              <Link
                href="/login"
                className="text-[11px] font-bold leading-none transition hover:opacity-75"
                style={{ color: authLinkColor }}
              >
                Login
              </Link>
            </>
          ) : null}

          <div className="flex items-center gap-[10px]">
            {themeReady ? (
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            ) : (
              <span className="h-[23px] w-[48px] rounded-full bg-[#EDF3FB]" />
            )}

            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-[24px] w-[24px] place-items-center rounded-full transition hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: navTextColor }}
            >
              <FiBell size={15} />
              <span className="absolute right-[3px] top-[2px] h-[5px] w-[5px] rounded-full bg-[#FB2C36]" />
            </button>
          </div>

          {isLoggedIn ? (
            <>
              <span className="h-[32px] w-[2px] rounded-full bg-[#D9D9D98C] dark:bg-white/10" />

              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="flex items-center gap-[9px]"
                  aria-label="Open profile menu"
                >
                  <span className="h-[32px] w-[32px] rounded-full">
                    <ProfileAvatar user={currentUser} />
                  </span>

                  <span className="hidden max-w-[140px] text-left lg:block">
                    <span
                      className="block text-[9px] font-medium leading-[1.1]"
                      style={{ color: mutedTextColor }}
                    >
                      {canRecruit ? "Enterprise" : "Candidate"}
                    </span>
                    <span
                      className="block truncate text-[11px] font-semibold leading-[1.25]"
                      style={{ color: navTextColor }}
                    >
                      {currentUser.name || "User"}
                    </span>
                  </span>

                  <FiChevronDown size={12} style={{ color: mutedTextColor }} />
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+13px)] z-50 w-[250px] overflow-hidden rounded-[18px] border border-[var(--line-soft)] bg-[var(--surface-bg)] p-3 shadow-2xl shadow-slate-950/15">
                    <div className="flex items-center gap-3 rounded-[14px] bg-black/[0.03] p-3 dark:bg-white/[0.06]">
                      <div className="h-10 w-10 shrink-0 rounded-full">
                        <ProfileAvatar user={currentUser} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[var(--text-main)]">
                          {currentUser.name || "User"}
                        </p>
                        <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <button
                        type="button"
                        onClick={handleProfileClick}
                        className="flex w-full items-center gap-3 rounded-[13px] px-3 py-3 text-left text-[13px] font-semibold text-[var(--text-main)] transition hover:bg-[#155DFC]/10 hover:text-[#155DFC]"
                      >
                        <FiUser size={15} />
                        Profile
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-[13px] px-3 py-3 text-left text-[13px] font-semibold text-[#FB2C36] transition hover:bg-red-500/10"
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
          className="grid h-[34px] w-[34px] place-items-center rounded-full text-[var(--text-main)] md:hidden"
          aria-label="Open menu"
        >
          <FiMenu size={27} />
        </button>
      </nav>

      {open ? (
        <div className="fixed inset-0 z-[100] bg-black/30 md:hidden">
          <aside className="ml-auto flex h-screen w-[82%] max-w-[315px] flex-col overflow-hidden bg-[#155DFC] shadow-2xl">
            <div className="flex h-[74px] items-center justify-between bg-white px-[24px]">
              <AccDooLogo isDark={false} />

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center text-[#071F3A]"
              >
                <FiX size={23} />
              </button>
            </div>

            <div className="flex items-center justify-between px-[24px] pt-[24px]">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="flex items-center gap-[10px] text-left"
                >
                  <span className="h-[36px] w-[36px] rounded-full">
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
                  <p className="mt-[4px] text-[10px] font-medium text-white/70">
                    Find your next opportunity
                  </p>
                </div>
              )}

              <div className="flex items-center gap-[10px]">
                {themeReady ? (
                  <ThemeToggle theme={theme} onToggle={toggleTheme} />
                ) : null}

                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative grid h-[26px] w-[26px] place-items-center rounded-full text-white"
                >
                  <FiBell size={16} />
                  <span className="absolute right-[4px] top-[4px] h-[5px] w-[5px] rounded-full bg-[#FB2C36]" />
                </button>
              </div>
            </div>

            <div className="mt-[31px] px-[24px]">
              <div className="divide-y divide-white/20 border-y border-white/20">
                {!isLoggedIn ? (
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block py-[16px] text-[14px] font-medium text-white"
                  >
                    Register
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={handlePostJobClick}
                  className="block w-full py-[16px] text-left text-[14px] font-medium text-white"
                >
                  Post a Job
                </button>

                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="block w-full py-[16px] text-left text-[14px] font-medium text-white"
                  >
                    Profile
                  </button>
                ) : null}

                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block py-[16px] text-[14px] font-medium text-white"
                >
                  About
                </Link>

                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block py-[16px] text-[14px] font-medium text-white"
                >
                  Contact us
                </Link>

                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full py-[16px] text-left text-[14px] font-medium text-white"
                  >
                    Logout
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-auto px-[28px] pb-[22px]">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="mb-[12px] grid h-[38px] w-full place-items-center rounded-[5px] bg-[#F59E0B] text-[12px] font-semibold text-white"
                  >
                    Sign Up
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="grid h-[38px] w-full place-items-center rounded-[5px] border border-white/25 text-[12px] font-semibold text-white"
                  >
                    Login
                  </Link>
                </>
              ) : null}

              <p className="mt-[15px] text-center text-[10px] font-medium text-white/65">
                © accdoo.jobs 2026
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}