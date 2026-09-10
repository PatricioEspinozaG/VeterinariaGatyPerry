const contenedorServicios = document.querySelector("#serviciosDestacados");

if (contenedorServicios) {
    VeterinariaDatos.servicios.slice(0, 3).forEach(servicio => {
        contenedorServicios.innerHTML += `
            <div class="col-md-4">
                <article class="card-soft">
                    <div class="service-visual"><img class="service-image" src="${VeterinariaUtils.imagenServicio(servicio.categoria)}" alt="${VeterinariaUtils.escaparHTML(`Servicio de ${servicio.categoria}`)}" loading="lazy"></div>
                    <h3 class="mt-3">${VeterinariaUtils.escaparHTML(servicio.nombre)}</h3>
                    <p class="text-secondary mb-2">${VeterinariaUtils.escaparHTML(servicio.especie)} · ${servicio.duracion}</p>
                    <span class="service-price">${VeterinariaUtils.formatearPrecio(servicio.precio)}</span>
                </article>
            </div>`;
    });
}
