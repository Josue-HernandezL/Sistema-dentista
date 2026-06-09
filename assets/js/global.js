import { getAuth, signOut } from 'firebase/auth';
import { app } from './firebase-config.js'; // Asegúrate de que esta ruta sea correcta

const $index = document.getElementById('img-logo');
if ($index) {
  $index.addEventListener('click', (e) => { 
      e.preventDefault();
      window.location.href = '/index.html'; // En Vite el root es index.html
  });
}

document.querySelectorAll('a[class^="redirect"]').forEach((element) => {
  element.addEventListener('click', async (e) => {
    e.preventDefault();
    const fullClass = element.className;
    const path = fullClass.replace("redirect", "");

    // 1. Manejo del Logout
    if (path === 'login') {
      const auth = getAuth(app);
      await signOut(auth); // Cierra sesión en Firebase
      window.location.href = '/views/login.html';
      return;
    }

    // 2. Redirección a Principal
    if (path === 'principal') {
      window.location.href = '/index.html';
      return;
    }

    // 3. Redirección a las demás vistas
    if (path) {
      window.location.href = `/views/${path}.html`;
    }
  });
});

console.log('Script global.js cargado y enrutador configurado');