const BASE_URL = 'https://apis-system-ortodoncist.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('jwtToken'); // asegúrate de que el login guarda bajo esta clave

  if (!token) {
    console.error('No se encontró el token en localStorage.');
    window.location.href = '/login'; // redirige si no hay sesión
    return;
  }

  obtenerEstadisticas(token);
});

async function obtenerEstadisticas(token) {
  try {
    const [pacientesRes, citasRes, pagosRes, inventarioRes] = await Promise.all([
      fetch(`${BASE_URL}/pacientes`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/citas`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/pagos`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/inventario`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    if (!pacientesRes.ok || !citasRes.ok || !pagosRes.ok || !inventarioRes.ok) {
      throw new Error('Error al obtener datos del backend');
    }

    const [pacientesData, citasData, pagosData, inventarioData] = await Promise.all([
      pacientesRes.json(),
      citasRes.json(),
      pagosRes.json(),
      inventarioRes.json()
    ]);

    // Actualiza tarjetas del dashboard
    document.getElementById('total-pacientes').textContent = Object.keys(pacientesData).length;
    document.getElementById('total-citas').textContent = Object.keys(citasData).length;
    document.getElementById('total-pagos').textContent = Object.keys(pagosData).length;
    document.getElementById('total-inventario').textContent = Object.keys(inventarioData).length;

    // Citas del día
    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = Object.entries(citasData).filter(([id, cita]) => cita.fecha === hoy);
    const contenedorCitas = document.getElementById('citas-hoy');
    contenedorCitas.innerHTML = citasHoy.length
      ? citasHoy.map(([_, cita]) => `<p>🗓️ ${cita.hora} - ${cita.paciente}</p>`).join('')
      : '<p>Sin citas para hoy</p>';

    // Últimos pagos
    const pagosArray = Object.entries(pagosData)
      .map(([id, pago]) => ({ id, ...pago }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 5);
    const contenedorPagos = document.getElementById('ultimos-pagos');
    contenedorPagos.innerHTML = pagosArray.length
      ? pagosArray.map(p => `<p>💰 ${p.paciente} - $${p.monto} (${p.fecha})</p>`).join('')
      : '<p>No hay pagos recientes</p>';

  } catch (err) {
    console.error('❌ Error al cargar estadísticas del dashboard:', err);
    alert('Hubo un error al cargar los datos del dashboard.');
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) return window.location.href = '/login';

  try {
    // 🔐 Obtener datos del usuario autenticado desde Firebase
    const user = await firebase.auth().currentUser;

    if (user && user.displayName) {
      const nombreElemento = document.getElementById('usuario-nombre');
      if (nombreElemento) {
        nombreElemento.textContent = user.displayName;
      }
    }
  } catch (err) {
    console.error('No se pudo obtener el nombre del usuario:', err);
  }
});
