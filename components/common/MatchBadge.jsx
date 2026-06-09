import { LuSparkles } from "react-icons/lu";

function getMatchStyle(score) {
  if (score >= 80) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (score >= 60) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (score >= 40) {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  if (score >= 20) {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function MatchBadge({
  score,
  label,
  size = "sm",
  showIcon = true,
  className = "",
}) {
  if (score === null || score === undefined) return null;

  const safeScore = Number(score) || 0;
  const displayLabel = label || "Match";

  const sizeClass =
    size === "lg"
      ? "px-4 py-2 text-sm"
      : "px-3 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-medium ${getMatchStyle(
        safeScore
      )} ${sizeClass} ${className}`}
    >
      {showIcon ? <LuSparkles size={size === "lg" ? 16 : 13} /> : null}
      {displayLabel} {safeScore}%
    </span>
  );
}