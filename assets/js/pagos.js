import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase-config.js';
import { api } from './api.js';

const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) window.location.href = '/views/login.html';
  else cargarPagos();
});

const modal = document.getElementById('modalAgregarPago');
const btnAgregar = document.getElementById('btnAgregarPago');
const cerrarModal = document.getElementById('cerrarModal');
const formAgregar = document.getElementById('formAgregarPago');
const inputPaciente = document.getElementById('inputPaciente');
const tbodyPagos = document.getElementById('tablaPagosBody');
const contadorPagos = document.getElementById('contadorPagos');
const totalPagos = document.getElementById('totalPagos');

let listaPagos = [];
let total = 0;
let count = 0;
let estadoActivo = 'all';
let textoBusqueda = '';
let modoEdicion = false;
let idPagoEditando = null;

function getMetodoIcono(metodo) {
  if (metodo === 'efectivo') return '💵';
  if (metodo === 'tarjeta') return '💳';
  if (metodo === 'transferencia') return '🔁';
  return '💰';
}

function mostrarPagosFiltrados(filtroEstado = estadoActivo, busqueda = textoBusqueda) {
  tbodyPagos.innerHTML = '';
  total = 0; count = 0;

  const pagosFiltrados = listaPagos.filter(pago => {
    const coincideEstado = filtroEstado === 'all' || pago.estado === filtroEstado;
    const coincideBusqueda = pago.pacienteId.toLowerCase().includes(busqueda);
    return coincideEstado && coincideBusqueda;
  });

  pagosFiltrados.forEach(pago => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pago.id.slice(-6)}</td>
      <td><strong>${pago.pacienteId}</strong></td>
      <td>${pago.fecha}</td>
      <td><strong>$${parseFloat(pago.monto).toFixed(2)}</strong></td>
      <td>${getMetodoIcono(pago.metodoPago)} ${pago.metodoPago}</td>
      <td><span class="status ${pago.estado}">${pago.estado}</span></td>
      <td>
        <button class="edit-btn" data-id="${pago.id}">Edit</button>
        <button class="delete-btn" data-id="${pago.id}" style="color:red; margin-left:5px;">X</button>
      </td>
    `;
    tbodyPagos.appendChild(tr);
    if (pago.estado !== 'reembolsado') total += parseFloat(pago.monto);
    count++;
  });

  contadorPagos.textContent = `Mostrando ${count} pagos`;
  totalPagos.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
}

async function cargarPagos() {
  try {
    const { data } = await api.get('/pagos');
    listaPagos = data;
    mostrarPagosFiltrados();
  } catch (error) {
    tbodyPagos.innerHTML = '<tr><td colspan="7">Error al cargar pagos</td></tr>';
  }
}

async function cargarPacientes() {
  try {
    const { data } = await api.get('/pacientes');
    inputPaciente.innerHTML = '<option value="">Seleccione un paciente</option>';
    data.forEach(paciente => {
      const option = document.createElement('option');
      option.value = `${paciente.nombre} ${paciente.apellidos || ''}`;
      option.textContent = option.value;
      inputPaciente.appendChild(option);
    });
  } catch (error) { console.error('Error pacientes:', error); }
}

btnAgregar.addEventListener('click', () => {
  cargarPacientes();
  modoEdicion = false; idPagoEditando = null;
  formAgregar.reset();
  modal.classList.remove('hidden');
});

cerrarModal.addEventListener('click', () => modal.classList.add('hidden'));

formAgregar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formAgregar);

  // Mapear HTML al Zod del Backend
  const mapMetodo = { 'Cash': 'efectivo', 'Credit Card': 'tarjeta', 'Transfer': 'transferencia' };
  const mapEstado = { 'Paid': 'completado', 'Pending': 'pendiente' };

  const pagoToSave = {
    pacienteId: formData.get('patient'),
    monto: parseFloat(formData.get('amount')),
    fecha: formData.get('date'),
    metodoPago: mapMetodo[formData.get('method')] || 'efectivo',
    estado: mapEstado[formData.get('status')] || 'completado',
    concepto: "Pago de tratamiento"
  };

  try {
    if (modoEdicion) await api.put(`/pagos/${idPagoEditando}`, pagoToSave);
    else await api.post('/pagos', pagoToSave);

    alert(`✅ Pago ${modoEdicion ? 'actualizado' : 'registrado'}`);
    modal.classList.add('hidden');
    cargarPagos();
  } catch (err) {
    if (err.detalles) alert(`❌ Error: ${err.detalles.map(d => d.mensaje).join(', ')}`);
  }
});

tbodyPagos.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('edit-btn')) {
    const pago = listaPagos.find(p => p.id === id);
    if (!pago) return;
    modoEdicion = true; idPagoEditando = id;
    await cargarPacientes();
    
    // Mapeo inverso
    const reverseMetodo = { 'efectivo': 'Cash', 'tarjeta': 'Credit Card', 'transferencia': 'Transfer' };
    const reverseEstado = { 'completado': 'Paid', 'pendiente': 'Pending' };

    inputPaciente.value = pago.pacienteId;
    formAgregar.date.value = pago.fecha;
    formAgregar.amount.value = pago.monto;
    formAgregar.method.value = reverseMetodo[pago.metodoPago] || 'Cash';
    formAgregar.status.value = reverseEstado[pago.estado] || 'Paid';
    modal.classList.remove('hidden');
  }

  if (e.target.classList.contains('delete-btn')) {
    if(confirm('¿Eliminar este pago?')) {
      await api.delete(`/pagos/${id}`);
      cargarPagos();
    }
  }
});

document.querySelector('.search-bar').addEventListener('input', e => {
  textoBusqueda = e.target.value.toLowerCase();
  mostrarPagosFiltrados();
});