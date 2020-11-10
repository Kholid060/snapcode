import Auth from 'firebase-auth-lite';

export const auth = new Auth({
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  redirectUri: 'http://localhost:8080/auth',
});

export const apiFetch = (path, options) => (
  auth.authorizedRequest(
    `${process.env.VUE_APP_API_BASE_URL}${path}`,
    {
    	headers: {
	      'Content-Type': 'application/json',
	    },
    	...options,
    },
  )
);
