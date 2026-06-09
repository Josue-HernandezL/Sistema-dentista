const $index = document.getElementById('img-logo');
$index.addEventListener('click', (e) => { 
    e.preventDefault();
    window.location.href = '/principal';
});

document.querySelectorAll('a[class^="redirect"]').forEach((element) => {
  element.addEventListener('click', (e) => {
    e.preventDefault();

    // Extraer clase completa, ejemplo: "redirectcitas"
    const fullClass = element.className;

    // Obtener la parte después de "redirect"
    const path = fullClass.replace("redirect", "");

    // Redirigir a la URL correspondiente
    if (path) {
      window.location.href = `/${path}`;
    }
  });
});
console.log('Script global.js cargado correctamente');