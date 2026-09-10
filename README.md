# Gaty Perry

Proyecto frontend para la Evaluacion Parcial 1 de DSY1104. La aplicacion representa una veterinaria llamada Gaty Perry y permite revisar servicios, productos, usuarios y solicitudes de citas.

## Estructura real

```text
.
|- README.md
|- backend/                 # Reservado para una evolucion futura; actualmente vacio
|- docs/
|  |- ERS.md
|  `- requerimientos.md
`- frontend/
	|- *.html
	|- css/
	|  |- base.css
	|  |- components.css
	|  `- responsive.css
	|- img/
	|  |- logo-nav.gif
	|  |- logo-footer.gif
	|  `- veterinaria-hero.png
	`- js/
		|- admin.js, blog.js, carrito.js, citas.js, componentes.js
		|- contacto.js, datos.js, inicio.js, login.js, productos.js
		|- registro.js, servicios.js, storage.js, utilidades.js
```

## Ejecucion

1. Abrir la carpeta del proyecto en VS Code.
2. Instalar la extension Live Server si no esta disponible.
3. Hacer clic derecho en `frontend/index.html` y elegir **Open with Live Server**.
4. Navegar por las paginas desde el sitio servido. Tambien es posible abrir los HTML directamente, aunque Live Server ofrece una experiencia mas consistente.

## Credenciales de demostracion

| Rol | Correo | Contrasena |
| --- | --- | --- |
| Administrador | admin@duoc.cl | admin123 |
| Recepcion | recepcion@duoc.cl | recep123 |
| Cliente | cliente@gmail.com | cliente1 |

## Funcionalidades de esta version

- Validaciones dinamicas y validaciones al enviar formularios.
- Dominios permitidos: `@duoc.cl`, `@profesor.duoc.cl` y `@gmail.com`.
- Gestion administrativa de usuarios, roles, activacion y desactivacion.
- Gestion de productos, categorias controladas y alertas de stock critico.
- Registro y listado de mascotas propias.
- Solicitud y reagendamiento de citas con estado, fecha y hora.
- Mapa interactivo en Contacto con direccion por defecto y enlace **Como llegar**.
- Persistencia mediante `localStorage`; los datos son solo de demostracion frontend.

## Limitaciones y evolucion futura

No hay backend, autenticacion segura ni base de datos en esta entrega. React SPA, Spring Boot, microservicios, API REST/JSON, base de datos relacional, Docker, AWS, historial clinico, vacunas, medicamentos, recordatorios y reportes quedan como etapas futuras documentadas en [docs/ERS.md](docs/ERS.md).