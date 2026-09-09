const listaArticulos = document.querySelector("#listaArticulos");
if (listaArticulos) {
    listaArticulos.innerHTML = VeterinariaDatos.articulos.map((articulo, indice) => `<div class="col-md-6 col-xl-4"><article class="card product-card shadow-sm"><div class="product-visual">0${indice + 1}</div><div class="card-body d-flex flex-column"><h2 class="h4">${VeterinariaUtils.escaparHTML(articulo.titulo)}</h2><p class="text-secondary">${VeterinariaUtils.escaparHTML(articulo.resumen)}</p><a class="btn btn-outline-primary mt-auto" href="detalle-blog.html?id=${articulo.id}">Leer artículo</a></div></article></div>`).join("");
}

const detalleArticulo = document.querySelector("#detalleArticulo");
if (detalleArticulo) {
    const id = Number(VeterinariaUtils.parametro("id"));
    const articulo = VeterinariaDatos.articulos.find(item => item.id === id);
    detalleArticulo.innerHTML = articulo ? `<span class="eyebrow">Consejo veterinario</span><h1 class="display-5 fw-bold mt-3">${VeterinariaUtils.escaparHTML(articulo.titulo)}</h1><p class="lead text-secondary">${VeterinariaUtils.escaparHTML(articulo.resumen)}</p><hr class="my-4"><p class="fs-5 lh-lg">${VeterinariaUtils.escaparHTML(articulo.contenido)}</p><div class="alert alert-warning mt-4">Esta información es general y no reemplaza una evaluación veterinaria.</div><a href="blog.html" class="btn btn-outline-primary mt-3">Volver a consejos</a>` : '<div class="alert alert-warning">Artículo no encontrado. <a href="blog.html">Volver</a>.</div>';
}
