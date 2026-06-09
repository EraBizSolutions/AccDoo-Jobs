"use client";

import { useState } from "react";
import { FiCheckCircle, FiEye, FiEyeOff, FiLock, FiXCircle } from "react-icons/fi";

import {
  getPasswordChecks,
  getPasswordStrength,
} from "@/lib/utils/authValidationRules";

function PasswordRule({ passed, children }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-normal ${
        passed ? "text-green-700" : "text-slate-400"
      }`}
    >
      {passed ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />}
      {children}
    </div>
  );
}

export default function AuthPasswordField({
  label = "Password",
  value,
  onChange,
  onBlur,
  error,
  showStrength = false,
  placeholder = "Enter your password",
}) {
  const [isVisible, setIsVisible] = useState(false);

  const checks = getPasswordChecks(value);
  const strength = getPasswordStrength(value);

  return (
    <div>
      <label className="text-sm font-normal text-[#585958]">
        {label} <span className="text-[#F7631E]">*</span>
      </label>

      <div className="relative mt-2">
        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-12 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
            error ? "border-red-300" : "border-slate-200"
          }`}
        />

        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#F7631E]"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs font-normal text-red-500">{error}</p>
      ) : null}

      {showStrength ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-[#F9FBFB] p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-normal text-[#585958]">
              Password strength
            </p>

            <p className={`text-xs font-medium ${strength.textClassName}`}>
              {strength.label}
            </p>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${strength.className}`}
              style={{ width: strength.barWidth }}
            />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <PasswordRule passed={checks.length}>8+ characters</PasswordRule>
            <PasswordRule passed={checks.uppercase}>Uppercase letter</PasswordRule>
            <PasswordRule passed={checks.lowercase}>Lowercase letter</PasswordRule>
            <PasswordRule passed={checks.number}>Number</PasswordRule>
            <PasswordRule passed={checks.symbol}>Symbol</PasswordRule>
          </div>
        </div>
      ) : null}
    </div>
  );
}