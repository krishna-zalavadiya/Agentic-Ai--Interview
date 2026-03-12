
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "interviewiq-7d365.firebaseapp.com",
  projectId: "interviewiq-7d365",
  storageBucket: "interviewiq-7d365.firebasestorage.app",
  messagingSenderId: "702766380509",
  appId: "1:702766380509:web:815861568fe4eb303d7234",
  measurementId: "G-6FGX7K0G0S"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };