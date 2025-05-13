 const modal = document.getElementById('ventanaFlotante');
  const abrir = document.getElementById('openModal');
  const cerrar = document.getElementById('cerrarVentana');

  abrir.onclick = () => modal.style.display = 'flex';
  cerrar.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  document.getElementById('formularioEjemplo').addEventListener('submit', function(e) {
    e.preventDefault(); // evita recarga
    const datos = Object.fromEntries(new FormData(this));
    console.log('📤 Datos enviados:', datos);
    modal.style.display = 'none'; // cerrar modal
    this.reset(); // limpiar formulario
  });