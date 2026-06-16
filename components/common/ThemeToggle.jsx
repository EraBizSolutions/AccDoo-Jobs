import { FiMoon, FiSun } from "react-icons/fi";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className="relative inline-flex h-5.75 w-12 items-center rounded-full border border-theme-border bg-theme-track p-0.5 transition dark:border-white/10 dark:bg-slate-900"
    >
      <span
        className={`grid h-4.25 w-4.25 place-items-center rounded-full bg-blue-600 text-white shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-6.25" : "translate-x-0"
        }`}
      >
        {isDark ? <FiMoon size={9} /> : <FiSun size={9} />}
      </span>
    </button>
  );
}
