document.addEventListener('DOMContentLoaded', function() {
    fetchData();
    initializeMap();
});

let latitud, longitud;

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

function fetchData() {
    fetch('/api/administradores')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('crudTableBody');
            tableBody.innerHTML = '';
            data.forEach(admin => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${admin.ID}</td>
                    <td>${admin.Nombre}</td>
                    <td>${admin.Correo}</td>
                    <td>${admin.Rol}</td>
                    <td>${admin.Direccion}</td>
                    <td class="actions">
                        <button onclick="editAdmin(${admin.ID})">✏️</button>
                        <button onclick="deleteAdmin(${admin.ID})">🗑️</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

document.getElementById('crudForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    data.latitud = latitud;
    data.longitud = longitud;

    const url = `/api/administradores${data.id ? '/' + data.id : ''}`;
    const method = data.id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        fetchData();
        document.getElementById('crudForm').reset();
    })
    .catch(error => console.error('Error saving data:', error));
});

function editAdmin(id) {
    fetch(`/api/administradores/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(admin => {
            document.getElementById('id').value = admin.ID;
            document.getElementById('nombre').value = admin.Nombre;
            document.getElementById('correo').value = admin.Correo;
            document.getElementById('direccion').value = admin.Direccion;
            latitud = admin.Latitud;
            longitud = admin.Longitud;
            updateAddress();
        })
        .catch(error => console.error('Error editing data:', error));
}

function deleteAdmin(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este administrador?')) {
        fetch(`/api/administradores/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            fetchData();
        })
        .catch(error => console.error('Error deleting data:', error));
    }
}





