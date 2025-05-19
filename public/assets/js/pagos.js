const URL_RENDER = 'https://apis-system-ortodoncist.onrender.com/api/pagos';
const API_PACIENTES = 'https://apis-system-ortodoncist.onrender.com/api/pacientes';

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
const token = localStorage.getItem('jwtToken');

function agregarFila(pago) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${pago.id}</td>
    <td><strong>${pago.patient}</strong></td>
    <td>${pago.date}</td>
    <td><strong>$${parseFloat(pago.amount).toFixed(2)}</strong></td>
    <td>${getMetodoIcono(pago.method)} ${pago.method}</td>
    <td><span class="status ${pago.status.toLowerCase()}">${pago.status}</span></td>
    <td><button class="edit-btn" data-id="${pago.id}">Edit</button></td>
  `;
  tbodyPagos.appendChild(tr);
  count++;
}

function actualizarResumen() {
  contadorPagos.textContent = `Showing ${count} payments`;
  totalPagos.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
}

function getMetodoIcono(metodo) {
  if (metodo === 'Cash') return '💵';
  if (metodo === 'Credit Card') return '💳';
  if (metodo === 'Transfer') return '🔁';
  return '';
}

function mostrarPagosFiltrados(filtroEstado = estadoActivo, busqueda = textoBusqueda) {
  tbodyPagos.innerHTML = '';
  total = 0;
  count = 0;

  const pagosFiltrados = listaPagos.filter(pago => {
    const coincideEstado = filtroEstado === 'all' || pago.status.toLowerCase() === filtroEstado.toLowerCase();
    const coincideBusqueda =
      pago.id.toLowerCase().includes(busqueda) ||
      pago.patient.toLowerCase().includes(busqueda);
    return coincideEstado && coincideBusqueda;
  });

  pagosFiltrados.forEach(pago => {
    agregarFila(pago);
    if (pago.status.toLowerCase() !== 'cancelled') {
      total += parseFloat(pago.amount);
    }
    count++;
  });

  actualizarResumen();
}

async function cargarPagos() {
  try {
    const response = await fetch(URL_RENDER, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) throw new Error('Error al cargar pagos');

    const data = await response.json();
    listaPagos = [];

    Object.entries(data).forEach(([id, pago]) => {
      listaPagos.push({ id, ...pago });
    });

    mostrarPagosFiltrados();
  } catch (error) {
    console.error('❌ Error al obtener pagos:', error);
    tbodyPagos.innerHTML = '<tr><td colspan="7">Error al cargar pagos</td></tr>';
  }
}

async function cargarPacientes() {
  try {
    const response = await fetch(API_PACIENTES, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
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

btnAgregar.addEventListener('click', () => {
  cargarPacientes();
  modoEdicion = false;
  idPagoEditando = null;
  formAgregar.reset();
  modal.classList.remove('hidden');
});

cerrarModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

formAgregar.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(formAgregar);
  const pago = {
    patient: formData.get('patient'),
    date: formData.get('date'),
    amount: parseFloat(formData.get('amount')),
    method: formData.get('method'),
    status: formData.get('status')
  };

  const url = modoEdicion ? `${URL_RENDER}/${idPagoEditando}` : URL_RENDER;
  const method = modoEdicion ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(pago)
    });

    if (!response.ok) throw new Error('Error al guardar el pago');

    alert(modoEdicion ? '✅ Pago actualizado' : '✅ Pago agregado');
    modal.classList.add('hidden');
    formAgregar.reset();
    modoEdicion = false;
    idPagoEditando = null;
    await cargarPagos();
  } catch (err) {
    console.error(err);
    alert('❌ Error al guardar el pago');
  }
});

tbodyPagos.addEventListener('click', e => {
  if (e.target.classList.contains('edit-btn')) {
    const id = e.target.dataset.id;
    const pago = listaPagos.find(p => p.id === id);
    if (!pago) return;

    modoEdicion = true;
    idPagoEditando = id;

    cargarPacientes().then(() => {
      inputPaciente.value = pago.patient;
      formAgregar.date.value = pago.date;
      formAgregar.amount.value = pago.amount;
      formAgregar.method.value = pago.method;
      formAgregar.status.value = pago.status;
      modal.classList.remove('hidden');
    });
  }
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    estadoActivo = btn.dataset.status;
    mostrarPagosFiltrados();
  });
});

document.querySelector('.search-bar').addEventListener('input', e => {
  textoBusqueda = e.target.value.toLowerCase();
  mostrarPagosFiltrados();
});

document.addEventListener('DOMContentLoaded', cargarPagos);
