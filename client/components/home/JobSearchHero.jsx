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
    { label: "Below 50K", value: "0-50000" },
    { label: "50K - 100K", value: "50000-100000" },
    { label: "100K - 200K", value: "100000-200000" },
    { label: "Above 200K", value: "200000+" },
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
    new CustomEvent("jobsera:jobFiltersChanged", {
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
  return options.find((option) => option.value === value)?.label || options[0].label;
}

function SingleFilterDropdown({ name, value, options, onChange }) {
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

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex min-w-[145px] items-center justify-between gap-5 rounded-lg border bg-white px-5 py-3 text-[15px] font-normal text-[#202020] transition ${
          isOpen
            ? "border-[#F7631E] shadow-sm"
            : "border-slate-200 hover:border-[#F7631E]"
        }`}
      >
        {getSelectedLabel(options, value)}
        <FiChevronDown
          size={17}
          className={`transition ${isOpen ? "rotate-180 text-[#F7631E]" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-2xl shadow-slate-900/10">
          {options.map((option) => (
            <button
              key={`${name}-${option.label}`}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`block w-full px-4 py-2.5 text-left text-sm font-normal transition ${
                option.value === value
                  ? "bg-orange-50 text-[#F7631E]"
                  : "text-[#202020] hover:bg-slate-50"
              }`}
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
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex min-w-[160px] items-center justify-between gap-5 rounded-lg border bg-white px-5 py-3 text-[15px] font-normal text-[#202020] transition ${
          isOpen
            ? "border-[#F7631E] shadow-sm"
            : "border-slate-200 hover:border-[#F7631E]"
        }`}
      >
        {label}
        <FiChevronDown
          size={17}
          className={`transition ${isOpen ? "rotate-180 text-[#F7631E]" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-2xl shadow-slate-900/10">
          {TECH_STACKS.map((option) => {
            const isSelected = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleTechStack(option.value)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-normal transition ${
                  isSelected
                    ? "bg-orange-50 text-[#F7631E]"
                    : "text-[#202020] hover:bg-slate-50"
                }`}
              >
                {option.label}
                {isSelected ? <FiCheck size={16} /> : null}
              </button>
            );
          })}

          {selectedValues.length ? (
            <button
              type="button"
              onClick={() => onChange("techStacks", [])}
              className="mt-1 block w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-normal text-slate-500 hover:bg-slate-50"
            >
              Clear tech stack
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function JobSearchHero() {
  const locationInputRef = useRef(null);

  const [filters, setFilters] = useState(initialFilters);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    publishJobFilters(filters);
  }, [filters]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setLocationError("Google location key missing.");
      return;
    }

    let autocompleteInstance = null;
    let isMounted = true;

    async function initializeGooglePlaces() {
      try {
        await loadGoogleMapsScript(apiKey);

        if (!isMounted || !locationInputRef.current) return;

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
            place.formatted_address || place.name || locationInputRef.current.value;

          setFilters((currentFilters) => ({
            ...currentFilters,
            location: selectedLocation,
          }));
        });
      } catch {
        setLocationError("Google location suggestions failed to load.");
      }
    }

    initializeGooglePlaces();

    return () => {
      isMounted = false;
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

  return (
    <section className="bg-[#F9FBFB] px-6 pt-14 pb-0 font-sans lg:px-8">
      <div className="mx-auto max-w-36.2517.5pxxl">
        <div className="max-w-[450px]xl pb-20">
          <h1 className="max-w-[450px]xl text-[38px] font-medium leading-[1.15] tracking-tight text-[#202020] md:text-[54px] lg:text-[60px]">
            Connect talent with opportunity through smarter hiring
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="-mt-8 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70"
        >
          <div className="grid gap-0 lg:grid-cols-[1fr_1px_1fr_170px]">
            <label className="flex items-center gap-5 px-7 py-6">
              <FiSearch className="shrink-0 text-slate-400" size={25} />
              <input
                name="search"
                value={filters.search}
                onChange={handleInputChange}
                placeholder="Job title or keywords"
                className="w-full bg-transparent text-[18px] font-normal text-[#585958] outline-none placeholder:text-slate-300"
              />
            </label>

            <div className="hidden bg-slate-200 lg:block" />

            <label className="flex items-center gap-5 border-t border-slate-100 px-7 py-6 lg:border-t-0">
              <FiMapPin className="shrink-0 text-slate-400" size={25} />
              <input
                ref={locationInputRef}
                name="location"
                value={filters.location}
                onChange={handleInputChange}
                placeholder="Anywhere"
                autoComplete="off"
                className="w-full bg-transparent text-[18px] font-normal text-[#585958] outline-none placeholder:text-slate-300"
              />
            </label>

            <div className="px-5 py-4">
              <button
                type="submit"
                className="h-full w-full rounded-xl bg-[#F7631E] px-7 py-4 text-[16px] font-medium text-white transition hover:bg-[#e85512]"
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 px-4 py-5 md:px-6">
            <span className="inline-flex items-center gap-2 text-sm font-normal text-[#585958]">
              <FiSliders size={16} />
              Filters:
            </span>

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
            />

            <button
              type="button"
              onClick={handleClear}
              className="ml-auto rounded-lg px-4 py-2.5 text-[15px] font-normal text-[#F7631E] transition hover:bg-orange-50"
            >
              Clear
            </button>

            {locationError ? (
              <p className="basis-full text-xs font-normal text-orange-500">
                {locationError}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}