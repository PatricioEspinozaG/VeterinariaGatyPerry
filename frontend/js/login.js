const formLogin = document.querySelector("#formLogin");

formLogin.addEventListener("submit", event => {
    event.preventDefault();
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const emailValido = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(email.value.trim());
    const passwordValida = password.value.length >= 4 && password.value.length <= 10;
    email.classList.toggle("is-invalid", !emailValido);
    password.classList.toggle("is-invalid", !passwordValida);
    if (!emailValido || !passwordValida) return;

    const usuario = VeterinariaStorage.obtenerUsuarios().find(item => item.email.toLowerCase() === email.value.trim().toLowerCase() && item.password === password.value && item.activo);
    if (!usuario) return VeterinariaUtils.mostrarMensaje(document.querySelector("#mensajeLogin"), "Correo o contraseña incorrectos, o usuario inactivo.", "danger");
    VeterinariaStorage.guardarSesion({ id: usuario.id, nombre: `${usuario.nombre} ${usuario.apellidos}`, email: usuario.email, rol: usuario.rol });
    window.location.href = usuario.rol === "admin" || usuario.rol === "recepcion" ? "admin.html" : "citas.html";
});
