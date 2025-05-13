const modal = document.getElementById('modalNuevoPaciente');
  const abrir = document.getElementById('btnNuevoPaciente');
  const cerrar = document.getElementById('cerrarModal');

  abrir.onclick = () => modal.style.display = 'flex';
  cerrar.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  