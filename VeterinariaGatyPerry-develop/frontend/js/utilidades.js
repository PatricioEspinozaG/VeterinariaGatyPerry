const VeterinariaUtils = (() => {
    function formatearPrecio(valor) {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(valor));
    }

    function normalizarTexto(texto) {
        return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    }

    function escaparHTML(texto) {
        const div = document.createElement("div");
        div.textContent = String(texto ?? "");
        return div.innerHTML;
    }

    function mostrarMensaje(contenedor, texto, tipo = "success") {
        if (!contenedor) return;
        contenedor.innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${escaparHTML(texto)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>`;
    }

    function estadoStock(producto) {
        const stock = Number(producto.stock);
        if (stock <= 0) return { texto: "Sin stock", clase: "stock-out" };
        if (stock <= Number(producto.stockCritico || 5)) return { texto: "Stock crítico", clase: "stock-low" };
        return { texto: "Disponible", clase: "stock-ok" };
    }

    function parametro(nombre) {
        return new URLSearchParams(window.location.search).get(nombre);
    }

    function correoPermitido(email) {
        return /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(String(email).trim());
    }

    function fechaNoAnterior(fecha) {
        if (!fecha) return false;
        const hoy = new Date();
        const fechaLocal = new Date(`${fecha}T00:00:00`);
        const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        return fechaLocal >= hoyLocal;
    }

    function imagenProducto(codigo, categoria) {
        const fotos = {
            ME001: "img/productos/ME001.jpg",
            ME002: "img/productos/ME002.jpg",
            ME003: "img/productos/ME003.jpg",
            ME004: "img/productos/ME004.jpg",
            ME005: "img/productos/ME005.jpg",
            ME006: "img/productos/ME006.jpg",
            ME007: "img/productos/ME007.jpg",
            ME008: "img/productos/ME008.jpg",
            ME009: "img/productos/ME009.jpg",
            ME010: "img/productos/ME010.jpg",
            ME011: "img/productos/ME011.jpg",
            ME012: "img/productos/ME012.jpg",
            ME013: "img/productos/ME013.jpg",
            ME014: "img/productos/ME014.jpg",
            ME015: "img/productos/ME015.jpg",
            ME016: "img/productos/ME016.jpg",
            ME017: "img/productos/ME017.jpg",
            ME018: "img/productos/ME018.jpg",
            ME019: "img/productos/ME019.jpg",
            ME020: "img/productos/ME020.jpg",
            ME021: "img/productos/ME021.jpg",
            ME022: "img/productos/ME022.jpg"
        };
        const rutas = {
            antibioticos: "img/productos/antibioticos.svg",
            antiparasitarios: "img/productos/antiparasitarios.svg",
            antiinflamatorios: "img/productos/antiinflamatorios.svg",
            dermatologia: "img/productos/dermatologia.svg",
            digestivo: "img/productos/digestivo.svg",
            cardiaco: "img/productos/cardiaco.svg",
            analgesicos: "img/productos/analgesicos.svg",
            vacunas: "img/productos/vacunas.svg",
            suplementos: "img/productos/suplementos.svg"
        };
        if (Object.hasOwn(fotos, codigo)) return fotos[codigo];
        return rutas[normalizarTexto(categoria)] || "img/productos/antibioticos.svg";
    }

    function imagenServicio(categoria) {
        const fotos = {
            consultas: "img/servicios/consultas.jpg",
            vacunacion: "img/servicios/vacunacion.jpg",
            cirugia: "img/servicios/cirugia.jpg",
            desparasitacion: "img/servicios/desparasitacion.jpg",
            examenes: "img/servicios/examenes.jpg",
            otros: "img/servicios/otros.jpg"
        };
        const rutas = {
            consultas: "img/servicios/consultas.svg",
            vacunacion: "img/servicios/vacunacion.svg",
            cirugia: "img/servicios/cirugia.svg",
            desparasitacion: "img/servicios/desparasitacion.svg",
            examenes: "img/servicios/examenes.svg",
            otros: "img/servicios/otros.svg"
        };
        const categoriaNormalizada = normalizarTexto(categoria);
        return fotos[categoriaNormalizada] || rutas[categoriaNormalizada] || "img/servicios/otros.svg";
    }

    return { formatearPrecio, normalizarTexto, escaparHTML, mostrarMensaje, estadoStock, parametro, correoPermitido, fechaNoAnterior, imagenProducto, imagenServicio };
})();
