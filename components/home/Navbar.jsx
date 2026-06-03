"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsBriefcaseFill } from "react-icons/bs";
import { IoClose, IoNotificationsOutline } from "react-icons/io5";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { FiLogOut, FiUser } from "react-icons/fi";

import { getCurrentUser } from "@/lib/api/authApi";
import {
  clearAuthData,
  getCandidateProfilePhoto,
  getStoredUser,
  saveAuthData,
  setSelectedLoginMode,
} from "@/lib/utils/tokenStorage";

function ProfileAvatar({ user, photo }) {
  const firstLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  if (photo) {
    return (
      <img
        src={photo}
        alt="Profile"
        className="h-full w-full rounded-full object-cover"
      />
    );
  }

  return (
    <span className="grid h-full w-full place-items-center rounded-full bg-[#F7631E] text-sm font-medium text-white">
      {firstLetter}
    </span>
  );
}

export default function Navbar() {
  const router = useRouter();
  const profileMenuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function syncCurrentUser() {
      const storedUser = getStoredUser();
      const storedPhoto = getCandidateProfilePhoto();

      if (storedPhoto && isMounted) {
        setProfilePhoto(storedPhoto);
      }

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
      setProfilePhoto(getCandidateProfilePhoto());
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

  function handleLogout() {
    clearAuthData();
    setCurrentUser(null);
    setProfilePhoto(null);
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
    router.push("/candidate/profile");
  }

  const canRecruit =
    currentUser?.role === "recruiter" || currentUser?.role === "both";

  return (
    <header className="w-full border-b border-slate-200 bg-white font-sans">
      <nav className="mx-auto flex h-22 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-[25px] font-semibold tracking-tight text-[#0C203A]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F7631E] text-white shadow-sm">
            <BsBriefcaseFill size={16} />
          </span>
          AccDoo
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
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white p-1 shadow-sm transition hover:border-[#F7631E]"
                aria-label="Open profile menu"
              >
                <ProfileAvatar user={currentUser} photo={profilePhoto} />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F9FBFB] p-3">
                    <div className="h-12 w-12 shrink-0 rounded-full">
                      <ProfileAvatar user={currentUser} photo={profilePhoto} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#202020]">
                        {currentUser.name || "User"}
                      </p>
                      <p className="truncate text-xs font-normal text-[#585958]">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <button
                      type="button"
                      onClick={handleProfileClick}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-normal text-[#202020] transition hover:bg-orange-50 hover:text-[#F7631E]"
                    >
                      <FiUser size={17} />
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-normal text-red-600 transition hover:bg-red-50"
                    >
                      <FiLogOut size={17} />
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
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
                AccDoo
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
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-[#F9FBFB] px-4 py-3 text-left"
                  >
                    <div className="h-11 w-11 rounded-full">
                      <ProfileAvatar user={currentUser} photo={profilePhoto} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#0C203A]">
                        {currentUser.name || "User"}
                      </p>
                      <p className="text-xs font-normal text-slate-500">
                        View profile
                      </p>
                    </div>
                  </button>

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