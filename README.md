# Gaty Perry

Proyecto frontend para la Evaluación Parcial 1 de DSY1104 Desarrollo FullStack II.

Gaty Perry es una demostración web para una clínica veterinaria de Rancagua. Permite consultar servicios y productos, registrar usuarios, iniciar sesión, gestionar mascotas, solicitar citas y administrar información mediante perfiles simulados.

## Estructura del proyecto

```text
.
├── README.md
└── frontend/
    ├── *.html
    ├── css/
    │   ├── base.css
    │   ├── components.css
    │   └── responsive.css
    ├── js/
    │   ├── admin.js
    │   ├── blog.js
    │   ├── carrito.js
    │   ├── citas.js
    │   ├── componentes.js
    │   ├── contacto.js
    │   ├── datos.js
    │   ├── inicio.js
    │   ├── login.js
    │   ├── productos.js
    │   ├── registro.js
    │   ├── servicios.js
    │   ├── storage.js
    │   └── utilidades.js
    └── img/
        ├── productos/
        ├── servicios/
        ├── logo-nav.gif
        ├── logo-footer.gif
        └── veterinaria-hero.png
```

## Tecnologías

- HTML5 y CSS3.
- Bootstrap 5.
- JavaScript y manipulación del DOM.
- `localStorage` para la persistencia demostrativa.
- Google Maps embebido.
- Git y GitHub.

## Ejecución

1. Abrir el proyecto en Visual Studio Code.
2. Instalar la extensión **Live Server**.
3. Hacer clic derecho sobre `frontend/index.html`.
4. Seleccionar **Open with Live Server**.

La aplicación funciona como un frontend estático y no requiere backend.

## Perfiles de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Recepción | recepcion@duoc.cl | recep123 |
| Cliente | cliente@gmail.com | cliente1 |

## Funcionalidades

- Página de inicio de Gaty Perry.
- Catálogo de servicios veterinarios con búsqueda y filtros.
- Catálogo de medicamentos y vacunas.
- Detalle de productos.
- Carrito de compra simulado.
- Registro e inicio de sesión.
- Validaciones dinámicas de formularios.
- Gestión de mascotas propias.
- Solicitud y consulta de citas.
- Confirmación, reagendamiento y cancelación de citas.
- Panel administrativo.
- Gestión de productos, usuarios, roles y stock.
- Blog con consejos para el cuidado de mascotas.
- Formulario de contacto.
- Mapa con la ubicación de la clínica.
- Enlace para obtener indicaciones mediante Google Maps.
- Diseño responsive para móvil, tablet y escritorio.

## Roles

### Cliente

- Registrarse e iniciar sesión.
- Registrar y seleccionar mascotas.
- Solicitar citas.
- Consultar sus propias citas.
- Revisar servicios y productos.
- Usar el carrito simulado.

### Recepción

- Consultar solicitudes de citas.
- Confirmar citas.
- Reagendar citas.
- Cancelar citas.

### Administrador

- Gestionar usuarios y roles.
- Activar o desactivar usuarios.
- Crear, editar y eliminar productos.
- Revisar stock crítico.
- Gestionar estados de las citas.

## Responsive

La interfaz está preparada para:

- Móvil: desde 360 px.
- Tablet: desde 768 px.
- Escritorio: desde 1280 px.

Bootstrap y CSS propio adaptan la navegación, formularios, tarjetas, footer, tablas, mapa y catálogos.

## Persistencia

Los datos de demostración se almacenan en el navegador mediante `localStorage`:

- Usuarios.
- Sesión activa.
- Productos.
- Carrito.
- Mascotas.
- Citas.

Estos datos son únicamente demostrativos y no representan un sistema de autenticación o almacenamiento seguro.

## Alcance de esta versión

Esta entrega corresponde a una implementación frontend académica. No incluye backend, base de datos, autenticación segura, API REST, React, Spring Boot, microservicios, Docker ni AWS.

El historial clínico, las vacunas, los medicamentos asociados a pacientes, los reportes y los recordatorios automáticos quedan como evolución futura.

## Documentación ERS

El ERS versión 1 formal se entrega como documento Word separado en la carpeta de Drive del equipo:

[ERS V1 Gaty Perry en Google Drive](https://docs.google.com/document/d/1rN8PYLHB_p88ei29tOqIiUGdZh-gSb-z/edit)
