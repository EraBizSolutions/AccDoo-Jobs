"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiBriefcase,
  FiGlobe,
  FiMapPin,
  FiPhone,
  FiSave,
} from "react-icons/fi";

import Navbar from "@/components/home/Navbar";
import {
  activateRecruiterProfile,
  getMyRecruiterProfile,
  updateMyRecruiterProfile,
} from "@/lib/api/recruiterApi";
import { getAccessToken } from "@/lib/utils/tokenStorage";

const GOOGLE_MAPS_SCRIPT_ID = "jobsera-google-maps-places-script";

const initialFormData = {
  company_name: "",
  company_website: "",
  company_location: "",
  contact_phone: "",
};

const inputClass =
  "w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50";

const labelClass = "text-sm font-normal text-[#585958]";

function injectGooglePlacesDropdownStyles() {
  if (typeof document === "undefined") return;

  const styleId = "jobsera-google-places-style";

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

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-normal text-red-500">{message}</p>;
}

function validateRecruiterProfile(formData) {
  const errors = {};

  const companyName = formData.company_name.trim();
  const companyWebsite = formData.company_website.trim();
  const companyLocation = formData.company_location.trim();
  const contactPhone = formData.contact_phone.trim();

  if (!companyName) {
    errors.company_name = "Company name is required.";
  } else if (companyName.length < 2) {
    errors.company_name = "Company name must be at least 2 characters.";
  }

  if (companyWebsite) {
    const websitePattern =
      /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

    if (!websitePattern.test(companyWebsite)) {
      errors.company_website = "Enter a valid website URL.";
    }
  }

  if (!companyLocation) {
    errors.company_location = "Company location is required.";
  }

  if (contactPhone) {
    const phonePattern = /^\+?[0-9\s-]{7,15}$/;

    if (!phonePattern.test(contactPhone)) {
      errors.contact_phone = "Enter a valid phone number.";
    }
  }

  return errors;
}

function normalizeWebsiteUrl(website) {
  const cleanWebsite = website.trim();

  if (!cleanWebsite) return "";

  if (cleanWebsite.startsWith("http://") || cleanWebsite.startsWith("https://")) {
    return cleanWebsite;
  }

  return `https://${cleanWebsite}`;
}

export default function RecruiterProfilePage() {
  const router = useRouter();
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [hasProfile, setHasProfile] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!getAccessToken()) {
        router.push("/login");
        return;
      }

      try {
        const profile = await getMyRecruiterProfile();

        setHasProfile(true);
        setFormData({
          company_name: profile.company_name || "",
          company_website: profile.company_website || "",
          company_location: profile.company_location || "",
          contact_phone: profile.contact_phone || "",
        });
      } catch {
        setHasProfile(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    injectGooglePlacesDropdownStyles();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setLocationError("Location autocomplete is not configured.");
      return;
    }

    let isMounted = true;

    async function initializeGooglePlaces() {
      try {
        setIsLocationLoading(true);

        await loadGoogleMapsScript(apiKey);

        if (!isMounted || !locationInputRef.current || !window.google?.maps?.places) {
          setLocationError("Location autocomplete could not load.");
          return;
        }

        if (autocompleteRef.current && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["(cities)"],
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
            company_location: selectedLocation,
          }));

          setTouched((currentTouched) => ({
            ...currentTouched,
            company_location: true,
          }));

          setLocationError("");
        });

        setLocationError("");
      } catch {
        setLocationError("Location autocomplete failed to load.");
      } finally {
        setIsLocationLoading(false);
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

  const validationErrors = useMemo(
    () => validateRecruiterProfile(formData),
    [formData]
  );

  const visibleErrors = Object.fromEntries(
    Object.entries(validationErrors).filter(
      ([field]) => touched[field] || submitAttempted
    )
  );

  function markTouched(name) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    markTouched(name);

    if (name === "company_location") {
      setLocationError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitAttempted(true);
    setErrorMessage("");
    setStatusMessage("");

    const latestErrors = validateRecruiterProfile(formData);

    if (Object.keys(latestErrors).length > 0) {
      setErrorMessage("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        company_name: formData.company_name.trim(),
        company_website: normalizeWebsiteUrl(formData.company_website),
        company_location: formData.company_location.trim(),
        contact_phone: formData.contact_phone.trim(),
      };

      if (hasProfile) {
        await updateMyRecruiterProfile(payload);
      } else {
        await activateRecruiterProfile(payload);
      }

      setStatusMessage("Company profile saved. Redirecting to dashboard...");

      setTimeout(() => {
        router.push("/recruiter/dashboard");
      }, 700);
    } catch (error) {
      setErrorMessage(error.message || "Could not save recruiter profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
                Recruiter setup
              </p>

              <h1 className="mt-2 text-[34px] font-medium tracking-tight text-[#202020]">
                Company information
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-[#585958]">
                Add company details before publishing jobs. This profile connects your hiring workspace with recruiter job posts.
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <FiBriefcase size={22} />
            </div>
          </div>

          {isLoading ? (
            <p className="mt-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-normal text-[#F7631E]">
              Loading recruiter profile...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-6">
              <div>
                <label className={labelClass}>Company name</label>
                <input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  onBlur={() => markTouched("company_name")}
                  placeholder="Erabiz Private Limited"
                  className={`mt-2 ${inputClass} ${
                    visibleErrors.company_name ? "border-red-300" : "border-slate-200"
                  }`}
                />
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
                    placeholder="https://erabiz.io"
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
                <label className={labelClass}>Company location</label>
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

                {isLocationLoading ? (
                  <p className="mt-2 text-xs font-normal text-slate-400">
                    Loading location autocomplete...
                  </p>
                ) : null}
              </div>

              <div>
                <label className={labelClass}>Contact phone</label>
                <div className="relative mt-2">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    onBlur={() => markTouched("contact_phone")}
                    placeholder="+94770000000"
                    className={`${inputClass} pl-11 ${
                      visibleErrors.contact_phone
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />
                </div>
                <FieldError message={visibleErrors.contact_phone} />
              </div>

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
                  {errorMessage}
                </p>
              ) : null}

              {statusMessage ? (
                <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
                  {statusMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                <FiSave />
                {isSubmitting ? "Saving..." : "Save and continue"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}