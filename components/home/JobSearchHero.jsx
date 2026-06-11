"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiMapPin,
  FiSearch,
  FiSliders,
} from "react-icons/fi";

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";

const initialFilters = {
  search: "",
  location: "",
  jobType: "",
  workMode: "",
  salaryRange: "",
  techStacks: [],
};

const FILTER_GROUPS = {
  jobType: [
    { label: "Job Type", value: "" },
    { label: "Internship", value: "internship" },
    { label: "Full-time", value: "full-time" },
    { label: "Part-time", value: "part-time" },
    { label: "Contract", value: "contract" },
  ],
  workMode: [
    { label: "Modality", value: "" },
    { label: "Onsite", value: "onsite" },
    { label: "Hybrid", value: "hybrid" },
    { label: "Remote", value: "remote" },
  ],
  salaryRange: [
    { label: "Salary", value: "" },
    { label: "Below LKR 50K", value: "0-50000" },
    { label: "LKR 50K - 100K", value: "50000-100000" },
    { label: "LKR 100K - 200K", value: "100000-200000" },
    { label: "Above LKR 200K", value: "200000+" },
  ],
};

const TECH_STACKS = [
  { label: "React", value: "react" },
  { label: "Next.js", value: "next" },
  { label: "FastAPI", value: "fastapi" },
  { label: "Python", value: "python" },
  { label: "JavaScript", value: "javascript" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "MongoDB", value: "mongodb" },
  { label: "Node.js", value: "node" },
];

const UI = {
  heroBlue: "#2563FF",
  softText: "#B6B3C1",
  softLine: "#DEDDE8",
  filterBorder: "#C9C7D8",
  filterText: "#0C203A",
  activeBlue: "#2563FF",
  clearRed: "#FF3347",
  searchOrange: "#F9A11B",
};

function publishJobFilters(filters) {
  window.dispatchEvent(
    new CustomEvent("AccDoo:jobFiltersChanged", {
      detail: filters,
    })
  );
}

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;

    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });

      const waitForGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(waitForGoogle);
          resolve();
        }
      }, 150);

      setTimeout(() => {
        clearInterval(waitForGoogle);
      }, 7000);

      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;

    document.body.appendChild(script);
  });
}

function getSelectedLabel(options, value) {
  return (
    options.find((option) => option.value === value)?.label || options[0].label
  );
}

function FilterButton({ children, isActive, isOpen, onClick, width = "normal" }) {
  const textColor = isActive ? UI.activeBlue : UI.filterText;

  const widthClass =
    width === "tech"
      ? "min-w-[112px]"
      : width === "modality"
        ? "min-w-[101px]"
        : width === "salary"
          ? "min-w-[82px]"
          : "min-w-[92px]";

  const textWidthClass =
    width === "tech"
      ? "max-w-[84px]"
      : width === "modality"
        ? "max-w-[73px]"
        : width === "salary"
          ? "max-w-[56px]"
          : "max-w-[64px]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[30px] ${widthClass} items-center justify-between gap-[8px] rounded-[5px] border px-[11px] text-[11px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-[#2563FF] hover:bg-[#F8FAFF] ${
        isActive ? "bg-[#EEF4FF]" : "bg-white"
      }`}
      style={{
        color: textColor,
        borderColor: isActive ? UI.activeBlue : UI.filterBorder,
        backgroundColor: isActive ? "#EEF4FF" : "#FFFFFF",
      }}
    >
      <span className={`block truncate ${textWidthClass}`} style={{ color: textColor }}>
        {children}
      </span>

      <FiChevronDown
        size={12}
        className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
        style={{ color: textColor }}
      />
    </button>
  );
}

function SingleFilterDropdown({
  name,
  value,
  options,
  onChange,
  width = "normal",
}) {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleSelect(nextValue) {
    onChange(name, nextValue);
    setIsOpen(false);
  }

  const hasValue = Boolean(value);
  const label = getSelectedLabel(options, value);

  return (
    <div ref={wrapperRef} className="relative">
      <FilterButton
        isActive={hasValue}
        isOpen={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        width={width}
      >
        {label}
      </FilterButton>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[185px] overflow-hidden rounded-[10px] border border-[var(--line-soft)] bg-[var(--surface-bg)] py-2 shadow-2xl shadow-black/15">
          {options.map((option) => (
            <button
              key={`${name}-${option.label}`}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`block w-full px-4 py-2.5 text-left text-[12px] font-semibold transition ${
                option.value === value
                  ? "bg-[#EEF4FF] dark:bg-[#2563FF]/15"
                  : "hover:bg-[#F7FAFF] dark:hover:bg-white/[0.06]"
              }`}
              style={{
                color: option.value === value ? UI.activeBlue : "var(--text-main)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MultiTechStackDropdown({ selectedValues, onChange }) {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function toggleTechStack(value) {
    const alreadySelected = selectedValues.includes(value);

    if (alreadySelected) {
      onChange(
        "techStacks",
        selectedValues.filter((item) => item !== value)
      );
      return;
    }

    onChange("techStacks", [...selectedValues, value]);
  }

  const label =
    selectedValues.length === 0
      ? "Tech Stack"
      : `${selectedValues.length} selected`;

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
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[205px] overflow-hidden rounded-[10px] border border-[var(--line-soft)] bg-[var(--surface-bg)] py-2 shadow-2xl shadow-black/15">
          {TECH_STACKS.map((option) => {
            const isSelected = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleTechStack(option.value)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[12px] font-semibold transition ${
                  isSelected
                    ? "bg-[#EEF4FF] dark:bg-[#2563FF]/15"
                    : "hover:bg-[#F7FAFF] dark:hover:bg-white/[0.06]"
                }`}
                style={{
                  color: isSelected ? UI.activeBlue : "var(--text-main)",
                }}
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
              className="mt-1 block w-full border-t border-[var(--line-soft)] px-4 py-2.5 text-left text-[12px] font-semibold hover:bg-[#F7FAFF] dark:hover:bg-white/[0.06]"
              style={{ color: "var(--text-muted)" }}
            >
              Clear tech stack
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HeroPattern() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 w-[610px] overflow-hidden max-md:w-[200px]">
      <span className="absolute right-[320px] top-[-8px] h-[30px] w-[205px] rotate-[-24deg] bg-[#061426] max-md:right-[92px] max-md:top-[-7px] max-md:h-[17px] max-md:w-[76px]" />
      <span className="absolute right-[310px] top-[52px] h-[30px] w-[92px] rotate-[-69deg] bg-white max-md:right-[118px] max-md:top-[47px] max-md:h-[20px] max-md:w-[42px]" />
      <span className="absolute right-[178px] top-[27px] h-[30px] w-[238px] rotate-[45deg] bg-[#B9DBF5] max-md:right-[38px] max-md:top-[16px] max-md:h-[19px] max-md:w-[88px]" />
      <span className="absolute right-[75px] top-[18px] h-[31px] w-[320px] rotate-[43deg] bg-[#061426] max-md:right-[-4px] max-md:top-[7px] max-md:h-[20px] max-md:w-[126px]" />
      <span className="absolute right-[67px] top-[-11px] h-[30px] w-[108px] rotate-[-49deg] bg-[#B9DBF5] max-md:right-[20px] max-md:top-[-4px] max-md:h-[19px] max-md:w-[43px]" />
      <span className="absolute right-[-12px] top-[33px] h-[29px] w-[122px] rotate-[-3deg] bg-white max-md:right-[-18px] max-md:top-[27px] max-md:h-[18px] max-md:w-[54px]" />
      <span className="absolute right-[-64px] bottom-[-20px] h-[32px] w-[180px] rotate-[-14deg] bg-[#061426] max-md:right-[-45px] max-md:bottom-[-13px] max-md:h-[20px] max-md:w-[78px]" />
    </div>
  );
}

export default function JobSearchHero() {
  const locationInputRef = useRef(null);

  const [filters, setFilters] = useState(initialFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    publishJobFilters(filters);
  }, [filters]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return;
    }

    let autocompleteInstance = null;
    let isMounted = true;

    async function initializeGooglePlaces() {
      try {
        await loadGoogleMapsScript(apiKey);

        if (
          !isMounted ||
          !locationInputRef.current ||
          !window.google?.maps?.places
        ) {
          return;
        }

        autocompleteInstance = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["(cities)"],
            componentRestrictions: { country: "lk" },
            fields: ["formatted_address", "name"],
          }
        );

        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          const selectedLocation =
            place.formatted_address ||
            place.name ||
            locationInputRef.current.value;

          setFilters((currentFilters) => ({
            ...currentFilters,
            location: selectedLocation,
          }));
        });
      } catch {
        // optional
      }
    }

    initializeGooglePlaces();

    return () => {
      isMounted = false;

      if (autocompleteInstance && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, []);

  function updateFilter(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    updateFilter(name, value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    publishJobFilters(filters);
  }

  function handleClear() {
    setFilters(initialFilters);
    publishJobFilters(initialFilters);

    if (locationInputRef.current) {
      locationInputRef.current.value = "";
    }
  }

  const hasActiveFilters =
    filters.search ||
    filters.location ||
    filters.jobType ||
    filters.workMode ||
    filters.salaryRange ||
    filters.techStacks.length > 0;

  return (
    <section className="font-sans">
      <div
        className="relative h-[86px] overflow-hidden max-md:h-[84px]"
        style={{ backgroundColor: UI.heroBlue }}
      >
        <HeroPattern />

        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-center px-[68px] max-xl:px-10 max-md:px-[24px]">
          <h1 className="text-[22px] font-semibold leading-none tracking-[-0.03em] text-white max-md:text-[14px]">
            Find your dream job
          </h1>

          <p className="mt-[13px] max-w-[520px] text-[11px] font-medium leading-none text-white max-md:mt-[9px] max-md:max-w-[225px] max-md:text-[9px] max-md:leading-[1.25]">
            Connect talent with opportunity through smarter hiring
          </p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-[68px] max-xl:px-10 max-md:px-[24px]">
        <form
          onSubmit={handleSubmit}
          className="relative z-10 mx-auto mt-[20px] w-full max-w-[1260px] rounded-[8px] bg-[var(--surface-bg)] px-[32px] pb-[17px] pt-[17px] shadow-[0_16px_42px_rgba(15,23,42,0.07)] ring-1 ring-black/[0.035] dark:ring-white/[0.04] max-md:mt-[28px] max-md:rounded-[9px] max-md:px-[15px] max-md:py-[16px]"
        >
          <div className="grid grid-cols-[1fr_1px_1fr_94px] items-center max-md:block">
            <label className="flex h-[40px] items-center gap-[14px] max-md:h-[36px]">
              <FiSearch
                size={17}
                className="shrink-0 max-md:h-[15px] max-md:w-[15px]"
                style={{ color: UI.softText }}
              />
              <input
                name="search"
                value={filters.search}
                onChange={handleInputChange}
                placeholder="Job title or keywords"
                className="w-full bg-transparent text-[15px] font-medium text-[var(--text-main)] outline-none placeholder:text-[#B6B3C1] dark:placeholder:text-[#5F6878] max-md:text-[12px]"
              />
            </label>

            <div
              className="h-[40px] max-md:mt-[8px] max-md:h-px max-md:w-full"
              style={{ backgroundColor: UI.softLine }}
            />

            <label className="flex h-[40px] items-center gap-[14px] pl-[30px] pr-[18px] max-md:h-[36px] max-md:pl-0 max-md:pr-0">
              <FiMapPin
                size={18}
                className="shrink-0 max-md:h-[15px] max-md:w-[15px]"
                style={{ color: UI.softText }}
              />
              <input
                ref={locationInputRef}
                name="location"
                value={filters.location}
                onChange={handleInputChange}
                placeholder="Anywhere"
                autoComplete="off"
                className="w-full bg-transparent text-[15px] font-medium text-[var(--text-main)] outline-none placeholder:text-[#B6B3C1] dark:placeholder:text-[#5F6878] max-md:text-[12px]"
              />
            </label>

            <div className="flex justify-end max-md:justify-center max-md:pt-[12px]">
              <button
                type="submit"
                className="h-[48px] w-[119px] rounded-[8px] text-[12px] font-semibold shadow-[0_8px_18px_rgba(249,161,27,0.18)] transition hover:bg-[#e89109] active:scale-[0.98] max-md:h-[38px] max-md:w-[118px] max-md:text-[11px]"
                style={{ color: "#FFFFFF", backgroundColor: UI.searchOrange }}
              >
                Search
              </button>
            </div>
          </div>

          <div
            className="mt-[13px] h-px w-full max-md:hidden"
            style={{ backgroundColor: UI.softLine }}
          />

          <div className="mt-[22px] flex items-center gap-[20px] max-md:hidden">
            <div className="flex items-center gap-[16px]">
              <SingleFilterDropdown
                name="jobType"
                value={filters.jobType}
                options={FILTER_GROUPS.jobType}
                onChange={updateFilter}
              />

              <SingleFilterDropdown
                name="workMode"
                value={filters.workMode}
                options={FILTER_GROUPS.workMode}
                onChange={updateFilter}
                width="modality"
              />

              <MultiTechStackDropdown
                selectedValues={filters.techStacks}
                onChange={updateFilter}
              />

              <SingleFilterDropdown
                name="salaryRange"
                value={filters.salaryRange}
                options={FILTER_GROUPS.salaryRange}
                onChange={updateFilter}
                width="salary"
              />
            </div>

            <button
              type="button"
              onClick={handleClear}
              className={`ml-auto rounded-[5px] px-[10px] py-[6px] text-[11px] font-semibold transition active:scale-[0.98] ${
                hasActiveFilters ? "bg-[#FF3347]/10" : "hover:bg-[#FF3347]/10"
              }`}
              style={{ color: UI.clearRed }}
            >
              Clear
            </button>
          </div>

          {showMobileFilters ? (
            <div className="hidden border-t border-[var(--line-soft)] pt-[13px] max-md:grid max-md:grid-cols-2 max-md:gap-[8px]">
              <SingleFilterDropdown
                name="jobType"
                value={filters.jobType}
                options={FILTER_GROUPS.jobType}
                onChange={updateFilter}
              />

              <SingleFilterDropdown
                name="workMode"
                value={filters.workMode}
                options={FILTER_GROUPS.workMode}
                onChange={updateFilter}
                width="modality"
              />

              <MultiTechStackDropdown
                selectedValues={filters.techStacks}
                onChange={updateFilter}
              />

              <SingleFilterDropdown
                name="salaryRange"
                value={filters.salaryRange}
                options={FILTER_GROUPS.salaryRange}
                onChange={updateFilter}
                width="salary"
              />

              <button
                type="button"
                onClick={handleClear}
                className="col-span-2 h-[32px] rounded-[5px] border border-[#FF3347]/25 bg-[#FF3347]/10 text-[11px] font-semibold"
                style={{ color: UI.clearRed }}
              >
                Clear Filters
              </button>
            </div>
          ) : null}
        </form>

        <button
          type="button"
          onClick={() => setShowMobileFilters((current) => !current)}
          className="mx-auto mt-[19px] hidden items-center gap-[7px] text-[10px] font-semibold text-[var(--text-muted)] max-md:flex"
        >
          <FiSliders size={12} />
          {showMobileFilters ? "Hide Filters" : "More Filters"}
        </button>
      </div>
    </section>
  );
}