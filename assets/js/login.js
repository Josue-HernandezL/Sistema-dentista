import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const $modal = document.getElementById('loginModal');
const $openLoginButton = document.querySelector('.circle-chevron-down');

$openLoginButton.addEventListener('click', () => {
  mostrarLogin();
});

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
        <p id="loginError" style="color:red;"></p>
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
        <button type="submit" class="login-button">Enviar Solicitud</button>
        <p id="registerError" style="color:red;"></p>
        <p><a href="#" id="backToLogin">¿Ya tienes cuenta? Inicia sesión</a></p>
      </form>
    </div>`;

  cerrarModal();
  manejarSolicitudRegistro();
  document.getElementById('backToLogin').addEventListener('click', mostrarLogin);
}

function mostrarReset() {
  $modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button" id="closeModal">&times;</span>
      <h2>Recuperar Contraseña</h2>
      <form id="resetForm">
        <input type="email" placeholder="Correo" id="resetEmail" required>
        <button type="submit" class="login-button">Enviar correo</button>
        <p id="resetError" style="color:red;"></p>
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
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      localStorage.setItem('jwtToken', token);
      window.location.href = '/principal';
    } catch (err) {
      error.textContent = 'Correo o contraseña incorrectos.';
    }
  });
}

function manejarSolicitudRegistro() {
  const form = document.getElementById('registerForm');
  const error = document.getElementById('registerError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const displayName = document.getElementById('registerName').value;

    if (password.length < 6) {
      error.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    try {
      console.log('📤 Enviando solicitud...');
      const response = await fetch('https://apis-system-ortodoncist.onrender.com/api/auth/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });

      const data = await response.json();
      console.log('📥 Respuesta del backend:', data);

      if (!response.ok) throw new Error(data?.error || 'Error al enviar solicitud.');

      alert('✅ Solicitud enviada. Recibirás un correo cuando sea aprobada.');
      mostrarLogin();

    } catch (err) {
      console.error('❌ Error al enviar solicitud:', err);
      error.textContent = err.message;
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
      alert('Correo de recuperación enviado.');
      mostrarLogin();
    } catch (err) {
      error.textContent = 'No se pudo enviar el correo.';
    }
  });
}
