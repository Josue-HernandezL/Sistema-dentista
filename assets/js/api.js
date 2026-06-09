import axios from 'axios';
// Importamos la app de Firebase que configuraremos más adelante
import { getAuth } from 'firebase/auth'; 

// Crear una instancia centralizada de Axios
export const api = axios.create({
  // Vite lee la URL desde el .env automáticamente
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// "Interceptor" - Antes de que cualquier petición salga al backend, haz esto:
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    // Si el usuario está logueado, pide su token fresco
    const token = await user.getIdToken();
    // Inyéctalo en la cabecera Authorization
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Manejador de errores globales (para leer los errores de Zod desde el backend)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      // Retornamos la respuesta de error estructurada del backend
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);