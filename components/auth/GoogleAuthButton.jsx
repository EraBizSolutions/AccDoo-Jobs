"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-services-script";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;

    document.body.appendChild(script);
  });
}

export default function GoogleAuthButton({
  label = "Google",
  buttonText = "continue_with",
  onGoogleSuccess,
  onGoogleError,
  disabled = false,
}) {
  const hiddenGoogleButtonRef = useRef(null);
  const successCallbackRef = useRef(onGoogleSuccess);
  const errorCallbackRef = useRef(onGoogleError);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    successCallbackRef.current = onGoogleSuccess;
    errorCallbackRef.current = onGoogleError;
  }, [onGoogleSuccess, onGoogleError]);

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      errorCallbackRef.current?.(
        "Google Client ID is missing in frontend .env.local."
      );
      return;
    }

    let isMounted = true;

    async function initializeGoogleButton() {
      try {
        await loadGoogleIdentityScript();

        if (!isMounted || !hiddenGoogleButtonRef.current) return;

        hiddenGoogleButtonRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response?.credential) {
              errorCallbackRef.current?.(
                "Google did not return a valid credential."
              );
              return;
            }

            await successCallbackRef.current?.(response.credential);
          },
        });

        window.google.accounts.id.renderButton(hiddenGoogleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: buttonText,
          shape: "rectangular",
          logo_alignment: "left",
          width: 260,
        });

        setIsReady(true);
      } catch {
        errorCallbackRef.current?.(
          "Google login failed to load. Please try again."
        );
      }
    }

    initializeGoogleButton();

    return () => {
      isMounted = false;
    };
  }, [buttonText]);

  return (
    <div
      className={`relative h-10 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:bg-blue-50 ${
        disabled || !isReady ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm font-bold text-slate-700">
        <GoogleIcon />
        {isReady ? label : "Loading..."}
      </div>

      <div
        ref={hiddenGoogleButtonRef}
        className={`absolute inset-0 z-20 opacity-0 ${
          disabled || !isReady ? "pointer-events-none" : ""
        }`}
      />
    </div>
  );
}