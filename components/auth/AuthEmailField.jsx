"use client";

import { FiMail } from "react-icons/fi";

import { sanitizeEmail } from "@/lib/utils/authValidationRules";

export default function AuthEmailField({
  value,
  onChange,
  onBlur,
  error,
  placeholder = "name@example.com",
}) {
  function handleChange(event) {
    onChange(sanitizeEmail(event.target.value));
  }

  return (
    <div>
      <label className="text-sm font-normal text-[#585958]">
        Email <span className="text-[#F7631E]">*</span>
      </label>

      <div className="relative mt-2">
        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="email"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="email"
          className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
            error ? "border-red-300" : "border-slate-200"
          }`}
        />
      </div>

      {error ? (
        <p className="mt-2 text-xs font-normal text-red-500">{error}</p>
      ) : (
        <p className="mt-2 text-xs font-normal text-slate-400">
          Use a valid email address. Example: name@example.com
        </p>
      )}
    </div>
  );
}