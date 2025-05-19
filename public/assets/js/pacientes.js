const modal = document.getElementById('ventanaFlotante');
const abrir = document.getElementById('openModal');
const cerrar = document.getElementById('cerrarVentana');

abrir.onclick = () => modal.style.display = 'flex';
cerrar.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

const URL_RENDER = 'https://apis-system-ortodoncist.onrender.com/api/pacientes';
const token = localStorage.getItem('jwtToken');
if (!token) {
  window.location.href = '/login';
}

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
      <p class="name"><strong>${paciente.nombre}</strong></p>
      <div class="buttons"></div>
    </div>
    <div class="content-data">
      <p class="tel">Teléfono: ${paciente.telefono}</p>
      <p class="email">Correo: ${paciente.correo}</p>
      <p class="date">Fecha de Nacimiento: ${paciente.fechaNacimiento} (${calcularEdad(paciente.fechaNacimiento)})</p>
      <p class="adress">Dirección: ${paciente.colonia || ''}, ${paciente.calle || ''}, C.P: ${paciente.cp || ''}</p>
      <p class="numI">Número interior: ${paciente.numI || '---'}</p>
      <p class="numE">Número exterior: ${paciente.numE || '---'}</p>
      <p class="edit"><a href="#" onclick='editarPaciente(${JSON.stringify(paciente)})'>Editar</a></p>
    </div>
  `;
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

async function cargarPacientes() {
  try {
    const response = await fetch(URL_RENDER, {
      headers: { Authorization: 'Bearer ' + token }
    });

    if (!response.ok) throw new Error('Error al obtener pacientes');

    const data = await response.json();
    contenedorLista.innerHTML = '';
    mapaBotones.clear();

    Object.entries(data).forEach(([id, paciente]) => {
      paciente.id = id;
      agregarPacienteLista(paciente);
    });
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
    contenedorLista.innerHTML = '<p>Error al cargar pacientes</p>';
  }
}

function editarPaciente(paciente) {
  pacienteEditandoId = paciente.id;

  form.nombre.value = paciente.nombre || '';
  form.correo.value = paciente.correo || '';
  form.telefono.value = paciente.telefono || '';
  form.fechaNacimiento.value = paciente.fechaNacimiento || '';
  form.colonia.value = paciente.colonia || '';
  form.calle.value = paciente.calle || '';
  form.cp.value = paciente.cp || '';
  form.numE.value = paciente.numE || '';
  form.numI.value = paciente.numI || '';

  abrir.click();
}

if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
      nombre: form.nombre.value,
      correo: form.correo.value,
      telefono: form.telefono.value,
      fechaNacimiento: form.fechaNacimiento.value,
      colonia: form.colonia.value,
      calle: form.calle.value,
      cp: form.cp.value,
      numE: form.numE.value || "",
      numI: form.numI.value || ""
    };

    const metodo = pacienteEditandoId ? 'PUT' : 'POST';
    const endpoint = pacienteEditandoId ? `${URL_RENDER}/${pacienteEditandoId}` : URL_RENDER;

    try {
      const response = await fetch(endpoint, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('No se pudo guardar');

      let data;

      if (pacienteEditandoId) {
        const res = await fetch(`${URL_RENDER}/${pacienteEditandoId}`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        data = await res.json();
        data.id = pacienteEditandoId;
      } else {
        const res = await response.json();
        data = { ...res, id: res.id };
      }

      agregarPacienteLista(data);
      form.reset();
      cerrar.click();
      mostrarToast(pacienteEditandoId ? '✏️ Paciente actualizado' : '✅ Paciente registrado');
      pacienteEditandoId = null;

    } catch (error) {
      console.error('Error al guardar paciente:', error);
      mostrarToast('❌ No se pudo guardar el paciente', '#e53935');
    }
  });
}

function mostrarToast(mensaje, color = '#4caf50') {
  alert(mensaje); // Puedes reemplazarlo por un toast visual
}

window.addEventListener('DOMContentLoaded', cargarPacientes);
