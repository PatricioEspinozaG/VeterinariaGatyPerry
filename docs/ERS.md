# Especificacion de Requisitos de Software (ERS)

## 1. Alcance

Gaty Perry es una demostracion frontend para gestionar informacion publica de la veterinaria, usuarios, productos y solicitudes de citas. La version de esta evaluacion funciona con HTML, CSS, JavaScript, Bootstrap y localStorage. No existe backend ni base de datos en esta entrega.

## 2. Actores

- Cliente: registra sus datos, registra y selecciona sus mascotas, solicita citas y revisa sus estados.
- Recepcion: revisa y actualiza estados, fechas y horas de citas.
- Administrador: ademas gestiona usuarios y productos.

## 3. Requisitos y trazabilidad

| ID | Descripcion | Implementacion | Estado |
| --- | --- | --- | --- |
| ERS-01 | Validar identidad, campos obligatorios y longitudes del registro | registro.html / registro.js | Implementado V1 |
| ERS-02 | Restringir dominios de correo permitidos | utilidades.js, login.js, registro.js, contacto.js | Implementado V1 |
| ERS-03 | Validar dinamicamente mediante input y blur | login.js, registro.js, contacto.js | Implementado V1 |
| ERS-04 | Gestionar usuarios y roles admin, recepcion y cliente | admin.html / admin.js | Implementado V1 |
| ERS-05 | No permitir la autodesactivacion del administrador | admin.js | Implementado V1 |
| ERS-06 | Gestionar catalogo con categoria, principio activo, presentacion, especie, precio y stock | admin.html / admin.js | Implementado V1 |
| ERS-07 | Solicitar citas para clientes autenticados | citas.html / citas.js | Implementado V1 |
| ERS-08 | Reagendar con nueva fecha y hora y mantener estados | admin.html / admin.js | Implementado V1 |
| ERS-09 | Validar fechas no anteriores al dia actual | citas.js / admin.js | Implementado V1 |
| ERS-10 | Registrar y listar mascotas propias | citas.html / citas.js / storage.js | Implementado V1 |
| ERS-11 | Informar clinica, mision, vision y equipo | nosotros.html | Implementado V1 |
| ERS-12 | Mapa interactivo por defecto y accion Como llegar | contacto.html | Implementado V1 |
| ERS-13 | Persistir la demostracion con localStorage | storage.js | Implementado V1 |
| ERS-14 | Envio y recepcion real de mensajes de contacto | contacto.html / contacto.js | Parcial V1 |

## 4. Requisitos no funcionales

- La interfaz mantiene la paleta, logos GIF, Bootstrap y estructura HTML/CSS/JavaScript existente.
- La vista debe adaptarse a 360 px, 768 px y 1280 px mediante responsive.css y Bootstrap.
- La persistencia local es solo demostrativa y no debe considerarse seguridad real.
- Los datos clinicos reales no forman parte de esta version.

## 5. Evolucion planificada

La siguiente etapa puede incorporar React SPA, Spring Boot, microservicios, API REST y JSON, autenticacion segura y roles, base de datos relacional, Docker y AWS. Tambien quedan planificados historial clinico, vacunas y medicamentos asociados a pacientes, recordatorios y reportes. Ninguno de estos elementos se declara implementado en la Parcial 1.
