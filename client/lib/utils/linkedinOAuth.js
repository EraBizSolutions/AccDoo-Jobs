const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_STATE_KEY = "jobsera_linkedin_oauth_state";

function generateOAuthState() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function startLinkedInAuth() {
  const linkedInClientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const linkedInRedirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI;

  if (!linkedInClientId || !linkedInRedirectUri) {
    throw new Error("LinkedIn Client ID or Redirect URI is missing in .env.local.");
  }

  const state = generateOAuthState();

  sessionStorage.setItem(LINKEDIN_STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: linkedInClientId,
    redirect_uri: linkedInRedirectUri,
    scope: "openid profile email",
    state,
  });

  window.location.href = `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

export function validateLinkedInState(receivedState) {
  const savedState = sessionStorage.getItem(LINKEDIN_STATE_KEY);

  sessionStorage.removeItem(LINKEDIN_STATE_KEY);

  if (!savedState || !receivedState || savedState !== receivedState) {
    throw new Error("LinkedIn login security check failed. Please try again.");
  }

  return true;
}