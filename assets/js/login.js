import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth"; // ⬅️ Usamos el módulo de npm, ya no el CDN
import { app } from './firebase-config.js';
import { api } from './api.js'; // ⬅️ Importamos nuestra instancia configurada de Axios

const auth = getAuth(app);
const $modal = document.getElementById('loginModal');
const $openLoginButton = document.querySelector('.circle-chevron-down');

if ($openLoginButton) {
  $openLoginButton.addEventListener('click', mostrarLogin);
}

function mostrarLogin() {
  $modal.style.display = 'flex';
  $modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button" id="closeModal">&times;</span>
      <h2>Iniciar Sesión</h2>
      <form id="loginForm">
        <input type="email" placeholder="Correo" id="loginEmail" required>
        <input type="password" placeholder="Contraseña" id="loginPassword" required>
        <button type="submit" class="login-button">Entrar</button>
        <p id="loginError" style="color:red; font-size: 0.9em; margin-top: 10px;"></p>
        <p><a href="#" id="goToReset">¿Olvidaste tu contraseña?</a></p>
        <p><a href="#" id="goToRegister">¿No tienes cuenta? Regístrate</a></p>
      </form>
    </div>`;

  cerrarModal();
  manejarLogin();
  document.getElementById('goToReset').addEventListener('click', mostrarReset);
  document.getElementById('goToRegister').addEventListener('click', mostrarRegistro);
}

function mostrarRegistro() {
  $modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button" id="closeModal">&times;</span>
      <h2>Solicitar Registro</h2>
      <form id="registerForm">
        <input type="text" placeholder="Nombre" id="registerName" required>
        <input type="email" placeholder="Correo" id="registerEmail" required>
        <input type="password" placeholder="Contraseña" id="registerPassword" required>
        
        <div id="adminCheckContainer" style="display: none; margin-bottom: 10px;">
          <label style="font-size: 0.8em; color: gray;">
            <input type="checkbox" id="isAdminCheck"> Crear como Administrador Principal
          </label>
        </div>

        <button type="submit" class="login-button">Enviar Solicitud</button>
        <p id="registerError" style="color:red; font-size: 0.9em; margin-top: 10px;"></p>
        <p><a href="#" id="backToLogin">¿Ya tienes cuenta? Inicia sesión</a></p>
      </form>
    </div>`;

  cerrarModal();
  manejarSolicitudRegistro();
  document.getElementById('backToLogin').addEventListener('click', mostrarLogin);

  // Lógica del "truco" para mostrar la casilla de Admin
  const nameInput = document.getElementById('registerName');
  nameInput.addEventListener('input', (e) => {
    const adminCheck = document.getElementById('adminCheckContainer');
    if (e.target.value.toLowerCase() === 'admin') {
      adminCheck.style.display = 'block';
    } else {
      adminCheck.style.display = 'none';
      document.getElementById('isAdminCheck').checked = false;
    }
  });
}

function mostrarReset() {
  $modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button" id="closeModal">&times;</span>
      <h2>Recuperar Contraseña</h2>
      <form id="resetForm">
        <input type="email" placeholder="Correo" id="resetEmail" required>
        <button type="submit" class="login-button">Enviar correo</button>
        <p id="resetError" style="color:red; font-size: 0.9em; margin-top: 10px;"></p>
        <p><a href="#" id="backToLogin">Volver al login</a></p>
      </form>
    </div>`;

  cerrarModal();
  manejarReset();
  document.getElementById('backToLogin').addEventListener('click', mostrarLogin);
}

function cerrarModal() {
  document.getElementById('closeModal').addEventListener('click', () => {
    $modal.style.display = 'none';
  });
}

function manejarLogin() {
  const form = document.getElementById('loginForm');
  const error = document.getElementById('loginError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.textContent = 'Iniciando sesión...';
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ¡Ya no guardamos en localStorage! Redirigimos directamente al index manejado por Vite
      window.location.href = '/index.html'; 
    } catch (err) {
      // Manejo específico de errores de Firebase para mejor UX
      if (err.code === 'auth/user-disabled') {
        error.textContent = '❌ Tu cuenta aún no ha sido aprobada por el administrador.';
      } else if (err.code === 'auth/invalid-credential') {
        error.textContent = '❌ Correo o contraseña incorrectos.';
      } else {
        error.textContent = '❌ Ocurrió un error al intentar iniciar sesión.';
      }
    }
  });
}

function manejarSolicitudRegistro() {
  const form = document.getElementById('registerForm');
  const error = document.getElementById('registerError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.textContent = 'Procesando...';

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const displayName = document.getElementById('registerName').value;
    const isAdmin = document.getElementById('isAdminCheck').checked;

    try {
      if (isAdmin) {
        // 🚀 RUTA EXCLUSIVA PARA EL PRIMER ADMIN
        await api.post('/auth/admin', { email, password, displayName });
        alert('👑 Administrador creado exitosamente. Ya puedes iniciar sesión.');
        mostrarLogin();
      } else {
        // 🧑‍⚕️ RUTA NORMAL (Para empleados que esperan aprobación)
        await api.post('/auth/solicitud', { email, password, displayName });
        alert('✅ Solicitud enviada. Recibirás un correo cuando sea aprobada.');
        mostrarLogin();
      }
    } catch (err) {
      console.error(err);
      if (err.detalles) {
        // Si falló la validación de Zod
        error.textContent = '❌ ' + err.detalles.map(d => d.mensaje).join(', ');
      } else {
        // Si el backend arrojó un error (ej. "Ya hay un admin")
        error.textContent = '❌ ' + (err.error || 'Error al procesar la solicitud.');
      }
    }
  });
}

function manejarReset() {
  const form = document.getElementById('resetForm');
  const error = document.getElementById('resetError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;

    try {
      await sendPasswordResetEmail(auth, email);
      alert('✅ Correo de recuperación enviado. Revisa tu bandeja de entrada o SPAM.');
      mostrarLogin();
    } catch (err) {
      error.textContent = '❌ No se pudo enviar el correo. Verifica que esté bien escrito.';
    }
  });
}