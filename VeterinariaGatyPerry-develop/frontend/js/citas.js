const formCita = document.querySelector("#formCita");
const listaCitas = document.querySelector("#listaCitas");
const sesionCitas = VeterinariaStorage.obtenerSesion();
const servicioCita = document.querySelector("#servicioCita");
const mascotaExistente = document.querySelector("#mascotaExistente");
const especieMascota = document.querySelector("#especie");
const edadMascota = document.querySelector("#edadMascota");

edadMascota.addEventListener("input", () => {
    const digitos = edadMascota.value.replace(/\D/g, "").slice(0, 2);
    edadMascota.value = digitos && Number(digitos) <= 40 ? digitos : digitos ? "40" : "";
});

servicioCita.innerHTML = '<option value="">Selecciona un servicio</option>' + VeterinariaDatos.servicios.map(servicio => `<option value="${servicio.codigo}">${servicio.nombre} - ${VeterinariaUtils.formatearPrecio(servicio.precio)}</option>`).join("");
const servicioPreseleccionado = VeterinariaUtils.parametro("servicio");
if (servicioPreseleccionado) servicioCita.value = servicioPreseleccionado;
document.querySelector("#fechaCita").min = new Date().toISOString().split("T")[0];

if (!sesionCitas || sesionCitas.rol !== "cliente") {
    formCita.querySelectorAll("input, select, textarea, button").forEach(control => control.disabled = true);
    document.querySelector("#avisoSesion").innerHTML = '<div class="alert alert-warning">Debes <a href="login.html">iniciar sesión como cliente</a> para solicitar una hora.</div>';
}

function mascotasActuales() {
    return sesionCitas ? VeterinariaStorage.obtenerMascotas().filter(mascota => mascota.usuarioEmail === sesionCitas.email) : [];
}

function renderMascotas() {
    mascotaExistente.innerHTML = '<option value="">Registrar una nueva mascota</option>' + mascotasActuales().map(mascota => `<option value="${mascota.id}">${VeterinariaUtils.escaparHTML(mascota.nombre)} · ${VeterinariaUtils.escaparHTML(mascota.especie)}</option>`).join("");
}

mascotaExistente.addEventListener("change", () => {
    const mascota = mascotasActuales().find(item => item.id === Number(mascotaExistente.value));
    if (!mascota) {
        document.querySelector("#mascota").value = "";
        document.querySelector("#razaMascota").value = "";
        document.querySelector("#edadMascota").value = "";
        especieMascota.value = "";
        return;
    }
    document.querySelector("#mascota").value = mascota.nombre;
    document.querySelector("#razaMascota").value = mascota.raza;
    document.querySelector("#edadMascota").value = mascota.edad;
    especieMascota.value = mascota.especie;
});

const camposCita = {
    mascota: document.querySelector("#mascota"),
    raza: document.querySelector("#razaMascota"),
    edad: edadMascota,
    especie: especieMascota,
    servicio: servicioCita,
    fecha: document.querySelector("#fechaCita"),
    hora: document.querySelector("#horaCita")
};

function validarCita(campoActivo = null, validarTodos = false) {
    const valido = {
        mascota: camposCita.mascota.value.trim().length > 0 && camposCita.mascota.value.trim().length <= 50,
        raza: camposCita.raza.value.trim().length > 0 && camposCita.raza.value.trim().length <= 60,
        edad: camposCita.edad.value !== "" && Number.isInteger(Number(camposCita.edad.value)) && Number(camposCita.edad.value) >= 0 && Number(camposCita.edad.value) <= 40,
        especie: Boolean(camposCita.especie.value),
        servicio: Boolean(camposCita.servicio.value),
        fecha: VeterinariaUtils.fechaNoAnterior(camposCita.fecha.value),
        hora: Boolean(camposCita.hora.value)
    };
    Object.entries(valido).forEach(([clave, resultado]) => {
        if (validarTodos || camposCita[clave] === campoActivo) camposCita[clave].classList.toggle("is-invalid", !resultado);
    });
    return Object.values(valido).every(Boolean);
}

Object.values(camposCita).forEach(campo => {
    campo.addEventListener("input", () => validarCita(campo));
    campo.addEventListener("change", () => validarCita(campo));
});

function renderCitas() {
    const citas = sesionCitas ? VeterinariaStorage.obtenerCitas().filter(cita => cita.usuarioEmail === sesionCitas.email) : [];
    document.querySelector("#cantidadCitas").textContent = `${citas.length} registrada${citas.length === 1 ? "" : "s"}`;
    if (!citas.length) {
        listaCitas.innerHTML = '<div class="card-soft text-center"><h3 class="h5">Aún no tienes solicitudes</h3><p class="text-secondary mb-0">Completa el formulario para crear la primera.</p></div>';
        return;
    }
    listaCitas.innerHTML = citas.map(cita => { const servicio = VeterinariaDatos.servicios.find(item => item.codigo === cita.servicio); return `<article class="card-soft mb-3"><div class="cita-resumen"><div><span class="product-code">${cita.fecha} · ${cita.hora}</span><h3 class="h5 mt-1 mb-1">${VeterinariaUtils.escaparHTML(cita.mascota)}</h3><p class="text-secondary mb-0">${VeterinariaUtils.escaparHTML(servicio?.nombre || cita.servicio)}</p></div><span class="badge-status cita-estado ${cita.estado === "Confirmada" ? "stock-ok" : cita.estado === "Cancelada" ? "stock-out" : "stock-low"}">${cita.estado}</span></div></article>`; }).join("");
}

formCita.addEventListener("submit", event => {
    event.preventDefault();
    if (!sesionCitas || sesionCitas.rol !== "cliente") return;
    const mascota = document.querySelector("#mascota").value.trim();
    const especie = document.querySelector("#especie").value;
    const raza = document.querySelector("#razaMascota").value.trim();
    const edad = Number(document.querySelector("#edadMascota").value);
    const servicio = servicioCita.value;
    const fecha = document.querySelector("#fechaCita").value;
    const hora = document.querySelector("#horaCita").value;
    if (!validarCita(null, true)) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeCitas"), "Completa los datos y selecciona una fecha igual o posterior a hoy.", "danger");
    let mascotaGuardada = mascotasActuales().find(item => item.id === Number(mascotaExistente.value));
    if (!mascotaGuardada) {
        mascotaGuardada = { id: Date.now(), usuarioEmail: sesionCitas.email, nombre: mascota, especie, raza, edad };
        const mascotas = VeterinariaStorage.obtenerMascotas();
        mascotas.push(mascotaGuardada);
        VeterinariaStorage.guardarMascotas(mascotas);
    }
    const citas = VeterinariaStorage.obtenerCitas();
    citas.push({ id: Date.now(), usuarioEmail: sesionCitas.email, usuarioNombre: sesionCitas.nombre, mascotaId: mascotaGuardada.id, mascota, especie, servicio, fecha, hora, motivo: document.querySelector("#motivoCita").value.trim(), estado: "Pendiente" });
    VeterinariaStorage.guardarCitas(citas);
    formCita.reset();
    servicioCita.value = "";
    VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeCitas"), "Solicitud creada. Recepción debe confirmarla.");
    renderMascotas();
    renderCitas();
});

renderMascotas();
renderCitas();
