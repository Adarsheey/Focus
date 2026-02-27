import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD8z7DKsacnLH127G2FHE_lF6OF11DNLzw",
    authDomain: "focusloop-ecb20.firebaseapp.com",
    projectId: "focusloop-ecb20",
    storageBucket: "focusloop-ecb20.firebasestorage.app",
    messagingSenderId: "444406625520",
    appId: "1:444406625520:web:d3c9b82e856ff3910bbe35"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
