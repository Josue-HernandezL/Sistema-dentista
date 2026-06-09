document.addEventListener('DOMContentLoaded', async function () {
  const API_URL = 'https://apis-system-ortodoncist.onrender.com/api/citas';
  const API_PACIENTES = 'https://apis-system-ortodoncist.onrender.com/api/pacientes';
  const token = localStorage.getItem('jwtToken');

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
      const response = await fetch(API_PACIENTES, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener pacientes');

      const data = await response.json();
      inputPaciente.innerHTML = '<option value="">Seleccione un paciente</option>';

      Object.entries(data).forEach(([id, paciente]) => {
        if (paciente.nombre) {
          const option = document.createElement('option');
          option.value = paciente.nombre;
          option.textContent = paciente.nombre;
          inputPaciente.appendChild(option);
        }
      });
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  }

  async function obtenerCitas() {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return Object.keys(data).map(id => ({
        id,
        title: data[id].title,
        start: data[id].start,
        end: data[id].end,
        extendedProps: {
          paciente: data[id].paciente,
          descripcion: data[id].descripcion
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
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
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
      inputPaciente.value = evento.extendedProps.paciente || '';
      inputDescripcion.value = evento.extendedProps.descripcion || '';
      inputStart.value = evento.startStr.slice(0, 16);
      inputEnd.value = evento.endStr?.slice(0, 16) || evento.startStr.slice(0, 16);
      modal.style.display = 'flex';
    }
  });

  calendar.render();

  btnAgregar.onclick = () => {
    form.reset();
    inputId.value = '';
    modal.style.display = 'flex';
  };

  btnCerrar.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const cita = {
      title: inputTitle.value.trim(),
      paciente: inputPaciente.value,
      descripcion: inputDescripcion.value.trim(),
      start: inputStart.value,
      end: inputEnd.value
    };

    if (!cita.title || !cita.paciente || !cita.start || !cita.end) {
      return alert("Todos los campos son obligatorios");
    }

    const minutosValidos = [0, 30];
    const startMin = new Date(cita.start).getMinutes();
    const endMin = new Date(cita.end).getMinutes();
    if (!minutosValidos.includes(startMin) || !minutosValidos.includes(endMin)) {
      return alert("Solo se permiten horas en punto o y media");
    }

    if (new Date(cita.start) >= new Date(cita.end)) {
      return alert("La fecha de inicio debe ser anterior a la de fin");
    }

    const id = inputId.value;
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cita)
      });

      const resultado = await res.json();

      if (id) {
        const evento = calendar.getEventById(id);
        evento.setProp('title', resultado.title);
        evento.setStart(resultado.start);
        evento.setEnd(resultado.end);
        evento.setExtendedProp('paciente', resultado.paciente);
        evento.setExtendedProp('descripcion', resultado.descripcion);
      } else {
        calendar.addEvent({
          id: resultado.id || resultado._id,
          title: resultado.title,
          start: resultado.start,
          end: resultado.end,
          extendedProps: {
            paciente: resultado.paciente,
            descripcion: resultado.descripcion
          }
        });
      }

      modal.style.display = 'none';
      form.reset();
    } catch (err) {
      console.error('❌ Error al guardar cita:', err);
    }
  });
});
