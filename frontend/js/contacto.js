const formContacto = document.querySelector("#formContacto");

function marcarContacto(campo, valido) {
    campo.classList.remove("is-valid", "is-invalid");
    campo.classList.add(valido ? "is-valid" : "is-invalid");
    return valido;
}

formContacto.addEventListener("submit", event => {
    event.preventDefault();
    const nombre = document.querySelector("#nombreContacto");
    const email = document.querySelector("#emailContacto");
    const asunto = document.querySelector("#asuntoContacto");
    const comentario = document.querySelector("#comentarioContacto");
    const correoValido = !email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const valido = [
        marcarContacto(nombre, nombre.value.trim().length >= 3 && nombre.value.trim().length <= 100),
        marcarContacto(email, correoValido),
        marcarContacto(asunto, asunto.value.trim().length >= 5 && asunto.value.trim().length <= 100),
        marcarContacto(comentario, comentario.value.trim().length >= 10 && comentario.value.trim().length <= 500)
    ].every(Boolean);
    if (!valido) return;
    VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeContacto"), "Mensaje validado y enviado correctamente.");
    formContacto.reset();
    formContacto.querySelectorAll(".is-valid, .is-invalid").forEach(campo => campo.classList.remove("is-valid", "is-invalid"));
});
