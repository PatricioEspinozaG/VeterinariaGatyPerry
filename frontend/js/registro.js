const formRegistro = document.querySelector("#formRegistro");
const region = document.querySelector("#region");
const comuna = document.querySelector("#comuna");

function correoPermitido(email) {
    return /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(email);
}

function rutValido(valor) {
    const limpio = valor.replace(/\./g, "").replace(/-/g, "").toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resultado = 11 - (suma % 11);
    const esperado = resultado === 11 ? "0" : resultado === 10 ? "K" : String(resultado);
    return dv === esperado;
}

function marcar(campo, valido) {
    campo.classList.remove("is-valid", "is-invalid");
    campo.classList.add(valido ? "is-valid" : "is-invalid");
    return valido;
}

function cargarRegiones() {
    region.innerHTML = Object.keys(VeterinariaDatos.regiones).map(nombre => `<option value="${nombre}">${nombre}</option>`).join("");
    cargarComunas();
}

function cargarComunas() {
    comuna.innerHTML = VeterinariaDatos.regiones[region.value].map(nombre => `<option value="${nombre}">${nombre}</option>`).join("");
}

formRegistro.addEventListener("submit", event => {
    event.preventDefault();
    const nombre = document.querySelector("#nombre");
    const apellidos = document.querySelector("#apellidos");
    const rut = document.querySelector("#rut");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const confirmar = document.querySelector("#confirmarPassword");
    const direccion = document.querySelector("#direccion");
    const validaciones = [
        marcar(nombre, nombre.value.trim().length >= 2 && nombre.value.trim().length <= 50),
        marcar(apellidos, apellidos.value.trim().length >= 2 && apellidos.value.trim().length <= 100),
        marcar(rut, rutValido(rut.value)),
        marcar(email, correoPermitido(email.value.trim()) && email.value.length <= 100),
        marcar(password, password.value.length >= 4 && password.value.length <= 10),
        marcar(confirmar, confirmar.value === password.value && confirmar.value.length > 0),
        marcar(direccion, direccion.value.trim().length > 0 && direccion.value.trim().length <= 300)
    ];
    if (validaciones.includes(false)) return;

    const usuarios = VeterinariaStorage.obtenerUsuarios();
    if (usuarios.some(usuario => usuario.email.toLowerCase() === email.value.trim().toLowerCase())) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeRegistro"), "Ese correo ya está registrado.", "danger");
    if (usuarios.some(usuario => usuario.rut.replace(/\W/g, "") === rut.value.replace(/\W/g, ""))) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeRegistro"), "Ese RUN ya está registrado.", "danger");

    usuarios.push({ id: Date.now(), rut: rut.value.trim(), nombre: nombre.value.trim(), apellidos: apellidos.value.trim(), email: email.value.trim().toLowerCase(), password: password.value, rol: "cliente", activo: true, region: region.value, comuna: comuna.value, direccion: direccion.value.trim() });
    VeterinariaStorage.guardarUsuarios(usuarios);
    VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeRegistro"), "Cuenta creada correctamente. Ahora puedes iniciar sesión.");
    formRegistro.reset();
    formRegistro.querySelectorAll(".is-valid, .is-invalid").forEach(campo => campo.classList.remove("is-valid", "is-invalid"));
    cargarRegiones();
});

region.addEventListener("change", cargarComunas);
cargarRegiones();
