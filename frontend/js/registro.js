const formRegistro = document.querySelector("#formRegistro");
const region = document.querySelector("#region");
const comuna = document.querySelector("#comuna");

function correoPermitido(email) {
    return VeterinariaUtils.correoPermitido(email);
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
    campo.classList.remove("is-valid");
    campo.classList.toggle("is-invalid", !valido);
    return valido;
}

function cargarRegiones() {
    region.innerHTML = Object.keys(VeterinariaDatos.regiones).map(nombre => `<option value="${nombre}">${nombre}</option>`).join("");
    cargarComunas();
}

function cargarComunas() {
    comuna.innerHTML = VeterinariaDatos.regiones[region.value].map(nombre => `<option value="${nombre}">${nombre}</option>`).join("");
}

const camposRegistro = {
    nombre: document.querySelector("#nombre"),
    apellidos: document.querySelector("#apellidos"),
    rut: document.querySelector("#rut"),
    email: document.querySelector("#email"),
    password: document.querySelector("#password"),
    confirmar: document.querySelector("#confirmarPassword"),
    direccion: document.querySelector("#direccion")
};

function validarRegistro(campoActivo = null, validarTodos = false) {
    const resultados = {
        nombre: camposRegistro.nombre.value.trim().length >= 2 && camposRegistro.nombre.value.trim().length <= 50,
        apellidos: camposRegistro.apellidos.value.trim().length >= 2 && camposRegistro.apellidos.value.trim().length <= 100,
        rut: rutValido(camposRegistro.rut.value),
        email: correoPermitido(camposRegistro.email.value) && camposRegistro.email.value.trim().length <= 100,
        password: camposRegistro.password.value.length >= 4 && camposRegistro.password.value.length <= 10,
        confirmar: camposRegistro.confirmar.value === camposRegistro.password.value && camposRegistro.confirmar.value.length > 0,
        direccion: camposRegistro.direccion.value.trim().length > 0 && camposRegistro.direccion.value.trim().length <= 300
    };
    Object.entries(resultados).forEach(([clave, valido]) => {
        if (validarTodos || camposRegistro[clave] === campoActivo) marcar(camposRegistro[clave], valido);
    });
    return Object.values(resultados).every(Boolean);
}

Object.values(camposRegistro).forEach(campo => {
    campo.addEventListener("input", () => validarRegistro(campo));
});

formRegistro.addEventListener("submit", event => {
    event.preventDefault();
    const { nombre, apellidos, rut, email, password, confirmar, direccion } = camposRegistro;
    if (!validarRegistro(null, true)) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeRegistro"), "Revisa los campos marcados antes de continuar.", "danger");

    const usuarios = VeterinariaStorage.obtenerUsuarios();
    if (usuarios.some(usuario => usuario.email.toLowerCase() === email.value.trim().toLowerCase())) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeRegistro"), "Ese correo ya está registrado.", "danger");
    if (usuarios.some(usuario => usuario.rut.replace(/[.\-]/g, "").toUpperCase() === rut.value.replace(/[.\-]/g, "").toUpperCase())) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeRegistro"), "Ese RUN ya está registrado.", "danger");

    usuarios.push({ id: Date.now(), rut: rut.value.trim(), nombre: nombre.value.trim(), apellidos: apellidos.value.trim(), email: email.value.trim().toLowerCase(), password: password.value, rol: "cliente", activo: true, region: region.value, comuna: comuna.value, direccion: direccion.value.trim() });
    VeterinariaStorage.guardarUsuarios(usuarios);
    VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeRegistro"), "Cuenta creada correctamente. Ahora puedes iniciar sesión.");
    formRegistro.reset();
    formRegistro.querySelectorAll(".is-valid, .is-invalid").forEach(campo => campo.classList.remove("is-valid", "is-invalid"));
    cargarRegiones();
});

region.addEventListener("change", cargarComunas);
cargarRegiones();
