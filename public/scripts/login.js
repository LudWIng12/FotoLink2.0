document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
});

let latitud, longitud;

function showRegisterForm() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'flex';
    initializeMap(); // Inicializar el mapa al mostrar el formulario de registro
}

function showLoginForm() {
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('success-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
}

function initializeMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            latitud = position.coords.latitude;
            longitud = position.coords.longitude;
            const map = L.map('map').setView([latitud, longitud], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const marker = L.marker([latitud, longitud], { draggable: true }).addTo(map);
            marker.on('dragend', function(event) {
                const marker = event.target;
                const position = marker.getLatLng();
                latitud = position.lat;
                longitud = position.lng;
                updateAddress();
            });

            updateAddress();
        }, () => {
            alert('No se pudo obtener su ubicación.');
        });
    } else {
        alert('Geolocalización no es soportada por este navegador.');
    }
}

function updateAddress() {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}`)
        .then(response => response.json())
        .then(data => {
            const address = data.display_name;
            document.getElementById('direccion').value = address;
        })
        .catch(error => console.error('Error fetching address:', error));
}

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    data.latitud = latitud;
    data.longitud = longitud;

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('success-container').style.display = 'flex';
        setTimeout(showLoginForm, 2000); // Mostrar el formulario de login después de 2 segundos
    } else {
        alert('Error en el registro');
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.user) {
        const user = result.user;
        if (user.ID_Rol === 1) {
            window.location.href = '/admin';
        } else if (user.ID_Rol === 2) {
            window.location.href = '/empleado';
        } else if (user.ID_Rol === 3) {
            window.location.href = '/usuario';
        } else {
            alert(result.message);
        }
    } else {
        alert('Error en el login');
    }
});
