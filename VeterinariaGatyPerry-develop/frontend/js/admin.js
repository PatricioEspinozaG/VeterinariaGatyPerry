const sesionAdmin = VeterinariaStorage.obtenerSesion();
if (!sesionAdmin || !["admin", "recepcion"].includes(sesionAdmin.rol)) {
    window.location.href = "login.html";
} else {

const esAdministrador = sesionAdmin?.rol === "admin";
const mensajeAdmin = document.querySelector("#mensajeAdmin");
const modalProducto = new bootstrap.Modal(document.querySelector("#modalProducto"));
const modalUsuario = new bootstrap.Modal(document.querySelector("#modalUsuario"));
const modalCita = new bootstrap.Modal(document.querySelector("#modalCita"));
let codigoEditando = null;
let usuarioEditando = null;
let citaEditando = null;

function rutValido(valor) {
    const limpio = valor.replace(/[.\-]/g, "").toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;
    const cuerpo = limpio.slice(0, -1);
    let suma = 0;
    let multiplicador = 2;
    for (let indice = cuerpo.length - 1; indice >= 0; indice--) {
        suma += Number(cuerpo[indice]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resultado = 11 - (suma % 11);
    const esperado = resultado === 11 ? "0" : resultado === 10 ? "K" : String(resultado);
    return limpio.slice(-1) === esperado;
}

document.querySelector("#saludoAdmin").textContent = `${sesionAdmin.nombre} · ${sesionAdmin.rol}`;

const categoriaAdmin = document.querySelector("#categoriaAdmin");
categoriaAdmin.innerHTML = [...new Set(VeterinariaDatos.productos.map(producto => producto.categoria))]
    .sort()
    .map(categoria => `<option value="${VeterinariaUtils.escaparHTML(categoria)}">${VeterinariaUtils.escaparHTML(categoria)}</option>`)
    .join("");

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
    document.querySelector("#tablaUsuarios").innerHTML = usuarios.map(usuario => `<tr><td>${VeterinariaUtils.escaparHTML(`${usuario.nombre} ${usuario.apellidos}`)}</td><td>${VeterinariaUtils.escaparHTML(usuario.email)}</td><td><select class="form-select form-select-sm cambiar-rol" data-id="${usuario.id}" ${usuario.id === sesionAdmin.id ? "disabled" : ""}><option value="cliente" ${usuario.rol === "cliente" ? "selected" : ""}>Cliente</option><option value="recepcion" ${usuario.rol === "recepcion" ? "selected" : ""}>Recepción</option><option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>Administrador</option></select></td><td><span class="badge ${usuario.activo ? "text-bg-success" : "text-bg-secondary"}">${usuario.activo ? "Activo" : "Inactivo"}</span></td><td><div class="d-flex gap-2"><button class="btn btn-sm btn-outline-primary btn-editar-usuario" data-id="${usuario.id}">Editar</button><button class="btn btn-sm btn-outline-secondary btn-estado" data-id="${usuario.id}" ${usuario.id === sesionAdmin.id ? "disabled" : ""}>${usuario.activo ? "Desactivar" : "Activar"}</button></div></td></tr>`).join("");
}

function cargarRegionesUsuario() {
    const region = document.querySelector("#regionUsuario");
    region.innerHTML = Object.keys(VeterinariaDatos.regiones).map(nombre => `<option value="${nombre}">${nombre}</option>`).join("");
    cargarComunasUsuario();
}

function cargarComunasUsuario() {
    const region = document.querySelector("#regionUsuario");
    document.querySelector("#comunaUsuario").innerHTML = VeterinariaDatos.regiones[region.value].map(nombre => `<option value="${nombre}">${nombre}</option>`).join("");
}

function limpiarUsuario() {
    usuarioEditando = null;
    document.querySelector("#formUsuario").reset();
    document.querySelector("#formUsuario").querySelectorAll(".is-invalid, .is-valid").forEach(campo => campo.classList.remove("is-invalid", "is-valid"));
    cargarRegionesUsuario();
}

function abrirUsuario(id = null) {
    limpiarUsuario();
    usuarioEditando = id;
    document.querySelector("#tituloModalUsuario").textContent = id ? "Editar usuario" : "Nuevo usuario";
    if (id) {
        const usuario = VeterinariaStorage.obtenerUsuarios().find(item => item.id === id);
        document.querySelector("#nombreUsuario").value = usuario.nombre;
        document.querySelector("#apellidosUsuario").value = usuario.apellidos;
        document.querySelector("#rutUsuario").value = usuario.rut;
        document.querySelector("#emailUsuario").value = usuario.email;
        document.querySelector("#passwordUsuario").value = usuario.password;
        document.querySelector("#rolUsuario").value = usuario.rol;
        document.querySelector("#regionUsuario").value = usuario.region || Object.keys(VeterinariaDatos.regiones)[0];
        cargarComunasUsuario();
        document.querySelector("#comunaUsuario").value = usuario.comuna || document.querySelector("#comunaUsuario").options[0]?.value;
        document.querySelector("#direccionUsuario").value = usuario.direccion || "";
    }
    modalUsuario.show();
}

function renderCitasAdmin() {
    const citas = VeterinariaStorage.obtenerCitas();
    const tabla = document.querySelector("#tablaCitas");
    const colspan = esAdministrador ? 7 : 6;
    if (!citas.length) {
        tabla.innerHTML = `<tr><td colspan="${colspan}" class="text-center text-secondary py-4">No hay solicitudes registradas.</td></tr>`;
        return;
    }

    tabla.innerHTML = citas.map(cita => {
        const servicio = VeterinariaDatos.servicios.find(item => item.codigo === cita.servicio);
        const acciones = esAdministrador
            ? `<td><div class="d-flex gap-2"><button class="btn btn-sm btn-outline-primary btn-editar-cita" data-id="${cita.id}">Editar</button><button class="btn btn-sm btn-outline-danger btn-eliminar-cita" data-id="${cita.id}">Eliminar</button></div></td>`
            : "";
        return `<tr><td>${VeterinariaUtils.escaparHTML(cita.usuarioNombre || cita.usuarioEmail)}</td><td>${VeterinariaUtils.escaparHTML(cita.mascota)}</td><td>${VeterinariaUtils.escaparHTML(servicio?.nombre || cita.servicio)}</td><td>${VeterinariaUtils.escaparHTML(cita.fecha)} · ${VeterinariaUtils.escaparHTML(cita.hora)}</td><td>${VeterinariaUtils.escaparHTML(cita.estado)}</td><td>${VeterinariaUtils.escaparHTML(cita.motivo || "-")}</td>${acciones}</tr>`;
    }).join("");
}

function cargarOpcionesCita() {
    const clientes = VeterinariaStorage.obtenerUsuarios().filter(usuario => usuario.rol === "cliente" && usuario.activo);
    document.querySelector("#clienteCita").innerHTML = '<option value="">Selecciona un cliente</option>' + clientes.map(usuario => `<option value="${usuario.id}">${VeterinariaUtils.escaparHTML(`${usuario.nombre} ${usuario.apellidos}`)} · ${VeterinariaUtils.escaparHTML(usuario.email)}</option>`).join("");
    document.querySelector("#servicioCitaAdmin").innerHTML = '<option value="">Selecciona un servicio</option>' + VeterinariaDatos.servicios.map(servicio => `<option value="${servicio.codigo}">${VeterinariaUtils.escaparHTML(servicio.nombre)}</option>`).join("");
}

function abrirCita(id = null) {
    if (!esAdministrador) return;
    citaEditando = id;
    document.querySelector("#formCitaAdmin").reset();
    cargarOpcionesCita();
    document.querySelector("#tituloModalCita").textContent = id ? "Editar cita" : "Nueva cita";
    document.querySelector("#fechaCitaAdmin").min = new Date().toISOString().split("T")[0];

    if (id !== null) {
        const cita = VeterinariaStorage.obtenerCitas().find(item => String(item.id) === String(id));
        if (!cita) return;
        const cliente = VeterinariaStorage.obtenerUsuarios().find(usuario => usuario.email === cita.usuarioEmail);
        document.querySelector("#clienteCita").value = cliente?.id || "";
        document.querySelector("#mascotaCita").value = cita.mascota || "";
        document.querySelector("#servicioCitaAdmin").value = cita.servicio || "";
        document.querySelector("#fechaCitaAdmin").value = cita.fecha || "";
        document.querySelector("#horaCitaAdmin").value = cita.hora || "";
        document.querySelector("#estadoCitaAdmin").value = cita.estado || "Pendiente";
        document.querySelector("#motivoCitaAdmin").value = cita.motivo || "";
    }
    modalCita.show();
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

const camposProducto = {
    codigo: document.querySelector("#codigoProducto"),
    nombre: document.querySelector("#nombreProducto"),
    categoria: document.querySelector("#categoriaAdmin"),
    principioActivo: document.querySelector("#activoProducto"),
    presentacion: document.querySelector("#presentacionProducto"),
    especie: document.querySelector("#especieProducto"),
    precio: document.querySelector("#precioProducto"),
    stock: document.querySelector("#stockProducto"),
    stockCritico: document.querySelector("#criticoProducto")
};

function validarProducto(campoActivo = null, validarTodos = false) {
    const productos = VeterinariaStorage.obtenerProductos();
    const codigo = camposProducto.codigo.value.trim().toUpperCase();
    const valido = {
        codigo: codigo.length >= 3 && (codigoEditando || !productos.some(producto => producto.codigo === codigo)),
        nombre: camposProducto.nombre.value.trim().length > 0 && camposProducto.nombre.value.trim().length <= 100,
        categoria: Boolean(camposProducto.categoria.value),
        principioActivo: camposProducto.principioActivo.value.trim().length > 0 && camposProducto.principioActivo.value.trim().length <= 100,
        presentacion: camposProducto.presentacion.value.trim().length > 0 && camposProducto.presentacion.value.trim().length <= 100,
        especie: Boolean(camposProducto.especie.value),
        precio: camposProducto.precio.value !== "" && Number.isFinite(Number(camposProducto.precio.value)) && Number(camposProducto.precio.value) >= 0,
        stock: camposProducto.stock.value !== "" && Number.isInteger(Number(camposProducto.stock.value)) && Number(camposProducto.stock.value) >= 0,
        stockCritico: camposProducto.stockCritico.value !== "" && Number.isInteger(Number(camposProducto.stockCritico.value)) && Number(camposProducto.stockCritico.value) >= 0
    };
    Object.entries(valido).forEach(([clave, resultado]) => {
        const campo = camposProducto[clave];
        if (validarTodos || campo === campoActivo) campo.classList.toggle("is-invalid", !resultado);
    });
    return Object.values(valido).every(Boolean);
}

Object.values(camposProducto).forEach(campo => {
    campo.addEventListener("input", () => validarProducto(campo));
    campo.addEventListener("change", () => validarProducto(campo));
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
    if (!validarProducto(null, true)) return VeterinariaUtils.mostrarMensaje(mensajeAdmin, "Revisa los campos del producto.", "danger");
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
    const botonEditar = event.target.closest(".btn-editar-usuario");
    if (botonEditar) return abrirUsuario(Number(botonEditar.dataset.id));
    const boton = event.target.closest(".btn-estado");
    if (!boton) return;
    const usuarios = VeterinariaStorage.obtenerUsuarios();
    const usuario = usuarios.find(item => item.id === Number(boton.dataset.id));
    usuario.activo = !usuario.activo;
    VeterinariaStorage.guardarUsuarios(usuarios);
    renderTodo();
});

document.querySelector("#btnNuevoUsuario").addEventListener("click", () => abrirUsuario());
document.querySelector("#regionUsuario").addEventListener("change", cargarComunasUsuario);
const camposUsuario = {
    nombre: document.querySelector("#nombreUsuario"),
    apellidos: document.querySelector("#apellidosUsuario"),
    rut: document.querySelector("#rutUsuario"),
    email: document.querySelector("#emailUsuario"),
    password: document.querySelector("#passwordUsuario"),
    direccion: document.querySelector("#direccionUsuario")
};

function validarFormularioUsuario(campoActivo = null, validarTodos = false) {
    const usuarios = VeterinariaStorage.obtenerUsuarios();
    const rutNormalizado = camposUsuario.rut.value.replace(/[.\-]/g, "").toUpperCase();
    const emailNormalizado = camposUsuario.email.value.trim().toLowerCase();
    const valido = [
        camposUsuario.nombre.value.trim().length >= 2 && camposUsuario.nombre.value.trim().length <= 50,
        camposUsuario.apellidos.value.trim().length >= 2 && camposUsuario.apellidos.value.trim().length <= 100,
        rutValido(camposUsuario.rut.value) && !usuarios.some(usuario => usuario.id !== usuarioEditando && usuario.rut.replace(/[.\-]/g, "").toUpperCase() === rutNormalizado),
        VeterinariaUtils.correoPermitido(emailNormalizado) && !usuarios.some(usuario => usuario.id !== usuarioEditando && usuario.email.toLowerCase() === emailNormalizado),
        camposUsuario.password.value.length >= 4 && camposUsuario.password.value.length <= 10,
        camposUsuario.direccion.value.trim().length > 0 && camposUsuario.direccion.value.trim().length <= 300
    ];
    Object.values(camposUsuario).forEach((campo, indice) => {
        const debeValidar = validarTodos || campo === campoActivo;
        campo.classList.remove("is-valid");
        campo.classList.toggle("is-invalid", debeValidar && !valido[indice]);
    });
    return { valido: valido.every(Boolean), emailNormalizado };
}

Object.values(camposUsuario).forEach(campo => {
    campo.addEventListener("input", () => validarFormularioUsuario(campo));
});

document.querySelector("#formUsuario").addEventListener("submit", event => {
    event.preventDefault();
    const usuarios = VeterinariaStorage.obtenerUsuarios();
    const resultado = validarFormularioUsuario(null, true);
    if (!resultado.valido) return VeterinariaUtils.mostrarMensaje(mensajeAdmin, "Revisa los datos del usuario. Hay campos inválidos o duplicados.", "danger");
    const datos = { rut: camposUsuario.rut.value.trim(), nombre: camposUsuario.nombre.value.trim(), apellidos: camposUsuario.apellidos.value.trim(), email: resultado.emailNormalizado, password: camposUsuario.password.value, rol: document.querySelector("#rolUsuario").value, activo: true, region: document.querySelector("#regionUsuario").value, comuna: document.querySelector("#comunaUsuario").value, direccion: camposUsuario.direccion.value.trim() };
    if (usuarioEditando) {
        const usuario = usuarios.find(item => item.id === usuarioEditando);
        Object.assign(usuario, datos, { activo: usuario.activo });
    } else usuarios.push({ id: Date.now(), ...datos });
    VeterinariaStorage.guardarUsuarios(usuarios);
    modalUsuario.hide();
    VeterinariaUtils.mostrarMensaje(mensajeAdmin, usuarioEditando ? "Usuario actualizado correctamente." : "Usuario creado correctamente.");
    renderTodo();
});

document.querySelector("#btnNuevaCita").addEventListener("click", () => abrirCita());
document.querySelector("#tablaCitas").addEventListener("click", event => {
    if (!esAdministrador) return;
    const botonEditar = event.target.closest(".btn-editar-cita");
    if (botonEditar) return abrirCita(botonEditar.dataset.id);

    const botonEliminar = event.target.closest(".btn-eliminar-cita");
    if (!botonEliminar) return;
    const citas = VeterinariaStorage.obtenerCitas();
    const cita = citas.find(item => String(item.id) === String(botonEliminar.dataset.id));
    if (!cita || !confirm(`¿Eliminar la cita de ${cita.mascota}?`)) return;
    VeterinariaStorage.guardarCitas(citas.filter(item => String(item.id) !== String(cita.id)));
    VeterinariaUtils.mostrarMensaje(mensajeAdmin, "Cita eliminada correctamente.", "info");
    renderTodo();
});

document.querySelector("#formCitaAdmin").addEventListener("submit", event => {
    event.preventDefault();
    if (!esAdministrador) return;

    const formulario = document.querySelector("#formCitaAdmin");
    if (!formulario.reportValidity()) return;
    const clienteId = document.querySelector("#clienteCita").value;
    const cliente = VeterinariaStorage.obtenerUsuarios().find(usuario => String(usuario.id) === clienteId);
    const fecha = document.querySelector("#fechaCitaAdmin").value;
    if (!cliente) return VeterinariaUtils.mostrarMensaje(mensajeAdmin, "Selecciona un cliente válido.", "danger");
    if (!VeterinariaUtils.fechaNoAnterior(fecha)) return VeterinariaUtils.mostrarMensaje(mensajeAdmin, "La cita debe tener una fecha igual o posterior a hoy.", "danger");

    const citas = VeterinariaStorage.obtenerCitas();
    const datos = {
        id: citaEditando ?? Date.now(),
        usuarioEmail: cliente.email,
        usuarioNombre: `${cliente.nombre} ${cliente.apellidos}`.trim(),
        mascota: document.querySelector("#mascotaCita").value.trim(),
        servicio: document.querySelector("#servicioCitaAdmin").value,
        fecha,
        hora: document.querySelector("#horaCitaAdmin").value,
        motivo: document.querySelector("#motivoCitaAdmin").value.trim(),
        estado: document.querySelector("#estadoCitaAdmin").value
    };
    if (citaEditando !== null) {
        const indice = citas.findIndex(item => String(item.id) === String(citaEditando));
        if (indice < 0) return;
        citas[indice] = { ...citas[indice], ...datos };
    } else citas.push(datos);

    VeterinariaStorage.guardarCitas(citas);
    modalCita.hide();
    VeterinariaUtils.mostrarMensaje(mensajeAdmin, citaEditando !== null ? "Cita actualizada correctamente." : "Cita creada correctamente.");
    citaEditando = null;
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
}
