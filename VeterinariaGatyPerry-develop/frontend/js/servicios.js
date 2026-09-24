const listaServicios = document.querySelector("#listaServicios");
const buscarServicio = document.querySelector("#buscarServicio");
const categoriaServicio = document.querySelector("#categoriaServicio");
const cantidadServicios = document.querySelector("#cantidadServicios");

function cargarCategoriasServicios() {
    const categorias = [...new Set(VeterinariaDatos.servicios.map(servicio => servicio.categoria))].sort();
    categoriaServicio.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(categoria => categoriaServicio.innerHTML += `<option value="${VeterinariaUtils.escaparHTML(categoria)}">${VeterinariaUtils.escaparHTML(categoria)}</option>`);
}

function renderServicios() {
    const texto = VeterinariaUtils.normalizarTexto(buscarServicio.value);
    const categoria = categoriaServicio.value;
    const filtrados = VeterinariaDatos.servicios.filter(servicio => {
        const coincideTexto = VeterinariaUtils.normalizarTexto(`${servicio.nombre} ${servicio.codigo} ${servicio.especie}`).includes(texto);
        return coincideTexto && (!categoria || servicio.categoria === categoria);
    });

    listaServicios.innerHTML = "";
    cantidadServicios.textContent = `${filtrados.length} servicio${filtrados.length === 1 ? "" : "s"}`;
    filtrados.forEach(servicio => {
        listaServicios.innerHTML += `<div class="col-md-6 col-xl-4"><article class="card-soft d-flex flex-column">
            <div class="service-visual"><img class="service-image" src="${VeterinariaUtils.imagenServicio(servicio.categoria)}" alt="${VeterinariaUtils.escaparHTML(`Servicio de ${servicio.categoria}`)}" loading="lazy"></div>
            <span class="badge text-bg-light align-self-start mt-3">${VeterinariaUtils.escaparHTML(servicio.categoria)}</span>
            <h2 class="h5 mt-3">${VeterinariaUtils.escaparHTML(servicio.nombre)}</h2>
            <p class="text-secondary mb-1">${VeterinariaUtils.escaparHTML(servicio.especie)} · ${servicio.duracion}</p>
            ${servicio.observacion ? `<p class="small text-secondary">${VeterinariaUtils.escaparHTML(servicio.observacion)}</p>` : ""}
            <div class="mt-auto d-flex justify-content-between align-items-center pt-3"><span class="service-price">${VeterinariaUtils.formatearPrecio(servicio.precio)}</span><a class="btn btn-sm btn-outline-primary" href="citas.html?servicio=${encodeURIComponent(servicio.codigo)}">Solicitar hora</a></div>
        </article></div>`;
    });
}

if (listaServicios) {
    cargarCategoriasServicios();
    [buscarServicio, categoriaServicio].forEach(control => { control.addEventListener("input", renderServicios); control.addEventListener("change", renderServicios); });
    renderServicios();
}
