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
    fetch('/api/empleados')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('crudTableBody');
            tableBody.innerHTML = '';
            data.forEach(empleado => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${empleado.ID}</td>
                    <td>${empleado.Nombre}</td>
                    <td>${empleado.Correo}</td>
                    <td>${empleado.Direccion}</td>
                    <td>${empleado.Telefono}</td>
                    <td>${empleado.Roles}</td>
                    <td class="actions">
                        <button onclick="editEmpleado(${empleado.ID})">✏️</button>
                        <button onclick="deleteEmpleado(${empleado.ID})">🗑️</button>
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

    data.rol = Array.from(document.getElementById('rol').selectedOptions).map(option => option.value).join(',');

    fetch(`/api/empleados${data.id ? '/' + data.id : ''}`, {
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
    })
    .catch(error => console.error('Error saving data:', error));
});

function editEmpleado(id) {
    fetch(`/api/empleados/${id}`)
        .then(response => response.json())
        .then(empleado => {
            document.getElementById('id').value = empleado.ID;
            document.getElementById('nombre').value = empleado.Nombre;
            document.getElementById('correo').value = empleado.Correo;
            document.getElementById('direccion').value = empleado.Direccion;
            document.getElementById('telefono').value = empleado.Telefono;
            latitud = empleado.Latitud;
            longitud = empleado.Longitud;

            const roles = empleado.Roles.split(',');
            const rolSelect = document.getElementById('rol');
            Array.from(rolSelect.options).forEach(option => {
                if (roles.includes(option.value)) {
                    option.selected = true;
                }
            });

            updateAddress();
        })
        .catch(error => console.error('Error editing data:', error));
}

function deleteEmpleado(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
        fetch(`/api/empleados/${id}`, {
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
