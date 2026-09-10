const formContacto = document.querySelector("#formContacto");

function marcarContacto(campo, valido) {
    campo.classList.remove("is-valid");
    campo.classList.toggle("is-invalid", !valido);
    return valido;
}

const camposContacto = {
    nombre: document.querySelector("#nombreContacto"),
    email: document.querySelector("#emailContacto"),
    asunto: document.querySelector("#asuntoContacto"),
    comentario: document.querySelector("#comentarioContacto")
};

function validarContacto(campoActivo = null, validarTodos = false) {
    const resultados = {
        nombre: camposContacto.nombre.value.trim().length >= 3 && camposContacto.nombre.value.trim().length <= 100,
        email: !camposContacto.email.value.trim() || VeterinariaUtils.correoPermitido(camposContacto.email.value),
        asunto: camposContacto.asunto.value.trim().length >= 5 && camposContacto.asunto.value.trim().length <= 100,
        comentario: camposContacto.comentario.value.trim().length >= 10 && camposContacto.comentario.value.trim().length <= 500
    };
    Object.entries(resultados).forEach(([clave, valido]) => {
        if (validarTodos || camposContacto[clave] === campoActivo) marcarContacto(camposContacto[clave], valido);
    });
    return Object.values(resultados).every(Boolean);
}

Object.values(camposContacto).forEach(campo => {
    campo.addEventListener("input", () => validarContacto(campo));
});

formContacto.addEventListener("submit", event => {
    event.preventDefault();
    if (!validarContacto(null, true)) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeContacto"), "Revisa los campos marcados. El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.", "danger");
    VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeContacto"), "Mensaje validado y enviado correctamente.");
    formContacto.reset();
    formContacto.querySelectorAll(".is-valid, .is-invalid").forEach(campo => campo.classList.remove("is-valid", "is-invalid"));
});
