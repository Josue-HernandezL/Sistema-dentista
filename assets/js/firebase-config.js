import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyB6wRvkBeGTWc_gP0nKhzDMpMxv_gdyUNI",
    authDomain: "dente-ecc96.firebaseapp.com",
    databaseURL : "https://dente-ecc96-default-rtdb.firebaseio.com/",
    projectId: "dente-ecc96",
    storageBucket: "dente-ecc96.firebasestorage.app",
    messagingSenderId: "383729656131",
    appId: "1:383729656131:web:d1e977ba9176d7a18ccff6",
    measurementId: "G-P6RBX7WT09"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);