require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Conectar a MySQL
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Rutas de la API

// Obtener todos los contactos
app.get('/api/contacts', (req, res) => {
    const query = 'SELECT * FROM contacts ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo contactos:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json(results);
    });
});

// Crear nuevo contacto
app.post('/api/contacts', (req, res) => {
    const { name, email, phone, address } = req.body;
    
    // Validaciones
    if (!name || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    
    const query = 'INSERT INTO contacts (name, email, phone, address) VALUES (?, ?, ?, ?)';
    
    db.query(query, [name, email, phone, address], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'El email ya existe' });
            }
            console.error('Error creando contacto:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.status(201).json({ message: 'Contacto creado', id: results.insertId });
    });
});

// Eliminar contacto
app.delete('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM contacts WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error eliminando contacto:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Contacto no encontrado' });
        }
        res.json({ message: 'Contacto eliminado' });
    });
});

// Servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});