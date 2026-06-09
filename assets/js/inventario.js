import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase-config.js';
import { api } from './api.js';

const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) window.location.href = '/views/login.html';
  else cargarInventario();
});

const modalItem = document.getElementById('modalAgregarItem');
const btnAbrirModal = document.getElementById('btnAgregarItem');
const btnCerrarModal = document.getElementById('cerrarModalItem');
const formAgregarItem = document.getElementById('formAgregarItem');
const grid = document.querySelector('.inventory-grid');
const spanTotal = document.querySelector('.inventory-footer span:nth-child(2)');
const spanContador = document.querySelector('.inventory-footer span:nth-child(1)');
const inputBusqueda = document.querySelector('.search-bar');
const tituloModal = document.getElementById('modalTitulo');
const btnEnviar = document.getElementById('btnEnviarProducto');
const filtroBtn = document.querySelector('.filter-btn');

let listaProductos = [];
let modoEdicion = false;
let idProductoEditando = null;
let estadoFiltro = 'all';

async function cargarInventario() {
  try {
    const { data } = await api.get('/inventario');
    listaProductos = data;
    aplicarFiltros();
  } catch (error) {
    grid.innerHTML = '<p>Error al cargar productos</p>';
  }
}

function crearTarjetaProducto(producto) {
  const div = document.createElement('div');
  div.classList.add('inventory-card');
  const threshold = 5; // Valor fijo o guardado en BD
  div.innerHTML = `
    <div class="card-tags">
      <span class="tag category">${producto.categoria || 'General'}</span>
      <span class="tag stock ${producto.cantidad > threshold ? 'green' : 'red'}">${producto.cantidad} in stock</span>
    </div>
    <h3 class="product-title">${producto.nombre}</h3>
    <div class="info-row">
      <p class="price">Precio: $${(producto.precioUnitario || 0).toFixed(2)}</p>
    </div>
    <div class="card-footer">
      <button class="edit-btn" data-id="${producto.id}">Editar</button>
      <button class="delete-btn" data-id="${producto.id}">Eliminar</button>
    </div>
  `;
  grid.appendChild(div);
}

function actualizarTotales(productos) {
  const total = productos.reduce((acc, item) => acc + ((item.precioUnitario || 0) * (item.cantidad || 0)), 0);
  spanTotal.textContent = `Valor total: $${total.toFixed(2)}`;
  spanContador.textContent = `Mostrando ${productos.length} items`;
}

btnAbrirModal.addEventListener('click', () => {
  formAgregarItem.reset();
  modoEdicion = false; idProductoEditando = null;
  tituloModal.textContent = 'Nuevo Producto';
  modalItem.classList.remove('hidden');
});

btnCerrarModal.addEventListener('click', () => modalItem.classList.add('hidden'));

formAgregarItem.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formAgregarItem);

  // Traducción a Zod Backend
  const nuevoItem = {
    nombre: formData.get('nombre'),
    categoria: formData.get('categoria'),
    precioUnitario: parseFloat(formData.get('precio')),
    cantidad: parseInt(formData.get('stock')),
  };

  try {
    if (modoEdicion) await api.put(`/inventario/${idProductoEditando}`, nuevoItem);
    else await api.post('/inventario', nuevoItem);

    alert(`✅ Producto ${modoEdicion ? 'actualizado' : 'agregado'}`);
    modalItem.classList.add('hidden');
    cargarInventario();
  } catch (error) {
    if (error.detalles) alert(`❌ Error: ${error.detalles.map(d => d.mensaje).join(', ')}`);
  }
});

grid.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('edit-btn')) {
    const p = listaProductos.find(x => x.id === id);
    if (!p) return;
    modoEdicion = true; idProductoEditando = id;
    
    // Traducción inversa
    formAgregarItem.nombre.value = p.nombre;
    formAgregarItem.categoria.value = p.categoria || '';
    formAgregarItem.precio.value = p.precioUnitario || 0;
    formAgregarItem.stock.value = p.cantidad || 0;

    tituloModal.textContent = 'Editar Producto';
    modalItem.classList.remove('hidden');
  }

  if (e.target.classList.contains('delete-btn')) {
    if (confirm('¿Eliminar este producto?')) {
      await api.delete(`/inventario/${id}`);
      cargarInventario();
    }
  }
});

function aplicarFiltros() {
  const texto = inputBusqueda.value.trim().toLowerCase();
  let filtrados = listaProductos.filter(p => p.nombre.toLowerCase().includes(texto));
  grid.innerHTML = '';
  filtrados.forEach(crearTarjetaProducto);
  actualizarTotales(filtrados);
}

inputBusqueda.addEventListener('input', aplicarFiltros);