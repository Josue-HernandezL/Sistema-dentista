import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";

const firebaseConfig = {
    apiKey : "AIzaSyDN7GPLrDi-Z5yScuuF0MThITDaFJt_kXE",
    authDomain : "ortodoncista-system-5c89c.firebaseapp.com",
    databaseURL : "https://ortodoncista-system-5c89c-default-rtdb.firebaseio.com",
    projectId : "ortodoncista-system-5c89c",
    storageBucket : "ortodoncista-system-5c89c.firebasestorage.app",
    messagingSenderId : "474809403013",
    appId : "1:474809403013:web:f718367589809fc8864bec",
    measurementId : "G-MBE5NH8VE0"
};

export const app = initializeApp(firebaseConfig);