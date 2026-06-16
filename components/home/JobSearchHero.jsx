"use client";

import { useEffect, useRef, useState } from "react";
import { FiMapPin, FiSearch, FiSliders } from "react-icons/fi";

import HeroPattern from "@/components/home/HeroPattern";
import { homeInter } from "@/components/home/homeFonts";
import {
  MultiTechStackDropdown,
  SingleFilterDropdown,
} from "@/components/home/SearchFilterDropdowns";
const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";

const INITIAL_FILTERS = {
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

      const waitForGoogle = window.setInterval(() => {
        if (window.google?.maps?.places) {
          window.clearInterval(waitForGoogle);
          resolve();
        }
      }, 150);

      window.setTimeout(() => window.clearInterval(waitForGoogle), 7000);
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

function SearchField({
  icon,
  inputRef,
  name,
  value,
  placeholder,
  onChange,
  className = "",
}) {
  return (
    <label
      className={`flex h-8 items-center gap-3 max-md:h-9 ${className}`}
    >
      <span className="shrink-0 text-search-placeholder">{icon}</span>
      <input
        ref={inputRef}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name === "location" ? "off" : undefined}
        className="w-full bg-transparent text-[12px] font-medium text-main-text outline-none placeholder:text-search-placeholder dark:text-white max-md:text-[12px]"
      />
    </label>
  );
}

function FilterControls({ filters, onChange, onClear }) {
  return (
    <>
      <SingleFilterDropdown
        name="jobType"
        value={filters.jobType}
        options={FILTER_GROUPS.jobType}
        onChange={onChange}
      />
      <SingleFilterDropdown
        name="workMode"
        value={filters.workMode}
        options={FILTER_GROUPS.workMode}
        onChange={onChange}
        width="modality"
      />
      <MultiTechStackDropdown
        options={TECH_STACKS}
        selectedValues={filters.techStacks}
        onChange={onChange}
      />
      <SingleFilterDropdown
        name="salaryRange"
        value={filters.salaryRange}
        options={FILTER_GROUPS.salaryRange}
        onChange={onChange}
        width="salary"
      />
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="col-span-2 h-8 rounded-[5px] border border-red-500/25 bg-red-500/10 text-[11px] font-semibold text-red-500"
        >
          Clear Filters
        </button>
      ) : null}
    </>
  );
}

export default function JobSearchHero() {
  const locationInputRef = useRef(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    publishJobFilters(filters);
  }, [filters]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) return;

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
        // Location autocomplete is optional; manual entry remains available.
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
    updateFilter(event.target.name, event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    publishJobFilters(filters);
  }

  function handleClear() {
    setFilters(INITIAL_FILTERS);
    publishJobFilters(INITIAL_FILTERS);
  }

  const hasActiveFilters = Object.entries(filters).some(([, value]) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

  return (
    <section className={homeInter.className}>
      <div
        className="relative h-19.5 overflow-hidden bg-secondary-blue max-md:h-21"
      >
        <HeroPattern />

        <div className="relative mx-auto flex h-full max-w-360 flex-col justify-center px-17 max-xl:px-10 max-md:px-6">
          <h1 className="whitespace-nowrap text-[17px] font-semibold leading-none text-white max-md:whitespace-normal max-md:text-[14px]">
            Sri Lanka’s smarter place for jobs and hiring
          </h1>
          <p className="mt-2.25 whitespace-nowrap text-[10px] font-medium leading-none text-white max-md:mt-2 max-md:max-w-64 max-md:whitespace-normal max-md:text-[9px] max-md:leading-tight">
            <span className="font-bold">Accdoo Jobs</span> uses AI-powered
            insights to help job seekers discover better roles and employers
            find the right talent faster.
          </p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-360 px-17 max-xl:px-10 max-md:px-6">
        <form
          onSubmit={handleSubmit}
          className="relative z-10 mx-auto mt-4.5 w-full max-w-315 rounded-xl border border-search-border bg-search-surface px-6 pb-3 pt-3 shadow-search dark:border-slate-800 dark:bg-slate-950 dark:shadow-search-dark max-md:mt-7 max-md:rounded-[10px] max-md:px-3.75 max-md:py-4"
        >
          <div className="grid grid-cols-[1fr_1px_1fr_80px] items-center max-md:block">
            <SearchField
              icon={<FiSearch size={16} />}
              name="search"
              value={filters.search}
              placeholder="Job title or keywords"
              onChange={handleInputChange}
            />

            <div
              className="h-8 bg-menu-border dark:bg-slate-800 max-md:mt-2 max-md:h-px max-md:w-full"
            />

            <SearchField
              icon={<FiMapPin size={17} />}
              inputRef={locationInputRef}
              name="location"
              value={filters.location}
              placeholder="Anywhere"
              onChange={handleInputChange}
              className="pl-6 pr-4 max-md:pl-0 max-md:pr-0"
            />

            <div className="flex justify-end max-md:justify-center max-md:pt-3">
              <button
                type="submit"
                className="h-8 w-20 rounded-md bg-amber-500 text-[11px] font-semibold leading-none text-white shadow-action transition hover:bg-amber-600 active:scale-98 max-md:h-9.5 max-md:w-full"
              >
                Search
              </button>
            </div>
          </div>

          <div
            className="mt-2.5 h-px w-full bg-menu-border dark:bg-slate-800 max-md:hidden"
          />

          <div className="mt-2.5 flex items-center gap-4 max-md:hidden">
            <div className="flex items-center gap-3">
              <FilterControls filters={filters} onChange={updateFilter} />
            </div>

            <button
              type="button"
              onClick={handleClear}
              className={`ml-auto rounded-md px-2 py-1.5 text-[11px] font-medium leading-none text-red-500 transition active:scale-98 ${
                hasActiveFilters ? "bg-red-500/10" : "hover:bg-red-500/10"
              }`}
            >
              Clear
            </button>
          </div>

          {showMobileFilters ? (
            <div
              className="hidden border-t border-menu-border pt-3.25 dark:border-white/10 max-md:grid max-md:grid-cols-2 max-md:gap-2"
            >
              <FilterControls
                filters={filters}
                onChange={updateFilter}
                onClear={handleClear}
              />
            </div>
          ) : null}
        </form>

        <button
          type="button"
          onClick={() => setShowMobileFilters((current) => !current)}
          className="mx-auto mt-4.75 hidden items-center gap-1.75 text-[10px] font-semibold text-text-muted max-md:flex"
        >
          <FiSliders size={12} />
          {showMobileFilters ? "Hide Filters" : "More Filters"}
        </button>
      </div>
    </section>
  );
}
