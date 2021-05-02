import Auth from 'firebase-auth-lite';

export const auth = new Auth({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  redirectUri: `${window.location.origin}/auth`,
});

export const apiFetch = (path, options) =>
  auth
    .authorizedRequest(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    })
    .then((response) => response.json());
