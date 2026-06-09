"use client";

import { FiExternalLink, FiEye } from "react-icons/fi";

import { buildProtectedPdfPreviewUrl } from "@/lib/api/fileApi";

export default function SecureCvButton({
  cvUrl,
  label = "View CV",
  className = "",
  iconOnly = false,
  version = "",
}) {
  if (!cvUrl) {
    return (
      <button
        type="button"
        disabled
        className={
          className ||
          "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-medium text-slate-500 disabled:cursor-not-allowed"
        }
      >
        <FiEye />
        {iconOnly ? null : label}
      </button>
    );
  }

  return (
    <a
      href={buildProtectedPdfPreviewUrl(cvUrl, version)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ||
        "inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-green-800"
      }
    >
      <FiEye />
      {iconOnly ? null : label}
      {!iconOnly ? <FiExternalLink size={13} /> : null}
    </a>
  );
}