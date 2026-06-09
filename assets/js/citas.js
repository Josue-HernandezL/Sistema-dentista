import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase-config.js';
import { api } from './api.js';

const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/views/login.html';
  } else {
    inicializarCalendario();
  }
});

async function inicializarCalendario() {
  const calendarEl = document.getElementById('calendar');
  const modal = document.getElementById('modalCita');
  const form = document.getElementById('formCita');
  const inputId = document.getElementById('idCita');
  const inputTitle = document.getElementById('title');
  const inputPaciente = document.getElementById('paciente');
  const inputDescripcion = document.getElementById('descripcion');
  const inputStart = document.getElementById('start');
  const inputEnd = document.getElementById('end');
  const btnAgregar = document.getElementById('btnAgregarCita');
  const btnCerrar = document.getElementById('cerrarModal');

  async function cargarPacientes() {
    try {
      const { data } = await api.get('/pacientes');
      inputPaciente.innerHTML = '<option value="">Seleccione un paciente</option>';
      data.forEach((paciente) => {
        const option = document.createElement('option');
        option.value = paciente.id; // Guardamos el ID real
        option.textContent = `${paciente.nombre} ${paciente.apellidos || ''}`;
        inputPaciente.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  }

  async function obtenerCitas() {
    try {
      const { data } = await api.get('/citas');
      return data.map(cita => ({
        id: cita.id,
        title: cita.motivo || 'Cita programada',
        start: cita.fechaHora,
        end: cita.fechaHora, // El backend solo guarda fechaHora, usamos la misma para end
        extendedProps: {
          pacienteId: cita.pacienteId,
          pacienteNombre: cita.pacienteNombre,
          descripcion: cita.notas || ''
        }
      }));
    } catch (err) {
      console.error('❌ Error al obtener citas:', err);
      return [];
    }
  }

  await cargarPacientes();
  const citas = await obtenerCitas();

  const calendar = new FullCalendar.Calendar(calendarEl, {
    events: citas,
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek,dayGridDay' },
    locale: 'es',
    dateClick(info) {
      form.reset();
      inputId.value = '';
      inputStart.value = `${info.dateStr}T09:00`;
      inputEnd.value = `${info.dateStr}T10:00`;
      modal.style.display = 'flex';
    },
    eventClick(info) {
      const evento = info.event;
      inputId.value = evento.id;
      inputTitle.value = evento.title;
      inputPaciente.value = evento.extendedProps.pacienteId || '';
      inputDescripcion.value = evento.extendedProps.descripcion || '';
      inputStart.value = evento.startStr.slice(0, 16);
      inputEnd.value = evento.endStr?.slice(0, 16) || evento.startStr.slice(0, 16);
      modal.style.display = 'flex';
    }
  });

  calendar.render();

  btnAgregar.onclick = () => { form.reset(); inputId.value = ''; modal.style.display = 'flex'; };
  btnCerrar.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Traductor al esquema Zod del backend
    const citaToSave = {
      pacienteId: inputPaciente.value,
      pacienteNombre: inputPaciente.options[inputPaciente.selectedIndex].text,
      fechaHora: inputStart.value,
      motivo: inputTitle.value.trim(),
      notas: inputDescripcion.value.trim()
    };

    if (!citaToSave.motivo || !citaToSave.pacienteId || !citaToSave.fechaHora) {
      return alert("Campos obligatorios faltantes");
    }

    const id = inputId.value;
    try {
      let resultado;
      if (id) {
        await api.put(`/citas/${id}`, citaToSave);
        resultado = { id, ...citaToSave };
      } else {
        const res = await api.post('/citas', citaToSave);
        resultado = res.data;
      }

      alert(id ? 'Cita actualizada' : 'Cita agregada');
      window.location.reload(); // Recarga limpia para reflejar FullCalendar
    } catch (err) {
      if (err.detalles) alert(`❌ Error: ${err.detalles.map(d => d.mensaje).join(', ')}`);
      else alert('❌ Error al guardar la cita');
    }
  });
}