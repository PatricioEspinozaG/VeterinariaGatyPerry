const VeterinariaStorage = (() => {
    const CLAVES = {
        productos: "vsm_productos",
        carrito: "vsm_carrito",
        usuarios: "vsm_usuarios",
        sesion: "vsm_sesion",
        citas: "vsm_citas",
        mascotas: "vsm_mascotas"
    };

    const usuariosIniciales = [
        { id: 1, rut: "11111111-1", nombre: "Administrador", apellidos: "Gaty Perry", email: "admin@duoc.cl", password: "admin123", rol: "admin", activo: true },
        { id: 2, rut: "22222222-2", nombre: "Recepción", apellidos: "Gaty Perry", email: "recepcion@duoc.cl", password: "recep123", rol: "recepcion", activo: true },
        { id: 3, rut: "19011022-K", nombre: "Cliente", apellidos: "Demostración", email: "cliente@gmail.com", password: "cliente1", rol: "cliente", activo: true }
    ];

    function clonar(valor) {
        return JSON.parse(JSON.stringify(valor));
    }

    function leer(clave, valorPorDefecto) {
        try {
            const dato = localStorage.getItem(clave);
            return dato ? JSON.parse(dato) : valorPorDefecto;
        } catch (error) {
            console.error(`No se pudo leer ${clave}:`, error);
            return valorPorDefecto;
        }
    }

    function guardar(clave, valor) {
        localStorage.setItem(clave, JSON.stringify(valor));
    }

    function inicializar() {
        if (!localStorage.getItem(CLAVES.productos)) guardar(CLAVES.productos, clonar(VeterinariaDatos.productos));
        if (!localStorage.getItem(CLAVES.usuarios)) guardar(CLAVES.usuarios, clonar(usuariosIniciales));
        if (!localStorage.getItem(CLAVES.carrito)) guardar(CLAVES.carrito, []);
        if (!localStorage.getItem(CLAVES.citas)) guardar(CLAVES.citas, []);
        if (!localStorage.getItem(CLAVES.mascotas)) guardar(CLAVES.mascotas, []);
    }

    function obtenerProductos() { inicializar(); return leer(CLAVES.productos, []); }
    function guardarProductos(productos) { guardar(CLAVES.productos, productos); }
    function obtenerProductoPorCodigo(codigo) { return obtenerProductos().find(producto => producto.codigo === codigo); }
    function obtenerCarrito() { inicializar(); return leer(CLAVES.carrito, []); }
    function guardarCarrito(carrito) {
        const limpio = carrito.filter(item => Number(item.cantidad) > 0).map(item => ({ codigo: item.codigo, cantidad: Number(item.cantidad) }));
        guardar(CLAVES.carrito, limpio);
    }
    function vaciarCarrito() { guardar(CLAVES.carrito, []); }
    function obtenerUsuarios() { inicializar(); return leer(CLAVES.usuarios, []); }
    function guardarUsuarios(usuarios) { guardar(CLAVES.usuarios, usuarios); }
    function obtenerSesion() { return leer(CLAVES.sesion, null); }
    function guardarSesion(sesion) { guardar(CLAVES.sesion, sesion); }
    function cerrarSesion() { localStorage.removeItem(CLAVES.sesion); }
    function obtenerCitas() { inicializar(); return leer(CLAVES.citas, []); }
    function guardarCitas(citas) { guardar(CLAVES.citas, citas); }
    function obtenerMascotas() { inicializar(); return leer(CLAVES.mascotas, []); }
    function guardarMascotas(mascotas) { guardar(CLAVES.mascotas, mascotas); }

    inicializar();

    return {
        obtenerProductos, guardarProductos, obtenerProductoPorCodigo,
        obtenerCarrito, guardarCarrito, vaciarCarrito,
        obtenerUsuarios, guardarUsuarios,
        obtenerSesion, guardarSesion, cerrarSesion,
        obtenerCitas, guardarCitas,
        obtenerMascotas, guardarMascotas
    };
})();
