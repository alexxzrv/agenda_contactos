// URL base de la API
const API_BASE = 'http://localhost:3000/api';

// Elementos del DOM
const contactForm = document.getElementById('contactForm');
const contactsContainer = document.getElementById('contactsContainer');

// Evento para enviar el formulario
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Resetear errores
    hideAllErrors();
    
    // Obtener valores del formulario
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim()
    };
    
    // Validar campos
    if (validateForm(formData)) {
        try {
            await saveContact(formData);
            showAlert('Contacto guardado con éxito', 'success');
            contactForm.reset();
            loadContacts();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
});

// Función para validar el formulario
function validateForm(data) {
    let isValid = true;
    
    // Validar nombre
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!data.name || !nameRegex.test(data.name)) {
        showError('nameError');
        isValid = false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        showError('emailError');
        isValid = false;
    }
    
    // Validar teléfono
    if (data.phone) {
        const phoneRegex = /^[0-9\s\-\(\)]+$/;
        if (!phoneRegex.test(data.phone)) {
            showError('phoneError');
            isValid = false;
        }
    }
    
    // Validar dirección
    if (data.address && /[<>$#{}[\]\\]/.test(data.address)) {
        showError('addressError');
        isValid = false;
    }
    
    if (!isValid) {
        showAlert('Por favor corrija los errores en el formulario', 'error');
    }
    
    return isValid;
}

// Función para guardar contacto
async function saveContact(contact) {
    const response = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el contacto');
    }
    
    return data;
}

// Función para cargar contactos
async function loadContacts() {
    try {
        const response = await fetch(`${API_BASE}/contacts`);
        
        if (!response.ok) {
            throw new Error('Error al cargar los contactos');
        }
        
        const contacts = await response.json();
        renderContacts(contacts);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar los contactos', 'error');
    }
}

// Función para mostrar contactos
function renderContacts(contacts) {
    if (contacts.length === 0) {
        contactsContainer.innerHTML = '<p id="noContacts">No hay contactos guardados. Agrega tu primer contacto.</p>';
        return;
    }
    
    let html = '';
    contacts.forEach(contact => {
        html += `
            <div class="contact-item">
                <div class="contact-info">
                    <h3>${escapeHtml(contact.name)}</h3>
                    <p>Email: ${escapeHtml(contact.email)}</p>
                    ${contact.phone ? `<p>Teléfono: ${escapeHtml(contact.phone)}</p>` : ''}
                    ${contact.address ? `<p>Dirección: ${escapeHtml(contact.address)}</p>` : ''}
                    <p><small>Creado: ${new Date(contact.created_at).toLocaleString()}</small></p>
                </div>
                <div class="contact-actions">
                    <button class="delete" onclick="deleteContact(${contact.id})">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    contactsContainer.innerHTML = html;
}

// Función para eliminar contacto
async function deleteContact(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/contacts/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al eliminar el contacto');
        }
        
        showAlert('Contacto eliminado', 'success');
        loadContacts();
    } catch (error) {
        console.error('Error:', error);
        showAlert(error.message, 'error');
    }
}

// Funciones de utilidad
function showError(id) {
    document.getElementById(id).style.display = 'block';
}

function hideAllErrors() {
    document.querySelectorAll('.error').forEach(error => {
        error.style.display = 'none';
    });
}

function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = 'block';
    
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 3000);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Cargar contactos al iniciar
document.addEventListener('DOMContentLoaded', loadContacts);