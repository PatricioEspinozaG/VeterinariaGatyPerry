const contenedorCarrito = document.querySelector("#productosCarrito");
const carritoVacio = document.querySelector("#carritoVacio");
const mensajeCarrito = document.querySelector("#mensajeCarrito");
const btnComprar = document.querySelector("#btnComprar");
const btnVaciar = document.querySelector("#btnVaciar");
const COSTO_ENVIO = 3990;

function detalleCarrito() {
    const productos = VeterinariaStorage.obtenerProductos();
    const carrito = VeterinariaStorage.obtenerCarrito();
    const validos = carrito.filter(item => productos.some(producto => producto.codigo === item.codigo));
    if (validos.length !== carrito.length) VeterinariaStorage.guardarCarrito(validos);
    return validos.map(item => ({ ...productos.find(producto => producto.codigo === item.codigo), cantidad: item.cantidad }));
}

function renderCarrito() {
    const detalle = detalleCarrito();
    contenedorCarrito.innerHTML = "";
    const vacio = detalle.length === 0;
    carritoVacio.classList.toggle("d-none", !vacio);
    btnComprar.disabled = vacio;
    btnVaciar.disabled = vacio;

    detalle.forEach(producto => {
        contenedorCarrito.innerHTML += `<div class="border-bottom py-3"><div class="row align-items-center g-3"><div class="col-3 col-md-2"><div class="cart-image"><img src="${VeterinariaUtils.imagenProducto(producto.categoria)}" alt="${VeterinariaUtils.escaparHTML(`Imagen de ${producto.nombre}`)}" loading="lazy"></div></div><div class="col-9 col-md-4"><h2 class="h6 mb-1">${VeterinariaUtils.escaparHTML(producto.nombre)}</h2><span class="text-secondary small">${producto.codigo} · Stock ${producto.stock}</span><div class="fw-bold mt-1">${VeterinariaUtils.formatearPrecio(producto.precio)}</div></div><div class="col-7 col-md-3"><div class="input-group"><button class="btn btn-outline-secondary btn-disminuir" data-codigo="${producto.codigo}">-</button><span class="form-control text-center">${producto.cantidad}</span><button class="btn btn-outline-secondary btn-aumentar" data-codigo="${producto.codigo}" ${producto.cantidad >= producto.stock ? "disabled" : ""}>+</button></div></div><div class="col-3 col-md-2 text-end fw-bold">${VeterinariaUtils.formatearPrecio(producto.precio * producto.cantidad)}</div><div class="col-2 col-md-1 text-end"><button class="btn btn-outline-danger btn-sm btn-eliminar" data-codigo="${producto.codigo}" aria-label="Eliminar ${VeterinariaUtils.escaparHTML(producto.nombre)}">X</button></div></div></div>`;
    });
    actualizarResumen(detalle);
    actualizarContadorCarrito();
}

function actualizarResumen(detalle) {
    const unidades = detalle.reduce((suma, producto) => suma + producto.cantidad, 0);
    const subtotal = detalle.reduce((suma, producto) => suma + producto.precio * producto.cantidad, 0);
    const envio = subtotal ? COSTO_ENVIO : 0;
    document.querySelector("#totalUnidades").textContent = unidades;
    document.querySelector("#subtotal").textContent = VeterinariaUtils.formatearPrecio(subtotal);
    document.querySelector("#envio").textContent = VeterinariaUtils.formatearPrecio(envio);
    document.querySelector("#total").textContent = VeterinariaUtils.formatearPrecio(subtotal + envio);
}

contenedorCarrito.addEventListener("click", event => {
    const boton = event.target.closest("button");
    if (!boton) return;
    const codigo = boton.dataset.codigo;
    let carrito = VeterinariaStorage.obtenerCarrito();
    const item = carrito.find(elemento => elemento.codigo === codigo);
    const producto = VeterinariaStorage.obtenerProductoPorCodigo(codigo);
    if (!item || !producto) return;
    if (boton.classList.contains("btn-aumentar") && item.cantidad < producto.stock) item.cantidad += 1;
    if (boton.classList.contains("btn-disminuir")) item.cantidad -= 1;
    if (boton.classList.contains("btn-eliminar") || item.cantidad <= 0) carrito = carrito.filter(elemento => elemento.codigo !== codigo);
    VeterinariaStorage.guardarCarrito(carrito);
    renderCarrito();
});

btnVaciar.addEventListener("click", () => {
    if (!confirm("¿Deseas vaciar el carrito?")) return;
    VeterinariaStorage.vaciarCarrito();
    renderCarrito();
    VeterinariaUtils.mostrarMensaje(mensajeCarrito, "El carrito quedó vacío.", "info");
});

btnComprar.addEventListener("click", () => {
    const carrito = VeterinariaStorage.obtenerCarrito();
    const productos = VeterinariaStorage.obtenerProductos();
    const invalido = carrito.some(item => { const producto = productos.find(p => p.codigo === item.codigo); return !producto || item.cantidad > producto.stock; });
    if (invalido) return VeterinariaUtils.mostrarMensaje(mensajeCarrito, "El stock cambió. Revisa las cantidades.", "danger");
    if (!confirm("¿Finalizar la compra simulada y descontar el stock?")) return;
    carrito.forEach(item => { const producto = productos.find(p => p.codigo === item.codigo); producto.stock -= item.cantidad; });
    VeterinariaStorage.guardarProductos(productos);
    VeterinariaStorage.vaciarCarrito();
    renderCarrito();
    VeterinariaUtils.mostrarMensaje(mensajeCarrito, "Compra simulada realizada. El stock fue actualizado.");
});

renderCarrito();
