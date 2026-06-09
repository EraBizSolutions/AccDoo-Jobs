"use client";

import { FiUser } from "react-icons/fi";

export default function AuthNameField({
  value,
  onChange,
  onBlur,
  error,
  placeholder = "Your name",
}) {
  function handleChange(event) {
    const cleanValue = event.target.value
      .replace(/[^A-Za-z ]/g, "")
      .replace(/\s+/g, " ");

    onChange(cleanValue);
  }

  return (
    <div>
      <label className="text-sm font-normal text-[#585958]">
        Full name <span className="text-[#F7631E]">*</span>
      </label>

      <div className="relative mt-2">
        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="name"
          className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
            error ? "border-red-300" : "border-slate-200"
          }`}
        />
      </div>

      {error ? (
        <p className="mt-2 text-xs font-normal text-red-500">{error}</p>
      ) : null}
    </div>
  );
}