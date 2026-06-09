import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase-config.js';
import { api } from './api.js'; // Importamos la super instancia que creamos

// 1. PROTECCIÓN DE RUTA (GUARDIÁN DE FIREBASE)
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Si no hay usuario logueado, lo pateamos al login
    window.location.href = '/views/login.html';
  } else {
    // Si está logueado, ponemos su nombre y cargamos los datos
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) userNameElement.textContent = user.displayName || 'Usuario';
    
    cargarPacientes(); // Cargamos la tabla solo si hay sesión
  }
});

// Variables del DOM
const modal = document.getElementById('ventanaFlotante');
const abrir = document.getElementById('openModal');
const cerrar = document.getElementById('cerrarVentana');
abrir.onclick = () => modal.style.display = 'flex';
cerrar.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

const contenedorLista = document.querySelector('.pacientes');
const tarjetaPaciente = document.querySelector('.paciente');
const form = document.getElementById('formularioEjemplo');
let pacienteEditandoId = null;
const mapaBotones = new Map();

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'Edad desconocida';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return `${edad} años`;
}

function renderPacienteInfo(paciente) {
  tarjetaPaciente.innerHTML = `
    <div class="content-name">
      <p class="name"><strong>${paciente.nombre} ${paciente.apellidos || ''}</strong></p>
      <div class="buttons"></div>
    </div>
    <div class="content-data">
      <p class="tel">Teléfono: ${paciente.telefono || 'N/A'}</p>
      <p class="email">Correo: ${paciente.email || 'N/A'}</p>
      <p class="date">Fecha de Nacimiento: ${paciente.fechaNacimiento || 'N/A'} (${calcularEdad(paciente.fechaNacimiento)})</p>
      <p class="edit"><a href="#" id="btn-editar-paciente">Editar</a></p>
    </div>
  `;
  document.getElementById('btn-editar-paciente').onclick = () => editarPaciente(paciente);
}

function agregarPacienteLista(paciente) {
  if (mapaBotones.has(paciente.id)) {
    const btn = mapaBotones.get(paciente.id);
    btn.value = paciente.nombre;
    btn.onclick = () => {
      document.querySelectorAll('.pat').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      renderPacienteInfo(paciente);
    };
    btn.click();
    return;
  }

  const boton = document.createElement('input');
  boton.type = 'button';
  boton.classList.add('pat');
  boton.value = paciente.nombre;

  boton.addEventListener('click', () => {
    document.querySelectorAll('.pat').forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');
    renderPacienteInfo(paciente);
  });

  contenedorLista.prepend(boton);
  boton.click();
  mapaBotones.set(paciente.id, boton);
}

// 2. PETICIÓN GET USANDO NUESTRA API AXIOS
async function cargarPacientes() {
  try {
    // Ya no necesitas fetch, ni headers, ni url quemada. api.js hace todo.
    const response = await api.get('/pacientes'); 
    const data = response.data;

    contenedorLista.innerHTML = '';
    mapaBotones.clear();

    if (data.length === 0) {
      contenedorLista.innerHTML = '<p>No hay pacientes registrados</p>';
      return;
    }

    data.forEach(paciente => agregarPacienteLista(paciente));
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
    contenedorLista.innerHTML = '<p>Error al cargar pacientes</p>';
  }
}

function editarPaciente(paciente) {
  pacienteEditandoId = paciente.id;
  form.nombre.value = paciente.nombre || '';
  form.apellidos.value = paciente.apellidos || ''; // <- Añadido para hacer match con Zod
  form.email.value = paciente.email || ''; // <- Modificado a 'email' (match con backend)
  form.telefono.value = paciente.telefono || '';
  form.fechaNacimiento.value = paciente.fechaNacimiento || '';
  // (Llena el resto de tus campos según tu formulario actual)
  abrir.click();
}

// 3. PETICIÓN POST/PUT USANDO NUESTRA API AXIOS Y MANEJO DE ERRORES ZOD
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
      nombre: form.nombre.value,
      apellidos: form.apellidos?.value || "N/A", // Requerido por tu esquema Zod
      email: form.email?.value || undefined, 
      telefono: form.telefono.value || undefined,
      fechaNacimiento: form.fechaNacimiento.value || undefined,
    };

    try {
      let data;
      if (pacienteEditandoId) {
        // Actualizar (PUT)
        await api.put(`/pacientes/${pacienteEditandoId}`, formData);
        const res = await api.get(`/pacientes/${pacienteEditandoId}`);
        data = res.data;
      } else {
        // Crear (POST)
        const response = await api.post('/pacientes', formData);
        data = response.data;
      }

      agregarPacienteLista(data);
      form.reset();
      cerrar.click();
      alert(pacienteEditandoId ? '✏️ Paciente actualizado' : '✅ Paciente registrado');
      pacienteEditandoId = null;

    } catch (error) {
      // 4. EL FRONTEND AHORA ENTIENDE A ZOD
      if (error.detalles) {
        // Si el backend (Zod) rechazó los datos
        const mensajes = error.detalles.map(e => `• ${e.mensaje}`).join('\n');
        alert(`❌ Error de validación:\n${mensajes}`);
      } else {
        // Error de servidor u otro
        alert(`❌ Error: ${error.error || 'No se pudo guardar'}`);
      }
    }
  });
}