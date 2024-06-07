document.addEventListener('DOMContentLoaded', function() {
    fetchUsuarios();
    fetchServicios();
    fetchEmpleados();
    fetchOrdenes();

    var map = L.map('map').setView([21.1619, -100.9307], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var marker;
    map.on('click', function(e) {
        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }
        document.getElementById('ubicacion').value = `${e.latlng.lat},${e.latlng.lng}`;
    });

    document.querySelectorAll('.accordion').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            var panel = this.nextElementSibling;
            if (panel.style.display === 'block') {
                panel.style.display = 'none';
            } else {
                panel.style.display = 'block';
            }
        });
    });
});

function fetchUsuarios() {
    fetch('/api/usuarios')
        .then(response => response.json())
        .then(usuarios => {
            const usuarioSelect = document.getElementById('usuario');
            usuarios.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.ID;
                option.textContent = usuario.Nombre;
                usuarioSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching usuarios:', error));
}

function fetchServicios() {
    fetch('/api/servicios')
        .then(response => response.json())
        .then(servicios => {
            const serviciosSelect = document.getElementById('servicios');
            servicios.forEach(servicio => {
                const option = document.createElement('option');
                option.value = servicio.ID;
                option.textContent = servicio.Nombre;
                serviciosSelect.appendChild(option);
            });

            const serviciosTableBody = document.getElementById('serviciosTableBody');
            serviciosTableBody.innerHTML = '';
            servicios.forEach(servicio => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${servicio.ID}</td>
                    <td>${servicio.Nombre}</td>
                    <td>${servicio.Descripcion}</td>
                    <td>${servicio.Precio}</td>
                    <td class="actions">
                        <button onclick="editServicio(${servicio.ID})">✏️</button>
                        <button onclick="deleteServicio(${servicio.ID})">🗑️</button>
                    </td>
                `;
                serviciosTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching servicios:', error));
}

function fetchEmpleados() {
    fetch('/api/empleados')
        .then(response => response.json())
        .then(empleados => {
            const empleadosSelect = document.getElementById('empleados');
            empleados.forEach(empleado => {
                const option = document.createElement('option');
                option.value = empleado.ID;
                option.textContent = empleado.Nombre;
                empleadosSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching empleados:', error));
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
                    <td>${orden.UsuarioNombre}</td>
                    <td>${orden.Fecha_Pedido}</td>
                    <td>${orden.Fecha_Trabajo}</td>
                    <td>${orden.Fecha_Entrega}</td>
                    <td>${orden.Ubicacion}</td>
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
        .catch(error => console.error('Error fetching ordenes:', error));
}

document.getElementById('serviciosForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

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
    });
});

document.getElementById('ordenesForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    data.servicios = Array.from(document.getElementById('servicios').selectedOptions).map(option => ({
        ID_Servicio: option.value,
        Cantidad: 1 // Puedes ajustar esto según sea necesario
    }));

    data.empleados = Array.from(document.getElementById('empleados').selectedOptions).map(option => ({
        ID_Empleado: option.value
    }));

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
    });
});

function editServicio(id) {
    fetch(`/api/servicios/${id}`)
        .then(response => response.json())
        .then(servicio => {
            document.getElementById('idServicio').value = servicio.ID;
            document.getElementById('nombreServicio').value = servicio.Nombre;
            document.getElementById('descripcionServicio').value = servicio.Descripcion;
            document.getElementById('precioServicio').value = servicio.Precio;
        });
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
        });
    }
}

function editOrden(id) {
    fetch(`/api/ordenes/${id}`)
        .then(response => response.json())
        .then(orden => {
            document.getElementById('id').value = orden.ID;
            document.getElementById('usuario').value = orden.ID_Usuario;
            document.getElementById('fechaTrabajo').value = orden.Fecha_Trabajo;
            document.getElementById('fechaEntrega').value = orden.Fecha_Entrega;
            document.getElementById('ubicacion').value = orden.Ubicacion;
            document.getElementById('total').value = orden.Total;
            document.getElementById('saldo').value = orden.Saldo;
            document.getElementById('estadoOrden').value = orden.Estado_Orden;
            document.getElementById('estadoPago').value = orden.Estado_Pago;
            document.getElementById('metodoPago').value = orden.Metodo_de_Pago;

            // Lógica para seleccionar servicios y empleados (puede necesitar ajustes)
        });
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
        });
    }
}
