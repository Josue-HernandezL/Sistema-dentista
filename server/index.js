import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'views', 'login.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error al enviar el archivo:', err);
            res.status(404).send('Archivo no encontrado');
        }
    });
});

//Ruta inde.html
app.get('/index', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error al enviar index.html:', err);
            res.status(500).send('Error interno del servidor');
        }
    });  
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});