import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname,'..', 'public')));

app.get('/login', (req, res) => {
    const loginPath = path.join(__dirname, '..', 'public', 'views', 'login.html');
    res.sendFile(loginPath, (err) => {
        if (err) {
            console.error('Error al enviar el archivo:', err);
            res.status(404).send('Archivo no encontrado');
        }
    });
});

//Ruta inde.html
app.get('/principal', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error al enviar index.html:', err);
            res.status(500).send('Error interno del servidor');
        }
    });  
});

app.get('/pacientes', (req, res) => {
    const loginPath = path.join(__dirname, '..', 'public', 'views', 'pacientes.html');
    res.sendFile(loginPath, (err) => {
        if(err) {
            console.error('Error al enviar el archivo:', err);
            res.status(500).send('Archivo no encontrado');
        }
    })
})

app.get('/citas', (req, res) => {
    const citasPath = path.join(__dirname, '..', 'public', 'views', 'citas.html');
    res.sendFile(citasPath, (err) => {
        if(err) {
            console.error('Error al enviar el archivo:', err);
            res.status(500).send('Archivo no encontrado');
        }
    })
})

app.get('/pagos', (req, res) => {
    const pagosPath = path.join(__dirname, '..', 'public', 'views', 'pagos.html');
    res.sendFile(pagosPath, (err) => {
        if(err) {
            console.error('Error al enviar el archivo:', err);
            res.status(500).send('Archivo no encontrado');
        }
    })
})

app.get('/inventario', (req, res) => {
    const inventarioPath = path.join(__dirname, '..', 'public', 'views', 'inventario.html');
    res.sendFile(inventarioPath, (err) => {
        if(err) {
            console.error('Error al enviar el archivo:', err);
            res.status(500).send('Archivo no encontrado');
        }
    })
})

app.get('/configuracion', (req, res) => {
    const configPath = path.join(__dirname, '..', 'public', 'views', 'configuracion.html');
    res.sendFile(configPath, (err) => {
        if(err) {
            console.error('Error al enviar el archivo:', err);
            res.status(500).send('Archivo no encontrado');
        }
    })
})

const PORT = process.env.PORT || 3000;  
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});