import Auth from 'firebase-auth-lite';

const auth = new Auth({
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  redirectUri: 'http://localhost:8080/auth',
});

export default auth;
