const formCita = document.querySelector("#formCita");
const listaCitas = document.querySelector("#listaCitas");
const sesionCitas = VeterinariaStorage.obtenerSesion();
const servicioCita = document.querySelector("#servicioCita");

servicioCita.innerHTML = '<option value="">Selecciona un servicio</option>' + VeterinariaDatos.servicios.map(servicio => `<option value="${servicio.codigo}">${servicio.nombre} - ${VeterinariaUtils.formatearPrecio(servicio.precio)}</option>`).join("");
const servicioPreseleccionado = VeterinariaUtils.parametro("servicio");
if (servicioPreseleccionado) servicioCita.value = servicioPreseleccionado;
document.querySelector("#fechaCita").min = new Date().toISOString().split("T")[0];

if (!sesionCitas || sesionCitas.rol !== "cliente") {
    formCita.querySelectorAll("input, select, textarea, button").forEach(control => control.disabled = true);
    document.querySelector("#avisoSesion").innerHTML = '<div class="alert alert-warning">Debes <a href="login.html">iniciar sesión como cliente</a> para solicitar una hora.</div>';
}

function renderCitas() {
    const citas = sesionCitas ? VeterinariaStorage.obtenerCitas().filter(cita => cita.usuarioEmail === sesionCitas.email) : [];
    document.querySelector("#cantidadCitas").textContent = `${citas.length} registrada${citas.length === 1 ? "" : "s"}`;
    if (!citas.length) {
        listaCitas.innerHTML = '<div class="card-soft text-center"><h3 class="h5">Aún no tienes solicitudes</h3><p class="text-secondary mb-0">Completa el formulario para crear la primera.</p></div>';
        return;
    }
    listaCitas.innerHTML = citas.map(cita => { const servicio = VeterinariaDatos.servicios.find(item => item.codigo === cita.servicio); return `<article class="card-soft mb-3"><div class="d-flex justify-content-between gap-3"><div><span class="product-code">${cita.fecha} · ${cita.hora}</span><h3 class="h5 mt-1 mb-1">${VeterinariaUtils.escaparHTML(cita.mascota)}</h3><p class="text-secondary mb-0">${VeterinariaUtils.escaparHTML(servicio?.nombre || cita.servicio)}</p></div><span class="badge-status ${cita.estado === "Confirmada" ? "stock-ok" : cita.estado === "Cancelada" ? "stock-out" : "stock-low"}">${cita.estado}</span></div></article>`; }).join("");
}

formCita.addEventListener("submit", event => {
    event.preventDefault();
    if (!sesionCitas || sesionCitas.rol !== "cliente") return;
    const mascota = document.querySelector("#mascota").value.trim();
    const especie = document.querySelector("#especie").value;
    const servicio = servicioCita.value;
    const fecha = document.querySelector("#fechaCita").value;
    const hora = document.querySelector("#horaCita").value;
    if (!mascota || !especie || !servicio || !fecha || !hora) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeCitas"), "Completa mascota, especie, servicio, fecha y hora.", "danger");
    const citas = VeterinariaStorage.obtenerCitas();
    citas.push({ id: Date.now(), usuarioEmail: sesionCitas.email, usuarioNombre: sesionCitas.nombre, mascota, especie, servicio, fecha, hora, motivo: document.querySelector("#motivoCita").value.trim(), estado: "Pendiente" });
    VeterinariaStorage.guardarCitas(citas);
    formCita.reset();
    servicioCita.value = "";
    VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeCitas"), "Solicitud creada. Recepción debe confirmarla.");
    renderCitas();
});

renderCitas();
