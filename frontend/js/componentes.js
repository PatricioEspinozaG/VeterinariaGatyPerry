function actualizarContadorCarrito() {
    const contador = document.querySelector("#contadorCarrito");
    if (!contador) return;
    const total = VeterinariaStorage.obtenerCarrito().reduce((suma, item) => suma + Number(item.cantidad), 0);
    contador.textContent = total;
}

function cerrarSesion() {
    VeterinariaStorage.cerrarSesion();
    window.location.href = "index.html";
}

function cargarNavbar() {
    const destino = document.querySelector("#navbar");
    if (!destino) return;
    const sesion = VeterinariaStorage.obtenerSesion();
    const pagina = window.location.pathname.split("/").pop() || "index.html";

    destino.innerHTML = `
        <div class="topbar"><div class="container"><span>Rancagua · +56 72 221 3456</span><span>Lunes a sábado · 09:00 a 19:00</span></div></div>
        <nav class="navbar navbar-expand-lg site-navbar sticky-top" aria-label="Navegación principal">
            <div class="container py-2">
                <div class="navbar-brand-center">
                    <a class="navbar-brand navbar-brand-logo" href="index.html" aria-label="Ir al inicio">
                        <img src="img/logo-nav.gif" alt="Logo de Gaty Perry">
                        <span class="brand-copy"><span class="eyebrow brand-eyebrow">Rancagua · desde 2009</span></span>
                    </a>
                </div>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Abrir menú">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="menuPrincipal">
                    <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
                        ${enlace("index.html", "Inicio", pagina)}
                        ${enlace("servicios.html", "Servicios", pagina)}
                        ${enlace("productos.html", "Productos", pagina)}
                        ${enlace("blog.html", "Consejos", pagina)}
                        ${enlace("nosotros.html", "Nosotros", pagina)}
                        ${enlace("contacto.html", "Contacto", pagina)}
                        <li class="nav-item">
                            <a class="nav-link cart-link" href="carrito.html" aria-label="Carrito">
                                <svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.76L18.7 7H6.2" />
                                    <circle cx="10" cy="17.5" r="1.2" />
                                    <circle cx="16.7" cy="17.5" r="1.2" />
                                </svg>
                                <span id="contadorCarrito" class="cart-badge">0</span>
                            </a>
                        </li>
                        ${sesion ? menuSesion(sesion) : `<li class="nav-item"><a class="btn btn-outline-primary btn-sm ms-lg-2" href="login.html">Ingresar</a></li>`}
                    </ul>
                </div>
            </div>
        </nav>`;

    document.querySelector("#btnCerrarSesionNavbar")?.addEventListener("click", cerrarSesion);
    actualizarContadorCarrito();
}

function enlace(href, texto, pagina) {
    return `<li class="nav-item"><a class="nav-link ${pagina === href ? "active" : ""}" href="${href}" ${pagina === href ? 'aria-current="page"' : ""}>${texto}</a></li>`;
}

function menuSesion(sesion) {
    const acceso = sesion.rol === "admin" || sesion.rol === "recepcion"
        ? `<a class="btn btn-dark btn-sm" href="admin.html">Administración</a>`
        : `<a class="btn btn-outline-primary btn-sm" href="citas.html">Mis citas</a>`;
    return `<li class="nav-item ms-lg-2">${acceso}</li>
        <li class="nav-item"><button id="btnCerrarSesionNavbar" class="btn btn-link nav-link">Salir</button></li>`;
}

function cargarFooter() {
    const destino = document.querySelector("#footer");
    if (!destino) return;
    destino.innerHTML = `
        <footer class="site-footer">
            <div class="container">
                <div class="row g-4">
                    <div class="col-lg-5"><div class="footer-brand"><img src="img/logo-footer.gif" alt="Logo de la clínica veterinaria"><div><strong>Gaty Perry</strong><div>Atención cercana para tu mascota.</div></div></div></div>
                    <div class="col-6 col-lg-3"><strong>Navegación</strong><div class="d-flex flex-column gap-2 mt-2"><a href="servicios.html">Servicios</a><a href="productos.html">Productos</a><a href="citas.html">Agendar hora</a></div></div>
                    <div class="col-6 col-lg-4"><strong>Contacto</strong><div class="d-flex flex-column gap-2 mt-2"><span>Av. República 1240, Rancagua</span><a href="contacto.html">Enviar mensaje</a></div></div>
                </div>
                <div class="footer-bottom">Proyecto académico Frontend · HTML, Bootstrap, JavaScript y localStorage</div>
            </div>
        </footer>`;
}

cargarNavbar();
cargarFooter();
