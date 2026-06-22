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
    <label className={`flex h-10 items-center gap-3 max-md:h-10.5 max-md:gap-3.5 ${className}`}>
      <span className="shrink-0 text-search-placeholder">{icon}</span>
      <input
        ref={inputRef}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name === "location" ? "off" : undefined}
        className="w-full bg-transparent text-[13px] font-medium text-main-text outline-none placeholder:text-search-placeholder dark:text-white max-md:text-[16px]"
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
        className="relative h-36 overflow-hidden bg-secondary-blue max-md:h-30"
      >
        <HeroPattern />

        <div className="relative mx-auto flex h-full max-w-360 flex-col px-17 pt-6.5 max-xl:px-10 max-md:justify-center max-md:px-7 max-md:pt-0">
          <h1 className="max-w-140 whitespace-nowrap text-2xl font-semibold leading-normal text-white max-md:max-w-none max-md:whitespace-normal max-md:text-[14px] max-md:leading-none">
            <span className="max-md:hidden">
              Sri Lanka&rsquo;s smarter place for jobs and hiring
            </span>
            <span className="hidden max-md:inline">Find your dream job</span>
          </h1>
          <p className="mt-2.5 max-w-144.5 text-[14px] font-normal leading-[22px] text-white max-md:mt-2 max-md:max-w-52 max-md:whitespace-normal max-md:text-[10px] max-md:leading-[12px]">
            <span className="max-md:hidden">
              <span className="font-bold">Accdoo Jobs</span> uses AI-powered
              insights to help job seekers discover better roles and employers
              find the right talent faster.
            </span>
            <span className="hidden max-md:inline">
              Connect talent with opportunity through smarter hiring
            </span>
          </p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-360 px-17 pt-6 max-xl:px-10 max-md:px-4 max-md:pt-0">
        <form
          onSubmit={handleSubmit}
          className={`relative z-10 mx-auto w-full max-w-315 rounded-xl border border-search-border bg-search-surface px-8.5 pb-4 pt-4 shadow-search dark:border-slate-800 dark:bg-slate-950 dark:shadow-search-dark max-md:mt-7 max-md:rounded-xl max-md:px-6 max-md:pb-7 max-md:pt-5 ${
            showMobileFilters ? "max-md:h-auto" : "max-md:h-[188px]"
          }`}
        >
          <div className="grid grid-cols-[1fr_1px_1fr_112px] items-center max-md:block">
            <SearchField
              icon={<FiSearch size={17} />}
              name="search"
              value={filters.search}
              placeholder="Job title or keywords"
              onChange={handleInputChange}
            />

            <div
              className="h-10 bg-menu-border dark:bg-slate-800 max-md:mt-2 max-md:h-px max-md:w-full"
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

            <div
              className="hidden h-px w-full bg-menu-border dark:bg-slate-800 max-md:block"
            />

            <div className="flex justify-end max-md:justify-center max-md:pt-4">
              <button
                type="submit"
                className="h-10 w-28 rounded-md bg-secondary-blue text-[12px] font-semibold leading-none text-white shadow-action transition hover:bg-secondary-blue-dark active:scale-98 max-md:h-10.5 max-md:w-40 max-md:bg-amber-500 max-md:text-[18px] max-md:hover:bg-amber-600"
              >
                Search
              </button>
            </div>
          </div>

          <div
            className="mt-4 h-px w-full bg-menu-border dark:bg-slate-800 max-md:hidden"
          />

          <div className="mt-4 flex items-center gap-4 max-md:hidden">
            <div className="flex items-center gap-3.5">
              <FilterControls filters={filters} onChange={updateFilter} />
            </div>

            <button
              type="button"
              onClick={handleClear}
              className={`ml-auto rounded-md px-2 py-1.5 text-[12px] font-medium leading-none text-red-500 transition active:scale-98 ${
                hasActiveFilters ? "bg-red-500/10" : "hover:bg-red-500/10"
              }`}
            >
              Clear
            </button>
          </div>

          {showMobileFilters ? (
            <div
              className="hidden border-t border-menu-border pt-3.25 dark:border-white/10 max-md:mt-4 max-md:grid max-md:grid-cols-2 max-md:gap-2"
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
          className="mx-auto mt-4 hidden items-center gap-2 text-[12px] font-medium text-[#8B8993] max-md:flex"
        >
          <FiSliders size={16} />
          {showMobileFilters ? "Hide Filters" : "More Filters"}
        </button>
      </div>
    </section>
  );
}
