const sesionAdmin = VeterinariaStorage.obtenerSesion();
if (!sesionAdmin || !["admin", "recepcion"].includes(sesionAdmin.rol)) window.location.href = "login.html";

const esAdministrador = sesionAdmin?.rol === "admin";
const mensajeAdmin = document.querySelector("#mensajeAdmin");
const modalProducto = new bootstrap.Modal(document.querySelector("#modalProducto"));
const modalUsuario = new bootstrap.Modal(document.querySelector("#modalUsuario"));
let codigoEditando = null;
let usuarioEditando = null;

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
    if (!citas.length) { tabla.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-4">No hay solicitudes registradas.</td></tr>'; return; }
    tabla.innerHTML = citas.map(cita => { const servicio = VeterinariaDatos.servicios.find(item => item.codigo === cita.servicio); return `<tr><td>${VeterinariaUtils.escaparHTML(cita.usuarioNombre)}</td><td>${VeterinariaUtils.escaparHTML(cita.mascota)}</td><td>${VeterinariaUtils.escaparHTML(servicio?.nombre || cita.servicio)}</td><td><input class="form-control form-control-sm fecha-cita" data-id="${cita.id}" type="date" value="${cita.fecha}" min="${new Date().toISOString().split("T")[0]}"><select class="form-select form-select-sm mt-1 hora-cita" data-id="${cita.id}">${["09:00", "10:30", "12:00", "15:00", "16:30", "18:00"].map(hora => `<option ${cita.hora === hora ? "selected" : ""}>${hora}</option>`).join("")}</select></td><td>${cita.estado}</td><td><select class="form-select form-select-sm cambiar-cita" data-id="${cita.id}"><option ${cita.estado === "Pendiente" ? "selected" : ""}>Pendiente</option><option ${cita.estado === "Confirmada" ? "selected" : ""}>Confirmada</option><option ${cita.estado === "Reagendada" ? "selected" : ""}>Reagendada</option><option ${cita.estado === "Cancelada" ? "selected" : ""}>Cancelada</option></select><button class="btn btn-sm btn-outline-primary mt-2 guardar-cita" data-id="${cita.id}">Guardar</button></td></tr>`; }).join("");
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

document.querySelector("#tablaCitas").addEventListener("click", event => {
    const boton = event.target.closest(".guardar-cita");
    if (!boton) return;
    const citas = VeterinariaStorage.obtenerCitas();
    const cita = citas.find(item => item.id === Number(boton.dataset.id));
    const fila = boton.closest("tr");
    const estado = fila.querySelector(".cambiar-cita").value;
    const fecha = fila.querySelector(".fecha-cita").value;
    const hora = fila.querySelector(".hora-cita").value;
    if (!VeterinariaUtils.fechaNoAnterior(fecha)) return VeterinariaUtils.mostrarMensaje(mensajeAdmin, "La cita debe tener una fecha igual o posterior a hoy.", "danger");
    cita.estado = estado;
    cita.fecha = fecha;
    cita.hora = hora;
    VeterinariaStorage.guardarCitas(citas);
    VeterinariaUtils.mostrarMensaje(mensajeAdmin, "Cita actualizada correctamente.");
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
