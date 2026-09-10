const formLogin = document.querySelector("#formLogin");
const emailLogin = document.querySelector("#email");
const passwordLogin = document.querySelector("#password");

function validarLogin(campoActivo = null, validarTodos = false) {
    const emailValido = VeterinariaUtils.correoPermitido(emailLogin.value);
    const passwordValida = passwordLogin.value.length >= 4 && passwordLogin.value.length <= 10;
    emailLogin.classList.toggle("is-invalid", (validarTodos || campoActivo === emailLogin) && !emailValido);
    passwordLogin.classList.toggle("is-invalid", (validarTodos || campoActivo === passwordLogin) && !passwordValida);
    return emailValido && passwordValida;
}

[emailLogin, passwordLogin].forEach(campo => campo.addEventListener("input", () => validarLogin(campo)));

formLogin.addEventListener("submit", event => {
    event.preventDefault();
    if (!validarLogin(null, true)) {
        return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeLogin"), "Revisa el correo permitido y la contraseña.", "danger");
    }

    const usuario = VeterinariaStorage.obtenerUsuarios().find(item => item.email.toLowerCase() === emailLogin.value.trim().toLowerCase() && item.password === passwordLogin.value && item.activo);
    if (!usuario) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeLogin"), "Correo o contraseña incorrectos, o usuario inactivo.", "danger");
    VeterinariaStorage.guardarSesion({ id: usuario.id, nombre: `${usuario.nombre} ${usuario.apellidos}`, email: usuario.email, rol: usuario.rol });
    window.location.href = usuario.rol === "admin" || usuario.rol === "recepcion" ? "admin.html" : "citas.html";
});
