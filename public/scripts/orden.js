document.addEventListener('DOMContentLoaded', function () {
    fetchServicios();
    fetchOrdenes();
    initializeMap();
    fetchUsuarios();
    fetchEmpleados();
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
            marker.on('dragend', function (event) {
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
            document.getElementById('latitud').value = latitud;
            document.getElementById('longitud').value = longitud;
        })
        .catch(error => console.error('Error fetching address:', error));
}

function fetchServicios() {
    fetch('/api/servicios')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('serviciosTableBody');
            tableBody.innerHTML = '';
            data.forEach(servicio => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${servicio.ID}</td>
                    <td>${servicio.Nombre}</td>
                    <td>${servicio.Descripcion}</td>
                    <td>${servicio.Precio}</td>
                    <td>${servicio.Roles}</td>
                    <td class="actions">
                        <button onclick="editServicio(${servicio.ID})">✏️</button>
                        <button onclick="deleteServicio(${servicio.ID})">🗑️</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            const selectServicios = document.getElementById('servicios');
            selectServicios.innerHTML = '';
            data.forEach(servicio => {
                const option = document.createElement('option');
                option.value = servicio.ID;
                option.text = servicio.Nombre;
                selectServicios.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

document.getElementById('serviciosForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    data.roles = Array.from(document.getElementById('roles').selectedOptions).map(option => option.value);

    fetch(`/api/servicios${data.id ? '/' + data.id : ''}`, {
        method: data.id ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            fetchServicios();
            document.getElementById('serviciosForm').reset();
        })
        .catch(error => console.error('Error saving data:', error));
});

function editServicio(id) {
    fetch(`/api/servicios/${id}`)
        .then(response => response.json())
        .then(servicio => {
            document.getElementById('idServicio').value = servicio.ID;
            document.getElementById('nombreServicio').value = servicio.Nombre;
            document.getElementById('descripcionServicio').value = servicio.Descripcion;
            document.getElementById('precioServicio').value = servicio.Precio;

            const roles = servicio.Roles.split(',');
            const rolSelect = document.getElementById('roles');
            Array.from(rolSelect.options).forEach(option => {
                if (roles.includes(option.value)) {
                    option.selected = true;
                }
            });
        })
        .catch(error => console.error('Error editing data:', error));
}

function deleteServicio(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
        fetch(`/api/servicios/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                fetchServicios();
            })
            .catch(error => console.error('Error deleting data:', error));
    }
}

function fetchOrdenes() {
    fetch('/api/ordenes')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('ordenesTableBody');
            tableBody.innerHTML = '';
            data.forEach(orden => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${orden.ID}</td>
                    <td>${orden.Usuario}</td>
                    <td>${orden.Fecha_Pedido}</td>
                    <td>${orden.Fecha_Trabajo}</td>
                    <td>${orden.Fecha_Entrega}</td>
                    <td>${orden.Direccion}</td>
                    <td>${orden.Latitud}</td>
                    <td>${orden.Longitud}</td>
                    <td>${orden.Total}</td>
                    <td>${orden.Saldo}</td>
                    <td>${orden.Estado_Orden}</td>
                    <td>${orden.Estado_Pago}</td>
                    <td>${orden.Metodo_de_Pago}</td>
                    <td class="actions">
                        <button onclick="editOrden(${orden.ID})">✏️</button>
                        <button onclick="deleteOrden(${orden.ID})">🗑️</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

document.getElementById('ordenesForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    data.latitud = latitud;
    data.longitud = longitud;
    data.servicios = Array.from(document.getElementById('servicios').selectedOptions).map(option => option.value);
    data.empleados = Array.from(document.getElementById('empleados').selectedOptions).map(option => option.value);

    fetch(`/api/ordenes${data.id ? '/' + data.id : ''}`, {
        method: data.id ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            fetchOrdenes();
            document.getElementById('ordenesForm').reset();
        })
        .catch(error => console.error('Error saving data:', error));
});

function editOrden(id) {
    fetch(`/api/ordenes/${id}`)
        .then(response => response.json())
        .then(orden => {
            document.getElementById('id').value = orden.ID;
            document.getElementById('usuario').value = orden.ID_Usuario;
            document.getElementById('fechaTrabajo').value = orden.Fecha_Trabajo;
            document.getElementById('fechaEntrega').value = orden.Fecha_Entrega;
            document.getElementById('direccion').value = orden.Direccion;
            document.getElementById('latitud').value = orden.Latitud;
            document.getElementById('longitud').value = orden.Longitud;
            document.getElementById('total').value = orden.Total;
            document.getElementById('saldo').value = orden.Saldo;
            document.getElementById('estadoOrden').value = orden.Estado_Orden;
            document.getElementById('estadoPago').value = orden.Estado_Pago;
            document.getElementById('metodoPago').value = orden.Metodo_de_Pago;

            const servicios = orden.Servicios.split(',');
            const serviciosSelect = document.getElementById('servicios');
            Array.from(serviciosSelect.options).forEach(option => {
                if (servicios.includes(option.value)) {
                    option.selected = true;
                }
            });

            const empleados = orden.Empleados.split(',');
            const empleadosSelect = document.getElementById('empleados');
            Array.from(empleadosSelect.options).forEach(option => {
                if (empleados.includes(option.value)) {
                    option.selected = true;
                }
            });

            latitud = orden.Latitud;
            longitud = orden.Longitud;
            updateAddress();
        })
        .catch(error => console.error('Error editing data:', error));
}

function deleteOrden(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
        fetch(`/api/ordenes/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                fetchOrdenes();
            })
            .catch(error => console.error('Error deleting data:', error));
    }
}

function fetchUsuarios() {
    fetch('/api/usuarios')
        .then(response => response.json())
        .then(data => {
            const usuarioSelect = document.getElementById('usuario');
            usuarioSelect.innerHTML = '<option value="">Seleccione un usuario</option>';
            data.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.ID;
                option.text = usuario.Nombre;
                usuarioSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchEmpleados() {
    fetch('/api/empleados')
        .then(response => response.json())
        .then(data => {
            const empleadoSelect = document.getElementById('empleados');
            empleadoSelect.innerHTML = '';
            data.forEach(empleado => {
                const option = document.createElement('option');
                option.value = empleado.ID;
                option.text = empleado.Nombre;
                empleadoSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.style.display = section.style.display === 'block' ? 'none' : 'block';
}

