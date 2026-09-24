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

    function imagenProducto(categoria) {
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
        return rutas[normalizarTexto(categoria)] || "img/productos/antibioticos.svg";
    }

    function imagenServicio(categoria) {
        const rutas = {
            consultas: "img/servicios/consultas.svg",
            vacunacion: "img/servicios/vacunacion.svg",
            cirugia: "img/servicios/cirugia.svg",
            desparasitacion: "img/servicios/desparasitacion.svg",
            examenes: "img/servicios/examenes.svg",
            otros: "img/servicios/otros.svg"
        };
        return rutas[normalizarTexto(categoria)] || "img/servicios/otros.svg";
    }

    return { formatearPrecio, normalizarTexto, escaparHTML, mostrarMensaje, estadoStock, parametro, correoPermitido, fechaNoAnterior, imagenProducto, imagenServicio };
})();
