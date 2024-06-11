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
    fetch('/api/usuarios')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('crudTableBody');
            tableBody.innerHTML = '';
            data.forEach(usuario => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${usuario.ID}</td>
                    <td>${usuario.Nombre}</td>
                    <td>${usuario.Correo}</td>
                    <td>${usuario.Direccion || 'undefined'}</td>
                    <td>${usuario.Telefono || 'undefined'}</td>
                    <td class="actions">
                        <button onclick="editUsuario(${usuario.ID})">✏️</button>
                        <button onclick="deleteUsuario(${usuario.ID})">🗑️</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        });
}

document.getElementById('crudForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    data.latitud = latitud;
    data.longitud = longitud;

    fetch(`/api/usuarios${data.id ? '/' + data.id : ''}`, {
        method: data.id ? 'PUT' : 'POST',
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
    });
});

function editUsuario(id) {
    fetch(`/api/usuarios/${id}`)
        .then(response => response.json())
        .then(usuario => {
            document.getElementById('id').value = usuario.ID;
            document.getElementById('nombre').value = usuario.Nombre;
            document.getElementById('correo').value = usuario.Correo;
            document.getElementById('direccion').value = usuario.Direccion;
            document.getElementById('telefono').value = usuario.Telefono;
            latitud = usuario.Latitud;
            longitud = usuario.Longitud;
            updateAddress();
        });
}

function deleteUsuario(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        fetch(`/api/usuarios/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            fetchData();
        });
    }
}
