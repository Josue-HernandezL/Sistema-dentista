# 🦷 Sistema Web de Gestión Ortodoncista - Frontend

![Licencia Personalizada](https://img.shields.io/badge/Licencia-Uso%20Condicional-blue)

Este repositorio contiene la interfaz web del sistema para gestionar **citas, pacientes, pagos e inventario** en un consultorio dental.  
Desarrollado con **HTML, CSS, JavaScript y Express**, se conecta a Firebase y a una API REST protegida mediante `x-api-key`.

---

## 📁 Estructura del proyecto

```
/Sistema-dentista
│
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── citas.css
│   │   │   ├── configuracion.css
│   │   │   ├── global.css
│   │   │   ├── inventario.css
│   │   │   ├── login.css
│   │   │   ├── pacientes.css
│   │   │   ├── pagos.css
│   │   │   └── principal.css
│   │   └── imgs/
│   │       ├── dente.png
│   │       └── img.webp
│   ├── js/
│   │   ├── citas.js
│   │   ├── firebase-config.js
│   │   ├── global.js
│   │   ├── inventario.js
│   │   ├── login.js
│   │   ├── pacientes.js
│   │   ├── pagos.js
│   │   └── principal.js
│
├── views/
│   ├── citas.html
│   ├── configuracion.html
│   ├── inventario.html
│   ├── login.html
│   ├── pacientes.html
│   ├── pagos.html
│   └── index.html
│
├── server/
│   └── index.js
│
├── .env
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
└── README.md
```

---

## 🚀 Cómo ejecutar el proyecto

1. Clona el repositorio:

```bash
git clone https://github.com/Josue-HernandezL/Sistema-dentista.git
cd Sistema-dentista
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` con las variables necesarias:

```env
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_auth_domain
DATABASEURL=tu_database_url
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_STORAGE_BUCKET=tu_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id
MEASUREMENT_ID=tu_measurement_id
API_KEY=tu_api_key_secreta
```

4. Ejecuta el servidor:

```bash
npm start
```

Luego, abre tu navegador en `http://localhost:3000` para usar la aplicación.

---

## 🔗 Comunicación con la API

El sistema hace solicitudes a la API backend en las siguientes rutas:

- `/pacientes`
- `/citas`
- `/pagos`
- `/inventario`

Cada solicitud debe incluir:

```http
x-api-key: tu_api_key_secreta
```

---

## 📜 Licencia

Este proyecto está protegido bajo una **Licencia de Uso Condicional** desarrollada por **Josué Hernández López**.

- El uso del software está permitido **únicamente con autorización expresa** del autor.
- El permiso puede ser revocado en cualquier momento, sin previo aviso.
- No se permite la redistribución, modificación o comercialización sin consentimiento.

🔒 **Este proyecto NO es de código abierto** bajo licencias estándar (MIT, GPL, Apache, etc.).  
Consulta el archivo `LICENSE` para más información legal.

¿Deseas utilizar este software? Comunícate con el autor para obtener permiso:  
📧 jh6466011@gmail.com
