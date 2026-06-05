"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiBriefcase,
  FiChevronDown,
  FiGrid,
  FiLogOut,
  FiPlus,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { clearAuthData, getStoredUser } from "@/lib/utils/tokenStorage";

const navigationItems = [
  {
    group: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/recruiter/dashboard",
        icon: FiGrid,
      },
    ],
  },
  {
    group: "Hire",
    items: [
      {
        label: "Jobs",
        href: "/recruiter/jobs",
        icon: FiBriefcase,
      },
      {
        label: "Candidates",
        href: "/recruiter/candidates",
        icon: FiUsers,
      },
    ],
  },
];

function isActivePath(pathname, href) {
  if (href === "/recruiter/jobs") {
    return pathname === href || pathname.startsWith("/recruiter/jobs/");
  }

  return pathname === href;
}

function getInitial(nameOrEmail) {
  if (!nameOrEmail) return "R";
  return String(nameOrEmail).trim().charAt(0).toUpperCase();
}

function SidebarLink({ item }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = isActivePath(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={`group flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition ${
        isActive
          ? "bg-[#EAF5F1] text-[#2E8D76]"
          : "text-[#6B7280] hover:bg-slate-50 hover:text-[#2E8D76]"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon
          size={18}
          className={isActive ? "text-[#2E8D76]" : "text-[#6B7280]"}
        />
        {item.label}
      </span>

      {isActive ? (
        <span className="h-2 w-2 rounded-full bg-[#2E8D76]" />
      ) : null}
    </Link>
  );
}

function RecruiterSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] border-r border-[#E5E7EB] bg-[#F8FAFA] lg:block">
      <div className="flex h-[76px] items-center border-b border-[#E5E7EB] px-7">
        <Link href="/recruiter/dashboard" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F7631E] text-white shadow-lg shadow-orange-200">
            <FiBriefcase size={20} />
          </div>

          <div>
            <p className="text-[24px] font-bold tracking-tight text-[#0F172A]">
              AccDoo
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#98A2B3]">
              ATS
            </p>
          </div>
        </Link>
      </div>

      <nav className="px-5 py-7">
        <div className="space-y-7">
          {navigationItems.map((group) => (
            <div key={group.group}>
              <div className="mb-3 flex items-center justify-between px-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[#98A2B3]">
                  {group.group}
                </p>
                <FiChevronDown size={14} className="text-[#98A2B3]" />
              </div>

              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-[#E5E7EB] px-7 py-5">
        <p className="text-xs font-normal text-[#98A2B3]">Version: 1.0.0</p>
      </div>
    </aside>
  );
}

function RecruiterTopbar() {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());

    function handleClickOutside(event) {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    clearAuthData();
    router.push("/login");
  }

  const displayName = user?.name || "Recruiter";
  const displayEmail = user?.email || "recruiter@accdoo.com";
  const initial = getInitial(displayName || displayEmail);

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white lg:ml-[260px]">
      <div className="flex h-[76px] items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F7631E] text-white">
            <FiBriefcase size={20} />
          </div>
          <p className="text-[23px] font-bold tracking-tight text-[#0F172A]">
            AccDoo
          </p>
        </div>

        <div className="hidden lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[15px] font-medium text-[#2E8D76] transition hover:text-[#236e5c]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#EAF5F1]">
              ↻
            </span>
            Switch to employee view
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/recruiter/jobs/create"
            className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-slate-50 sm:inline-flex"
          >
            <FiPlus />
            Post a job
          </Link>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-[#667085] transition hover:bg-slate-50 hover:text-[#F7631E]"
          >
            <FiBell size={19} />
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-50"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#EAF5F1] text-lg font-medium text-[#2E8D76]">
                {initial}
              </span>

              <span className="hidden text-left md:block">
                <span className="block text-sm font-medium text-[#0F172A]">
                  {displayName}
                </span>
                <span className="block text-xs font-normal text-[#667085]">
                  {displayEmail}
                </span>
              </span>

              <FiChevronDown size={17} className="text-[#667085]" />
            </button>

            {isProfileOpen ? (
              <div className="absolute right-0 top-[58px] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
                <div className="border-b border-slate-100 px-4 py-4">
                  <p className="text-sm font-medium text-[#0F172A]">
                    {displayName}
                  </p>
                  <p className="mt-1 truncate text-xs font-normal text-[#667085]">
                    {displayEmail}
                  </p>
                </div>

                <Link
                  href="/recruiter/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-normal text-[#667085] transition hover:bg-slate-50 hover:text-[#2E8D76]"
                >
                  <FiUser />
                  Company profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-normal text-red-600 transition hover:bg-red-50"
                >
                  <FiLogOut />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function RecruiterShell({ children }) {
  return (
    <main className="min-h-screen bg-[#F8FAFA] font-sans">
      <RecruiterSidebar />
      <RecruiterTopbar />

      <section className="lg:ml-[260px]">
        <div className="px-5 py-8 lg:px-9">{children}</div>
      </section>
    </main>
  );
}