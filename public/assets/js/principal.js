const API_KEY = 'e4f87c2356032f64d36433baeaf0fd5b'; // 🔐 Reemplaza con tu API Key real
const BASE_URL = 'https://apis-system-ortodoncist.onrender.com/api'; // 

document.addEventListener('DOMContentLoaded', obtenerEstadisticas);

async function obtenerEstadisticas() {
  try {
    const [resPacientes, resCitas, resPagos, resInventario] = await Promise.all([
      fetch(`${BASE_URL}/pacientes`, { headers: { 'x-api-key': API_KEY } }),
      fetch(`${BASE_URL}/citas`, { headers: { 'x-api-key': API_KEY } }),
      fetch(`${BASE_URL}/pagos`, { headers: { 'x-api-key': API_KEY } }),
      fetch(`${BASE_URL}/inventario`, { headers: { 'x-api-key': API_KEY } })
    ]);

    const pacientesData = await resPacientes.json();
    const citasData = await resCitas.json();
    const pagosData = await resPagos.json();
    const inventarioData = await resInventario.json();

    const totalPacientes = Object.keys(pacientesData || {}).length;

    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = Object.values(citasData || {}).filter(cita =>
      cita.fecha === hoy
    );

    const pagosPendientes = Object.values(pagosData || {})
      .filter(p => p.estado?.toLowerCase() === 'pending')
      .reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);

    const stockBajo = Object.values(inventarioData || {}).filter(item =>
      item.stock && parseInt(item.stock) <= 5
    );

    // Mostrar estadísticas
    document.getElementById('total-pacientes').textContent = totalPacientes;
    document.getElementById('pacientes-change').textContent = '+0%';
    document.getElementById('citas-hoy').textContent = citasHoy.length;
    document.getElementById('citas-change').textContent = '+0%';
    document.getElementById('pagos-pendientes').textContent = `$${pagosPendientes}`;
    document.getElementById('pagos-change').textContent = '-0%';
    document.getElementById('stock-bajo').textContent = stockBajo.length;
    document.getElementById('stock-change').textContent = '+0%';

    // Mostrar listas
    llenarListaCitas(citasHoy);
    llenarListaPagos(Object.values(pagosData || {}));

  } catch (error) {
    console.error('❌ Error cargando datos del dashboard:', error);
  }
}

function llenarListaCitas(citas) {
  const ul = document.getElementById('lista-citas');
  ul.innerHTML = '';

  citas.forEach(cita => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span><strong>${cita.nombre || 'Sin nombre'}</strong><br><small>${cita.hora || 'Sin hora'}</small></span>
      <span class="badge badge-orthodontic">${cita.tipo || 'General'}</span>
    `;
    ul.appendChild(li);
  });
}

function llenarListaPagos(pagos) {
  const ul = document.getElementById('lista-pagos');
  ul.innerHTML = '';

  pagos.slice(-4).reverse().forEach(pago => {
    const badge = pago.estado?.toLowerCase() === 'paid' ? 'badge-paid' : 'badge-pending';
    const li = document.createElement('li');
    li.innerHTML = `
      <span><strong>${pago.nombre || 'Paciente'}</strong><br><small>${pago.fecha || 'Fecha N/D'}</small></span>
      <span>$${pago.monto || 0} <span class="badge ${badge}">${pago.estado || 'Estado'}</span> <small>${pago.metodo || 'Método'}</small></span>
    `;
    ul.appendChild(li);
  });
}
