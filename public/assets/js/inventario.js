const URL_RENDER = 'https://apis-system-ortodoncist.onrender.com/api/inventario';

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
const token = localStorage.getItem('jwtToken');

document.addEventListener('DOMContentLoaded', cargarInventario);

// Cargar inventario
async function cargarInventario() {
  try {
    const response = await fetch(URL_RENDER, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) throw new Error('Error al cargar inventario');

    const data = await response.json();
    listaProductos = [];

    Object.entries(data).forEach(([id, producto]) => {
      listaProductos.push({ id, ...producto });
    });

    aplicarFiltros();
  } catch (error) {
    console.error('❌ Error al cargar inventario:', error);
    grid.innerHTML = '<p>Error al cargar productos</p>';
  }
}

function crearTarjetaProducto(producto) {
  const div = document.createElement('div');
  div.classList.add('inventory-card');
  div.innerHTML = `
    <div class="card-tags">
      <span class="tag category">${producto.categoria}</span>
      <span class="tag stock ${getColorStock(producto.stock, producto.threshold)}">${producto.stock} in stock</span>
    </div>
    <h3 class="product-title">${producto.nombre}</h3>
    <div class="info-row">
      <p class="price">Price: $${producto.precio.toFixed(2)}</p>
      <p class="threshold">Threshold: ${producto.threshold}</p>
    </div>
    <p class="restocked">Last restocked: ${producto.lastRestocked}</p>
    <div class="card-footer">
      <button class="edit-btn" data-id="${producto.id}">Edit</button>
      <button class="restock-btn">Restock</button>
      <button class="delete-btn" data-id="${producto.id}">Delete</button>
    </div>
  `;
  grid.appendChild(div);
}

function getColorStock(stock, threshold) {
  if (stock >= threshold) return 'green';
  if (stock > 0) return 'yellow';
  return 'red';
}

function actualizarTotales(productos) {
  const total = productos.reduce((acc, item) => acc + (item.precio * item.stock), 0);
  spanTotal.textContent = `Total value: $${total.toFixed(2)}`;
  spanContador.textContent = `Showing ${productos.length} items`;
}

btnAbrirModal.addEventListener('click', () => {
  formAgregarItem.reset();
  modoEdicion = false;
  idProductoEditando = null;
  tituloModal.textContent = 'Nuevo Producto';
  btnEnviar.textContent = 'Guardar';
  modalItem.classList.remove('hidden');
});

btnCerrarModal.addEventListener('click', () => {
  modalItem.classList.add('hidden');
  formAgregarItem.reset();
  modoEdicion = false;
  idProductoEditando = null;
});

formAgregarItem.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(formAgregarItem);
  const nuevoItem = {
    nombre: formData.get('nombre'),
    categoria: formData.get('categoria'),
    precio: parseFloat(formData.get('precio')),
    threshold: parseInt(formData.get('threshold')),
    stock: parseInt(formData.get('stock')),
    lastRestocked: formData.get('lastRestocked')
  };

  const url = modoEdicion ? `${URL_RENDER}/${idProductoEditando}` : URL_RENDER;
  const method = modoEdicion ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(nuevoItem)
    });

    if (!response.ok) throw new Error('Error al guardar el producto');

    if (modoEdicion) {
      const index = listaProductos.findIndex(p => p.id === idProductoEditando);
      if (index !== -1) listaProductos[index] = { id: idProductoEditando, ...nuevoItem };
    } else {
      const data = await response.json();
      listaProductos.push(data);
    }

    formAgregarItem.reset();
    modalItem.classList.add('hidden');
    modoEdicion = false;
    idProductoEditando = null;

    aplicarFiltros();
    alert(`✅ Producto ${modoEdicion ? 'actualizado' : 'agregado'} correctamente`);
  } catch (error) {
    console.error(error);
    alert('❌ Error al guardar el producto');
  }
});

grid.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;

  if (e.target.classList.contains('edit-btn')) {
    const producto = listaProductos.find(p => p.id === id);
    if (!producto) return;

    modoEdicion = true;
    idProductoEditando = id;

    formAgregarItem.nombre.value = producto.nombre;
    formAgregarItem.categoria.value = producto.categoria;
    formAgregarItem.precio.value = producto.precio;
    formAgregarItem.threshold.value = producto.threshold;
    formAgregarItem.stock.value = producto.stock;
    formAgregarItem.lastRestocked.value = producto.lastRestocked;

    tituloModal.textContent = 'Editar Producto';
    btnEnviar.textContent = 'Actualizar';
    modalItem.classList.remove('hidden');
  }

  if (e.target.classList.contains('delete-btn')) {
    const confirmar = confirm('¿Deseas eliminar este producto?');
    if (!confirmar) return;

    try {
      const response = await fetch(`${URL_RENDER}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) throw new Error('Error al eliminar');

      listaProductos = listaProductos.filter(p => p.id !== id);
      aplicarFiltros();
      alert('🗑️ Producto eliminado correctamente');
    } catch (error) {
      console.error(error);
      alert('❌ Error al eliminar producto');
    }
  }
});

inputBusqueda.addEventListener('input', aplicarFiltros);

filtroBtn.addEventListener('click', () => {
  if (estadoFiltro === 'all') {
    estadoFiltro = 'low';
    filtroBtn.textContent = 'Mostrar: Bajo stock';
  } else if (estadoFiltro === 'low') {
    estadoFiltro = 'ok';
    filtroBtn.textContent = 'Mostrar: Stock suficiente';
  } else {
    estadoFiltro = 'all';
    filtroBtn.textContent = 'Mostrar: Todos';
  }

  aplicarFiltros();
});

function aplicarFiltros() {
  const texto = inputBusqueda.value.trim().toLowerCase();

  let filtrados = listaProductos.filter(p =>
    p.nombre.toLowerCase().includes(texto) ||
    p.categoria.toLowerCase().includes(texto)
  );

  if (estadoFiltro === 'low') {
    filtrados = filtrados.filter(p => p.stock < p.threshold);
  } else if (estadoFiltro === 'ok') {
    filtrados = filtrados.filter(p => p.stock >= p.threshold);
  }

  grid.innerHTML = '';
  filtrados.forEach(p => crearTarjetaProducto(p));
  actualizarTotales(filtrados);
}

// REDIRECCIONES A OTRAS VISTAS
document.querySelector('.redirectprincipal')?.addEventListener('click', () => {
  window.location.href = '/principal';
});

document.querySelector('.redirectpacientes')?.addEventListener('click', () => {
  window.location.href = '/pacientes';
});

document.querySelector('.redirectcitas')?.addEventListener('click', () => {
  window.location.href = '/citas';
});

document.querySelector('.redirectpagos')?.addEventListener('click', () => {
  window.location.href = '/pagos';
});

document.querySelector('.redirectinventario')?.addEventListener('click', () => {
  window.location.href = '/inventario';
});

document.querySelector('.redirectconfiguracion')?.addEventListener('click', () => {
  window.location.href = '/configuracion';
});

document.querySelector('.redirectlogin')?.addEventListener('click', () => {
  // Limpia token y redirige
  localStorage.removeItem('jwtToken');
  window.location.href = '/login';
});
