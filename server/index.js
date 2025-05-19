import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

import cors from 'cors';
app.use(cors());


app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self' blob: data: https://*.firebaseio.com https://*.firebaseapp.com https://www.gstatic.com https://fonts.googleapis.com https://fonts.gstatic.com https://res.cloudinary.com https://cdn.jsdelivr.net https://kit.fontawesome.com https://cdnjs.cloudflare.com https://imgs.search.brave.com;" +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.firebaseapp.com https://www.gstatic.com https://kit.fontawesome.com https://cdnjs.cloudflare.com;" +
    "script-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.firebaseapp.com https://www.gstatic.com https://kit.fontawesome.com https://cdnjs.cloudflare.com;" +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://kit.fontawesome.com https://cdnjs.cloudflare.com;" +
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://kit.fontawesome.com https://cdnjs.cloudflare.com;" +
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://kit.fontawesome.com https://cdnjs.cloudflare.com;" +
    "img-src 'self' data: blob: https://res.cloudinary.com https://imgs.search.brave.com https://upload.wikimedia.org;" +
    "connect-src 'self' https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://www.googleapis.com https://apis-system-ortodoncist.onrender.com;" +
    "worker-src 'self' blob:;"  // necesario para Firebase
  );
  next();
});




// 🗂️ Archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));


// 🏠 Ruta raíz → redirigir a login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 🔐 Login
app.get('/login', (req, res) => {
  const loginPath = path.join(__dirname, '..', 'public', 'views', 'login.html');
  res.sendFile(loginPath);
});

// ✅ Principal (post-login)
app.get('/principal', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'public', 'index.html');
  res.sendFile(indexPath);
});

// 👥 Pacientes
app.get('/pacientes', (req, res) => {
  const pacientesPath = path.join(__dirname, '..', 'public', 'views', 'pacientes.html');
  res.sendFile(pacientesPath);
});

app.get('/citas', (req, res) => {
  const citasPath = path.join(__dirname, '..', 'public', 'views', 'citas.html');
  res.sendFile(citasPath);
});

app.get('/pagos', (req, res) => {
  const pagosPath = path.join(__dirname, '..', 'public', 'views', 'pagos.html');
  res.sendFile(pagosPath);
});

app.get('/inventario', (req, res) => {
  const inventarioPath = path.join(__dirname, '..', 'public', 'views', 'inventario.html');
  res.sendFile(inventarioPath);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
