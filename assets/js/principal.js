import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase-config.js';
import { api } from './api.js';

const auth = getAuth(app);

// 🛡️ GUARDIÁN DE AUTENTICACIÓN PARA EL DASHBOARD
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Si no hay sesión activa de Firebase, redirige limpiamente al login de Vite
    window.location.href = '/views/login.html';
  } else {
    // Si la sesión es válida, personaliza el DOM con sus datos
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = user.displayName || 'Usuario';
    }
    
    // Ejecuta la carga de datos del backend de forma segura
    cargarDatosDashboard();
  }
});

// Función centralizada para alimentar las tarjetas del Dashboard
async function cargarDatosDashboard() {
  try {
    // 1. Obtener datos de pacientes para actualizar el contador
    const resPacientes = await api.get('/pacientes');
    const totalPacientes = resPacientes.data.length;
    
    const txtTotalPacientes = document.getElementById('total-pacientes');
    if (txtTotalPacientes) txtTotalPacientes.textContent = totalPacientes;

    // 2. Obtener las citas para calcular cuántas corresponden al día de hoy
    const resCitas = await api.get('/citas');
    const citas = resCitas.data;
    
    const hoyISO = new Date().toISOString().split('T')[0]; // Formato AAAA-MM-DD
    const citasDeHoy = citas.filter(cita => cita.fechaHora && cita.fechaHora.startsWith(hoyISO)).length;
    
    const txtCitasHoy = document.getElementById('citas-hoy');
    if (txtCitasHoy) txtCitasHoy.textContent = citasDeHoy;

    // 3. Obtener el inventario para calcular artículos con stock bajo (ejemplo: menos de 5 unidades)
    const resInventario = await api.get('/inventario');
    const stockBajoCount = resInventario.data.filter(item => item.cantidad <= 5).length;
    
    const txtStockBajo = document.getElementById('stock-bajo');
    if (txtStockBajo) txtStockBajo.textContent = stockBajoCount;

    // 4. Obtener pagos pendientes y renderizar la lista de pagos recientes
    const resPagos = await api.get('/pagos');
    const pagos = resPagos.data;
    
    const pagosPendientes = pagos.filter(pago => pago.estado === 'pendiente').length;
    const txtPagosPendientes = document.getElementById('pagos-pendientes');
    if (txtPagosPendientes) txtPagosPendientes.textContent = `$${pagosPendientes}`;

    renderizarPagosRecientes(pagos);

  } catch (error) {
    console.error('Error al cargar métricas del dashboard:', error);
  }
}

function renderizarPagosRecientes(pagos) {
  const listaPagos = document.getElementById('lista-pagos');
  if (!listaPagos) return;

  listaPagos.innerHTML = '';
  
  // Mostrar solo los últimos 5 pagos realizados o registrados
  const ultimosPagos = pagos.slice(-5).reverse();

  if (ultimosPagos.length === 0) {
    listaPagos.innerHTML = '<li>No hay pagos registrados recientemente.</li>';
    return;
  }

  ultimosPagos.forEach(pago => {
    const li = document.createElement('li');
    li.style.padding = '8px 0';
    li.style.borderBottom = '1px solid #eee';
    li.innerHTML = `
      <strong>${pago.concepto || 'Pago de tratamiento'}</strong> - 
      <span style="color: green;">$${pago.monto}</span> 
      <small style="color: gray; float: right;">${pago.fecha || ''}</small>
    `;
    listaPagos.appendChild(li);
  });
}