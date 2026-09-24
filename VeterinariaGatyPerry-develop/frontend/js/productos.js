const listaProductos = document.querySelector("#listaProductos");
const buscarProducto = document.querySelector("#buscarProducto");
const categoriaProducto = document.querySelector("#categoriaProducto");
const disponibilidadProducto = document.querySelector("#disponibilidadProducto");
const cantidadProductos = document.querySelector("#cantidadProductos");
const mensajeProductos = document.querySelector("#mensajeProductos");

function cargarCategoriasProductos() {
    const categorias = [...new Set(VeterinariaStorage.obtenerProductos().map(producto => producto.categoria))].sort();
    categoriaProducto.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(categoria => categoriaProducto.innerHTML += `<option value="${VeterinariaUtils.escaparHTML(categoria)}">${VeterinariaUtils.escaparHTML(categoria)}</option>`);
}

function productosFiltrados() {
    const texto = VeterinariaUtils.normalizarTexto(buscarProducto.value);
    const categoria = categoriaProducto.value;
    const disponibilidad = disponibilidadProducto.value;
    return VeterinariaStorage.obtenerProductos().filter(producto => {
        const coincideTexto = VeterinariaUtils.normalizarTexto(`${producto.nombre} ${producto.codigo} ${producto.principioActivo}`).includes(texto);
        const coincideCategoria = !categoria || producto.categoria === categoria;
        const coincideStock = !disponibilidad || (disponibilidad === "disponible" && producto.stock > 0) || (disponibilidad === "agotado" && producto.stock === 0);
        return coincideTexto && coincideCategoria && coincideStock;
    });
}

function renderProductos() {
    const productos = productosFiltrados();
    listaProductos.innerHTML = "";
    cantidadProductos.textContent = `${productos.length} producto${productos.length === 1 ? "" : "s"}`;
    if (!productos.length) listaProductos.innerHTML = '<div class="col-12"><div class="alert alert-info">No se encontraron productos con esos filtros.</div></div>';

    productos.forEach(producto => {
        const estado = VeterinariaUtils.estadoStock(producto);
        listaProductos.innerHTML += `<div class="col-sm-6 col-xl-4"><article class="card product-card shadow-sm">
            <div class="product-visual"><img src="${VeterinariaUtils.imagenProducto(producto.categoria)}" alt="${VeterinariaUtils.escaparHTML(`Producto de categoría ${producto.categoria}`)}" loading="lazy"></div>
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start gap-2"><span class="product-code">${producto.codigo}</span><span class="badge-status ${estado.clase}">${estado.texto}</span></div>
                <h2 class="h5 mt-3">${VeterinariaUtils.escaparHTML(producto.nombre)}</h2><p class="text-secondary small mb-2">${VeterinariaUtils.escaparHTML(producto.principioActivo)} · ${VeterinariaUtils.escaparHTML(producto.presentacion)}</p>
                <div class="mt-auto"><p class="product-price fs-5 mb-3">${VeterinariaUtils.formatearPrecio(producto.precio)}</p><div class="d-grid gap-2"><button class="btn btn-primary btn-agregar" data-codigo="${producto.codigo}" ${producto.stock <= 0 ? "disabled" : ""}>Agregar al carrito</button><a class="btn btn-outline-secondary" href="detalle-producto.html?codigo=${producto.codigo}">Ver detalle</a></div></div>
            </div>
        </article></div>`;
    });
}

function agregarAlCarrito(codigo, contenedorMensaje = mensajeProductos) {
    const producto = VeterinariaStorage.obtenerProductoPorCodigo(codigo);
    if (!producto || producto.stock <= 0) return VeterinariaUtils.mostrarMensaje(contenedorMensaje, "El producto no tiene stock disponible.", "warning");
    const carrito = VeterinariaStorage.obtenerCarrito();
    const item = carrito.find(elemento => elemento.codigo === codigo);
    if (item && item.cantidad >= producto.stock) return VeterinariaUtils.mostrarMensaje(contenedorMensaje, `No puedes superar el stock de ${producto.nombre}.`, "warning");
    if (item) item.cantidad += 1; else carrito.push({ codigo, cantidad: 1 });
    VeterinariaStorage.guardarCarrito(carrito);
    actualizarContadorCarrito();
    VeterinariaUtils.mostrarMensaje(contenedorMensaje, `${producto.nombre} fue agregado al carrito.`);
}

if (listaProductos) {
    cargarCategoriasProductos();
    listaProductos.addEventListener("click", event => { const boton = event.target.closest(".btn-agregar"); if (boton) agregarAlCarrito(boton.dataset.codigo); });
    [buscarProducto, categoriaProducto, disponibilidadProducto].forEach(control => { control.addEventListener("input", renderProductos); control.addEventListener("change", renderProductos); });
    document.querySelector("#limpiarFiltros").addEventListener("click", () => { buscarProducto.value = ""; categoriaProducto.value = ""; disponibilidadProducto.value = ""; renderProductos(); });
    renderProductos();
}

const detalleProducto = document.querySelector("#detalleProducto");
if (detalleProducto) {
    const codigo = VeterinariaUtils.parametro("codigo");
    const producto = VeterinariaStorage.obtenerProductoPorCodigo(codigo);
    if (!producto) {
        detalleProducto.innerHTML = '<div class="alert alert-warning">Producto no encontrado. <a href="productos.html">Volver al catálogo</a>.</div>';
    } else {
        const estado = VeterinariaUtils.estadoStock(producto);
        detalleProducto.innerHTML = `<div class="row g-5 align-items-center"><div class="col-lg-5"><div class="product-visual product-visual-detail rounded-4"><img src="${VeterinariaUtils.imagenProducto(producto.categoria)}" alt="${VeterinariaUtils.escaparHTML(`Imagen de ${producto.nombre}`)}" loading="lazy"></div></div><div class="col-lg-7"><span class="product-code">${producto.codigo} · ${VeterinariaUtils.escaparHTML(producto.categoria)}</span><h1 class="display-5 fw-bold mt-2">${VeterinariaUtils.escaparHTML(producto.nombre)}</h1><span class="badge-status ${estado.clase}">${estado.texto}</span><dl class="row mt-4"><dt class="col-sm-4">Principio activo</dt><dd class="col-sm-8">${VeterinariaUtils.escaparHTML(producto.principioActivo)}</dd><dt class="col-sm-4">Presentación</dt><dd class="col-sm-8">${VeterinariaUtils.escaparHTML(producto.presentacion)}</dd><dt class="col-sm-4">Especie</dt><dd class="col-sm-8">${VeterinariaUtils.escaparHTML(producto.especie)}</dd><dt class="col-sm-4">Stock</dt><dd class="col-sm-8">${producto.stock} unidades</dd></dl><p class="product-price fs-3">${VeterinariaUtils.formatearPrecio(producto.precio)}</p><div class="alert alert-warning small">Producto de demostración académica. Consulta al médico veterinario antes de administrar medicamentos.</div><button id="agregarDetalle" class="btn btn-primary btn-lg" ${producto.stock <= 0 ? "disabled" : ""}>Agregar al carrito</button> <a href="productos.html" class="btn btn-outline-secondary btn-lg">Volver</a></div></div>`;
        document.querySelector("#agregarDetalle")?.addEventListener("click", () => agregarAlCarrito(codigo, document.querySelector("#mensajeDetalle")));
    }
}
