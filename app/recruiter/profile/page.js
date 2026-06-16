"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBriefcase,
  FiCheckCircle,
  FiGlobe,
  FiLoader,
  FiMapPin,
  FiPhone,
  FiSave,
} from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";

import Navbar from "@/components/common/Navbar";
import {
  activateRecruiterProfile,
  getMyRecruiterProfile,
  updateMyRecruiterProfile,
} from "@/lib/api/recruiterApi";
import { getAccessToken } from "@/lib/utils/tokenStorage";

const GOOGLE_MAPS_SCRIPT_ID = "accdoo-google-maps-places-script";

const initialFormData = {
  company_name: "",
  company_website: "",
  company_location: "",
  contact_phone: "",
};

const inputClass =
  "w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50";

const labelClass = "text-sm font-normal text-[#585958]";

function RequiredMark() {
  return <span className="text-[#F7631E]">*</span>;
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-normal text-red-500">{message}</p>;
}

function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizePhoneNumber(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function sanitizeCompanyName(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 .&()-]/g, "")
    .replace(/\s+/g, " ");
}

function sanitizeLocation(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 ,./-]/g, "")
    .replace(/\s+/g, " ");
}

function sanitizeWebsite(value) {
  return String(value || "")
    .replace(/\s/g, "")
    .replace(/[^A-Za-z0-9.:/?#&=_+-]/g, "");
}

function validateRecruiterProfile(formData) {
  const errors = {};
  const companyName = cleanText(formData.company_name);
  const location = cleanText(formData.company_location);
  const phone = normalizePhoneNumber(formData.contact_phone);
  const website = cleanText(formData.company_website);

  if (!companyName) {
    errors.company_name = "Company name is required.";
  } else if (companyName.length < 2) {
    errors.company_name = "Company name must be at least 2 characters.";
  } else if (!/^[A-Za-z0-9 .&()-]+$/.test(companyName)) {
    errors.company_name =
      "Company name can use only letters, numbers, spaces, dot, &, hyphen, or brackets.";
  }

  if (website) {
    const websitePattern =
      /^(https?:\/\/)?([A-Za-z0-9-]+\.)+[A-Za-z]{2,}(\/.*)?$/;

    if (!websitePattern.test(website)) {
      errors.company_website =
        "Enter a valid website. Example: https://example.com";
    }
  }

  if (!location) {
    errors.company_location = "Company location is required.";
  } else if (!/^[A-Za-z0-9 ,./-]+$/.test(location)) {
    errors.company_location =
      "Location can use only letters, numbers, spaces, comma, dot, slash, or hyphen.";
  }

  if (!phone) {
    errors.contact_phone = "Contact number is required.";
  } else if (!/^0[0-9]{9}$/.test(phone)) {
    errors.contact_phone =
      "Enter a valid 10-digit mobile number. Example: 0701234000";
  }

  return errors;
}

function injectGooglePlacesDropdownStyles() {
  if (typeof document === "undefined") return;

  const styleId = "accdoo-google-places-style";

  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = `
    .pac-container {
      z-index: 999999 !important;
      border-radius: 16px !important;
      margin-top: 8px !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12) !important;
      font-family: inherit !important;
      overflow: hidden !important;
    }

    .pac-item {
      padding: 12px 14px !important;
      font-size: 14px !important;
      cursor: pointer !important;
    }

    .pac-item:hover {
      background: #fff7ed !important;
    }

    .pac-item-query {
      color: #202020 !important;
      font-size: 14px !important;
      font-weight: 500 !important;
    }
  `;

  document.head.appendChild(style);
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

export default function RecruiterProfilePage() {
  const router = useRouter();
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validationErrors = validateRecruiterProfile(formData);

  const visibleErrors = Object.fromEntries(
    Object.entries(validationErrors).filter(
      ([field]) => touched[field] || submitAttempted
    )
  );

  async function loadRecruiterProfile() {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    setErrorMessage("");

    try {
      setIsLoading(true);

      const profile = await getMyRecruiterProfile();

      setProfileExists(true);
      setFormData({
        company_name: profile.company_name || "",
        company_website: profile.company_website || "",
        company_location: profile.company_location || "",
        contact_phone: profile.contact_phone || "",
      });
    } catch {
      setProfileExists(false);
      setFormData(initialFormData);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRecruiterProfile();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    injectGooglePlacesDropdownStyles();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setLocationError(
        "Google Maps key is missing. You can still type location manually."
      );
      return;
    }

    let isMounted = true;

    async function initializeGooglePlaces() {
      try {
        await loadGoogleMapsScript(apiKey);

        if (
          !isMounted ||
          !locationInputRef.current ||
          !window.google?.maps?.places
        ) {
          setLocationError(
            "Location autocomplete could not load. You can type manually."
          );
          return;
        }

        if (autocompleteRef.current && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(
            autocompleteRef.current
          );
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["geocode"],
            componentRestrictions: { country: "lk" },
            fields: ["formatted_address", "name"],
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();

          const selectedLocation =
            place.formatted_address ||
            place.name ||
            locationInputRef.current?.value ||
            "";

          setFormData((currentData) => ({
            ...currentData,
            company_location: sanitizeLocation(selectedLocation),
          }));

          setTouched((currentTouched) => ({
            ...currentTouched,
            company_location: true,
          }));

          setLocationError("");
        });

        setLocationError("");
      } catch {
        setLocationError("Location autocomplete failed. You can type manually.");
      }
    }

    initializeGooglePlaces();

    return () => {
      isMounted = false;

      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoading]);

  function markTouched(fieldName) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [fieldName]: true,
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "company_name") {
      nextValue = sanitizeCompanyName(value);
    }

    if (name === "company_website") {
      nextValue = sanitizeWebsite(value);
    }

    if (name === "company_location") {
      nextValue = sanitizeLocation(value);
      setLocationError("");
    }

    if (name === "contact_phone") {
      nextValue = normalizePhoneNumber(value);
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
    }));

    markTouched(name);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitAttempted(true);
    setStatusMessage("");
    setErrorMessage("");

    const latestErrors = validateRecruiterProfile(formData);

    if (Object.keys(latestErrors).length > 0) {
      setTouched({
        company_name: true,
        company_website: true,
        company_location: true,
        contact_phone: true,
      });

      setErrorMessage("Please fix the highlighted fields before saving.");
      return;
    }

    const payload = {
      company_name: cleanText(formData.company_name),
      company_website: cleanText(formData.company_website) || null,
      company_location: cleanText(formData.company_location),
      contact_phone: normalizePhoneNumber(formData.contact_phone),
    };

    try {
      setIsSaving(true);

      if (profileExists) {
        await updateMyRecruiterProfile(payload);
        setStatusMessage("Company profile updated successfully.");
      } else {
        await activateRecruiterProfile(payload);
        setProfileExists(true);
        setStatusMessage("Company profile created successfully.");
      }

      setTimeout(() => {
        router.push("/recruiter/dashboard");
      }, 700);
    } catch (error) {
      setErrorMessage(error.message || "Could not save company profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-normal text-[#F7631E] transition hover:text-[#e85512]"
        >
          <FiArrowLeft />
          Back
        </button>

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#F7631E] text-white shadow-sm">
              <FiBriefcase size={34} />
            </div>

            <p className="mt-6 text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
              Recruiter profile
            </p>

            <h1 className="mt-2 text-[30px] font-medium tracking-tight text-[#202020]">
              Company setup
            </h1>

            <p className="mt-3 text-sm font-normal leading-6 text-[#585958]">
              Complete your company profile before posting and managing jobs.
            </p>

            <div className="mt-7 space-y-3 rounded-3xl bg-[#F9FBFB] p-4">
              <div className="flex items-start gap-3">
                <LuSparkles className="mt-1 shrink-0 text-[#F7631E]" />
                <p className="text-xs font-normal leading-5 text-[#585958]">
                  Company name, location, and contact number are required for
                  recruiter workspace access.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiMapPin className="mt-1 shrink-0 text-[#F7631E]" />
                <p className="text-xs font-normal leading-5 text-[#585958]">
                  Location search uses Google Maps autocomplete when your API key
                  is configured.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/recruiter/dashboard")}
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
            >
              Go to dashboard
            </button>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 md:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-normal text-[#F7631E]">
                <LuSparkles size={14} />
                Recruiter workspace
              </div>

              <h2 className="mt-5 text-[30px] font-medium tracking-tight text-[#202020] md:text-[38px]">
                {profileExists ? "Edit company profile" : "Create company profile"}
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-[#585958]">
                Required fields are marked with orange stars. This information
                appears in your job posts and recruiter dashboard.
              </p>
            </div>

            {isLoading ? (
              <p className="mt-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-normal text-[#F7631E]">
                Loading recruiter profile...
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Company name <RequiredMark />
                    </label>

                    <div className="relative mt-2">
                      <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        onBlur={() => markTouched("company_name")}
                        placeholder="AccDoo Technologies"
                        className={`${inputClass} pl-11 ${
                          visibleErrors.company_name
                            ? "border-red-300"
                            : "border-slate-200"
                        }`}
                      />
                    </div>

                    <FieldError message={visibleErrors.company_name} />
                  </div>

                  <div>
                    <label className={labelClass}>Company website</label>

                    <div className="relative mt-2">
                      <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="company_website"
                        value={formData.company_website}
                        onChange={handleChange}
                        onBlur={() => markTouched("company_website")}
                        placeholder="https://example.com"
                        className={`${inputClass} pl-11 ${
                          visibleErrors.company_website
                            ? "border-red-300"
                            : "border-slate-200"
                        }`}
                      />
                    </div>

                    <FieldError message={visibleErrors.company_website} />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Company location <RequiredMark />
                    </label>

                    <div className="relative mt-2">
                      <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        ref={locationInputRef}
                        name="company_location"
                        value={formData.company_location}
                        onChange={handleChange}
                        onBlur={() => markTouched("company_location")}
                        placeholder="Colombo, Sri Lanka"
                        autoComplete="off"
                        className={`${inputClass} pl-11 ${
                          visibleErrors.company_location || locationError
                            ? "border-red-300"
                            : "border-slate-200"
                        }`}
                      />
                    </div>

                    <FieldError
                      message={visibleErrors.company_location || locationError}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Contact number <RequiredMark />
                    </label>

                    <div className="relative mt-2">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        onBlur={() => markTouched("contact_phone")}
                        placeholder="0701234000"
                        inputMode="numeric"
                        maxLength={10}
                        className={`${inputClass} pl-11 ${
                          visibleErrors.contact_phone
                            ? "border-red-300"
                            : "border-slate-200"
                        }`}
                      />
                    </div>

                    <FieldError message={visibleErrors.contact_phone} />
                  </div>
                </div>

                {errorMessage ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
                    <FiAlertCircle className="mr-2 inline" />
                    {errorMessage}
                  </p>
                ) : null}

                {statusMessage ? (
                  <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
                    <FiCheckCircle className="mr-2 inline" />
                    {statusMessage}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => router.push("/recruiter/dashboard")}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
                  >
                    {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                    {isSaving ? "Saving..." : "Save company profile"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
