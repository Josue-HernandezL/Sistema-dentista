const $circleButonLogin = document.querySelector('.circle-chevron-down');
const $modal = document.getElementById('loginModal');

$circleButonLogin.addEventListener('click', () => {
    $modal.style.display = 'flex';
    $modal.innerHTML = `<div class="modal-content">
        <span class="close-button" id="closeModal">&times;</span>
        <h2>Iniciar Sesión</h2>
        <form id="loginForm">
            <label for="email">Correo:</label>
            <input type="email" id="email" name="email" required>
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required>
            <button type="submit" class="login-button" id="btn-login">Login</button>
        </form>
    </div>`;
 
});

console.log("Funcionando")