const sesionAdmin = VeterinariaStorage.obtenerSesion();
if (!sesionAdmin || !["admin", "recepcion"].includes(sesionAdmin.rol)) window.location.href = "login.html";

const esAdministrador = sesionAdmin?.rol === "admin";
const mensajeAdmin = document.querySelector("#mensajeAdmin");
const modalProducto = new bootstrap.Modal(document.querySelector("#modalProducto"));
let codigoEditando = null;

document.querySelector("#saludoAdmin").textContent = `${sesionAdmin.nombre} · ${sesionAdmin.rol}`;
document.querySelector("#btnCerrarSesion").addEventListener("click", cerrarSesion);

if (!esAdministrador) {
    document.querySelectorAll(".solo-admin").forEach(elemento => elemento.classList.add("d-none"));
    document.querySelector("#panelProductos").classList.remove("show", "active");
    document.querySelector("#panelCitas").classList.add("show", "active");
    document.querySelector("#tabCitas").classList.add("active");
}

function actualizarIndicadores() {
    const productos = VeterinariaStorage.obtenerProductos();
    const usuarios = VeterinariaStorage.obtenerUsuarios();
    const citas = VeterinariaStorage.obtenerCitas();
    document.querySelector("#totalProductos").textContent = productos.length;
    document.querySelector("#totalStock").textContent = productos.reduce((suma, producto) => suma + Number(producto.stock), 0);
    document.querySelector("#totalUsuarios").textContent = usuarios.length;
    document.querySelector("#totalPendientes").textContent = citas.filter(cita => cita.estado === "Pendiente").length;
}

function renderProductosAdmin() {
    const tabla = document.querySelector("#tablaProductos");
    const productos = VeterinariaStorage.obtenerProductos();
    tabla.innerHTML = productos.map(producto => { const estado = VeterinariaUtils.estadoStock(producto); return `<tr><td><strong>${producto.codigo}</strong></td><td>${VeterinariaUtils.escaparHTML(producto.nombre)}</td><td>${VeterinariaUtils.escaparHTML(producto.categoria)}</td><td>${VeterinariaUtils.formatearPrecio(producto.precio)}</td><td>${producto.stock}</td><td><span class="badge-status ${estado.clase}">${estado.texto}</span></td><td><div class="d-flex gap-2"><button class="btn btn-sm btn-warning btn-editar" data-codigo="${producto.codigo}">Editar</button><button class="btn btn-sm btn-danger btn-eliminar" data-codigo="${producto.codigo}">Eliminar</button></div></td></tr>`; }).join("");
}

function renderUsuarios() {
    const usuarios = VeterinariaStorage.obtenerUsuarios();
    document.querySelector("#tablaUsuarios").innerHTML = usuarios.map(usuario => `<tr><td>${VeterinariaUtils.escaparHTML(`${usuario.nombre} ${usuario.apellidos}`)}</td><td>${VeterinariaUtils.escaparHTML(usuario.email)}</td><td><select class="form-select form-select-sm cambiar-rol" data-id="${usuario.id}" ${usuario.id === sesionAdmin.id ? "disabled" : ""}><option value="cliente" ${usuario.rol === "cliente" ? "selected" : ""}>Cliente</option><option value="recepcion" ${usuario.rol === "recepcion" ? "selected" : ""}>Recepción</option><option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>Administrador</option></select></td><td><span class="badge ${usuario.activo ? "text-bg-success" : "text-bg-secondary"}">${usuario.activo ? "Activo" : "Inactivo"}</span></td><td><button class="btn btn-sm btn-outline-secondary btn-estado" data-id="${usuario.id}" ${usuario.id === sesionAdmin.id ? "disabled" : ""}>${usuario.activo ? "Desactivar" : "Activar"}</button></td></tr>`).join("");
}

function renderCitasAdmin() {
    const citas = VeterinariaStorage.obtenerCitas();
    const tabla = document.querySelector("#tablaCitas");
    if (!citas.length) { tabla.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-4">No hay solicitudes registradas.</td></tr>'; return; }
    tabla.innerHTML = citas.map(cita => { const servicio = VeterinariaDatos.servicios.find(item => item.codigo === cita.servicio); return `<tr><td>${VeterinariaUtils.escaparHTML(cita.usuarioNombre)}</td><td>${VeterinariaUtils.escaparHTML(cita.mascota)}</td><td>${VeterinariaUtils.escaparHTML(servicio?.nombre || cita.servicio)}</td><td>${cita.fecha}<br><small>${cita.hora}</small></td><td>${cita.estado}</td><td><select class="form-select form-select-sm cambiar-cita" data-id="${cita.id}"><option ${cita.estado === "Pendiente" ? "selected" : ""}>Pendiente</option><option ${cita.estado === "Confirmada" ? "selected" : ""}>Confirmada</option><option ${cita.estado === "Reagendada" ? "selected" : ""}>Reagendada</option><option ${cita.estado === "Cancelada" ? "selected" : ""}>Cancelada</option></select></td></tr>`; }).join("");
}

function limpiarProducto() {
    codigoEditando = null;
    document.querySelector("#formProducto").reset();
    document.querySelector("#codigoProducto").disabled = false;
    document.querySelector("#formProducto").querySelectorAll(".is-invalid, .is-valid").forEach(campo => campo.classList.remove("is-invalid", "is-valid"));
}

function abrirProducto(codigo = null) {
    limpiarProducto();
    codigoEditando = codigo;
    document.querySelector("#tituloModalProducto").textContent = codigo ? "Editar producto" : "Nuevo producto";
    if (codigo) {
        const producto = VeterinariaStorage.obtenerProductoPorCodigo(codigo);
        document.querySelector("#codigoProducto").value = producto.codigo;
        document.querySelector("#codigoProducto").disabled = true;
        document.querySelector("#nombreProducto").value = producto.nombre;
        document.querySelector("#categoriaAdmin").value = producto.categoria;
        document.querySelector("#activoProducto").value = producto.principioActivo;
        document.querySelector("#presentacionProducto").value = producto.presentacion;
        document.querySelector("#especieProducto").value = producto.especie;
        document.querySelector("#precioProducto").value = producto.precio;
        document.querySelector("#stockProducto").value = producto.stock;
        document.querySelector("#criticoProducto").value = producto.stockCritico;
    }
    modalProducto.show();
}

document.querySelector("#btnNuevoProducto").addEventListener("click", () => abrirProducto());
document.querySelector("#tablaProductos").addEventListener("click", event => {
    const boton = event.target.closest("button");
    if (!boton) return;
    const codigo = boton.dataset.codigo;
    if (boton.classList.contains("btn-editar")) abrirProducto(codigo);
    if (boton.classList.contains("btn-eliminar")) {
        const producto = VeterinariaStorage.obtenerProductoPorCodigo(codigo);
        if (!confirm(`¿Eliminar ${producto.nombre}?`)) return;
        VeterinariaStorage.guardarProductos(VeterinariaStorage.obtenerProductos().filter(item => item.codigo !== codigo));
        VeterinariaStorage.guardarCarrito(VeterinariaStorage.obtenerCarrito().filter(item => item.codigo !== codigo));
        VeterinariaUtils.mostrarMensaje(mensajeAdmin, "Producto eliminado correctamente.", "info");
        renderTodo();
    }
});

document.querySelector("#formProducto").addEventListener("submit", event => {
    event.preventDefault();
    const codigo = document.querySelector("#codigoProducto").value.trim().toUpperCase();
    const nombre = document.querySelector("#nombreProducto").value.trim();
    const categoria = document.querySelector("#categoriaAdmin").value.trim();
    const principioActivo = document.querySelector("#activoProducto").value.trim();
    const presentacion = document.querySelector("#presentacionProducto").value.trim();
    const especie = document.querySelector("#especieProducto").value;
    const precio = Number(document.querySelector("#precioProducto").value);
    const stock = Number(document.querySelector("#stockProducto").value);
    const stockCritico = Number(document.querySelector("#criticoProducto").value);
    const productos = VeterinariaStorage.obtenerProductos();
    const codigoInvalido = codigo.length < 3 || (!codigoEditando && productos.some(producto => producto.codigo === codigo));
    document.querySelector("#codigoProducto").classList.toggle("is-invalid", codigoInvalido);
    document.querySelector("#nombreProducto").classList.toggle("is-invalid", !nombre || nombre.length > 100);
    if (codigoInvalido || !nombre || !categoria || !principioActivo || !presentacion || precio < 0 || !Number.isFinite(precio) || stock < 0 || !Number.isInteger(stock) || stockCritico < 0 || !Number.isInteger(stockCritico)) return VeterinariaUtils.mostrarMensaje(mensajeAdmin, "Revisa los campos del producto.", "danger");
    const datos = { codigo, nombre, categoria, principioActivo, presentacion, especie, precio, stock, stockCritico };
    if (codigoEditando) {
        const indice = productos.findIndex(producto => producto.codigo === codigoEditando);
        productos[indice] = { ...productos[indice], ...datos, codigo: codigoEditando };
    } else productos.push(datos);
    VeterinariaStorage.guardarProductos(productos);
    modalProducto.hide();
    VeterinariaUtils.mostrarMensaje(mensajeAdmin, codigoEditando ? "Producto actualizado correctamente." : "Producto creado correctamente.");
    limpiarProducto();
    renderTodo();
});

document.querySelector("#tablaUsuarios").addEventListener("change", event => {
    if (!event.target.classList.contains("cambiar-rol")) return;
    const usuarios = VeterinariaStorage.obtenerUsuarios();
    const usuario = usuarios.find(item => item.id === Number(event.target.dataset.id));
    usuario.rol = event.target.value;
    VeterinariaStorage.guardarUsuarios(usuarios);
    renderTodo();
});

document.querySelector("#tablaUsuarios").addEventListener("click", event => {
    const boton = event.target.closest(".btn-estado");
    if (!boton) return;
    const usuarios = VeterinariaStorage.obtenerUsuarios();
    const usuario = usuarios.find(item => item.id === Number(boton.dataset.id));
    usuario.activo = !usuario.activo;
    VeterinariaStorage.guardarUsuarios(usuarios);
    renderTodo();
});

document.querySelector("#tablaCitas").addEventListener("change", event => {
    if (!event.target.classList.contains("cambiar-cita")) return;
    const citas = VeterinariaStorage.obtenerCitas();
    const cita = citas.find(item => item.id === Number(event.target.dataset.id));
    cita.estado = event.target.value;
    VeterinariaStorage.guardarCitas(citas);
    renderTodo();
});

function renderTodo() {
    actualizarIndicadores();
    renderProductosAdmin();
    renderUsuarios();
    renderCitasAdmin();
    actualizarContadorCarrito();
}

renderTodo();
