const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_STATE_KEY = "jobsera_linkedin_oauth_state";

function isBrowser() {
  return typeof window !== "undefined";
}

function generateOAuthState() {
  if (isBrowser() && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getLinkedInConfig() {
  const linkedInClientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const linkedInRedirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI;

  if (!linkedInClientId) {
    throw new Error("LinkedIn Client ID is missing in client/.env.local.");
  }

  if (!linkedInRedirectUri) {
    throw new Error("LinkedIn Redirect URI is missing in client/.env.local.");
  }

  return {
    linkedInClientId,
    linkedInRedirectUri,
  };
}

export function startLinkedInAuth() {
  if (!isBrowser()) return;

  const { linkedInClientId, linkedInRedirectUri } = getLinkedInConfig();

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
  if (!isBrowser()) return false;

  const savedState = sessionStorage.getItem(LINKEDIN_STATE_KEY);

  sessionStorage.removeItem(LINKEDIN_STATE_KEY);

  if (!savedState || !receivedState || savedState !== receivedState) {
    throw new Error("LinkedIn login security check failed. Please try again.");
  }

  return true;
}

export function getLinkedInFriendlyError(error, errorDescription) {
  if (error === "invalid_scope_error") {
    return "LinkedIn rejected the requested scopes. In LinkedIn Developer Portal, add the product: Sign In with LinkedIn using OpenID Connect. Then confirm openid, profile, and email permissions are available.";
  }

  if (error === "redirect_uri_mismatch") {
    return "LinkedIn redirect URL does not match. Add this exact URL in LinkedIn Auth settings: http://localhost:3000/auth/linkedin/callback";
  }

  if (error === "user_cancelled_login" || error === "access_denied") {
    return "LinkedIn login was cancelled.";
  }

  if (errorDescription) {
    return errorDescription.replaceAll("+", " ");
  }

  return "LinkedIn login failed. Please try again.";
}