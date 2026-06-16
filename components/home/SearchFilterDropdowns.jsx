"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

const WIDTH_CLASSES = {
  normal: {
    button: "min-w-23 max-md:w-full",
  },
  modality: {
    button: "min-w-25.25 max-md:w-full",
  },
  salary: {
    button: "min-w-20.5 max-md:w-full",
  },
  tech: {
    button: "min-w-28 max-md:w-full",
  },
};

function useOutsideClick(onOutsideClick) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        onOutsideClick();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onOutsideClick]);

  return wrapperRef;
}

function FilterButton({
  children,
  isActive,
  isOpen,
  onClick,
  width = "normal",
}) {
  const widthClasses = WIDTH_CLASSES[width] || WIDTH_CLASSES.normal;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={`inline-flex h-7.5 items-center justify-between gap-2 rounded-md border px-2.75 text-[11px] font-medium leading-none shadow-control transition hover:-translate-y-px active:scale-98 ${widthClasses.button} ${
        isActive
          ? "border-secondary-blue bg-filter-active text-secondary-blue dark:border-blue-200 dark:bg-white/5 dark:text-blue-200"
          : "border-filter-border bg-filter-surface text-main-text dark:border-blue-200 dark:bg-transparent dark:text-blue-200"
      }`}
    >
      <span className="whitespace-nowrap">{children}</span>
      <FiChevronDown
        size={12}
        className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
}

export function SingleFilterDropdown({
  name,
  value,
  options,
  onChange,
  width = "normal",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useOutsideClick(() => setIsOpen(false));
  const label =
    options.find((option) => option.value === value)?.label || options[0].label;

  function handleSelect(nextValue) {
    onChange(name, nextValue);
    setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <FilterButton
        isActive={Boolean(value)}
        isOpen={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        width={width}
      >
        {label}
      </FilterButton>

      {isOpen ? (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-40 w-46.25 overflow-hidden rounded-[10px] border border-menu-border bg-white py-2 text-main-text shadow-2xl shadow-black/15 dark:border-white/10 dark:bg-slate-900 dark:text-white/80"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={`${name}-${option.label}`}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`block w-full px-4 py-2.5 text-left text-[14px] font-medium transition ${
                  isSelected
                    ? "bg-menu-selected text-secondary-blue dark:bg-secondary-blue/15 dark:text-blue-200"
                    : "text-main-text dark:text-white/80"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function MultiTechStackDropdown({
  options,
  selectedValues,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useOutsideClick(() => setIsOpen(false));
  const label =
    selectedValues.length === 0
      ? "Tech Stack"
      : `${selectedValues.length} selected`;

  function toggleTechStack(value) {
    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    onChange("techStacks", nextValues);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <FilterButton
        isActive={selectedValues.length > 0}
        isOpen={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        width="tech"
      >
        {label}
      </FilterButton>

      {isOpen ? (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-40 w-51.25 overflow-hidden rounded-[10px] border border-menu-border bg-white py-2 text-main-text shadow-2xl shadow-black/15 dark:border-white/10 dark:bg-slate-900 dark:text-white/80"
        >
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleTechStack(option.value)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] font-medium transition ${
                  isSelected
                    ? "bg-menu-selected text-secondary-blue dark:bg-secondary-blue/15 dark:text-blue-200"
                    : "text-main-text dark:text-white/80"
                }`}
              >
                {option.label}
                {isSelected ? <FiCheck size={14} /> : null}
              </button>
            );
          })}

          {selectedValues.length ? (
            <button
              type="button"
              onClick={() => onChange("techStacks", [])}
              className="mt-1 block w-full border-t border-menu-border px-4 py-2.5 text-left text-[14px] font-medium text-slate-400 dark:border-white/10 dark:text-white/60"
            >
              Clear tech stack
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
