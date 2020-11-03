import Auth from 'firebase-auth-lite';

const auth = new Auth({
  apiKey: process.env.FIREBASE_API_KEY,
  redirectUri: `${window.location.origin}/auth`,
});

export default auth;
