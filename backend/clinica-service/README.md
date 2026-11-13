# clinica-service

Microservicio responsable de las atenciones y vacunas del historial clínico.
No mantiene copias de mascotas, propietarios ni credenciales: consulta sus
servicios de origen y almacena únicamente registros clínicos.

## Arquitectura

El proyecto usa Java 21 y Spring Boot 4.1.2. Los controladores reciben y
validan solicitudes; los servicios aplican reglas clínicas y de propiedad;
los repositorios persisten entidades JPA en PostgreSQL. Flyway crea el esquema
desde `src/main/resources/db/migration/V1__crear_clinica.sql`.

Los paquetes principales son `controller`, `config`, `dto`, `model`,
`repository` y `service`. Los registros de atención y vacuna se anulan de forma
lógica y conservan sus datos y motivo. `version` permite detectar escrituras
concurrentes. La identidad de auditoría siempre viene del JWT.

## Configuración

Variables requeridas o con valor predeterminado:

| Variable | Uso | Valor local sugerido |
|---|---|---|
| `DB_URL` | JDBC de PostgreSQL | `jdbc:postgresql://localhost:5432/gp_clinica` |
| `DB_USER` | Usuario de la base | `gp_clinica` |
| `DB_PASSWORD` | Contraseña privada de la base | Configúrala fuera de Git |
| `JWT_PUBLIC_KEY` | Clave pública PEM de auth | `file:C:/ruta/segura/auth-public.pem` |
| `PACIENTES_BASE_URL` | URL de pacientes-service | `http://localhost:8082` |
| `CITAS_BASE_URL` | URL de citas-service | `http://localhost:8083` |
| `SERVER_PORT` | Puerto HTTP | `8086` |
| `HTTP_CONNECT_TIMEOUT` | Timeout de conexión remota | `2s` |
| `HTTP_READ_TIMEOUT` | Timeout de lectura remota | `3s` |

No se necesita ni se debe configurar una clave privada en este servicio. No
guardes contraseñas, claves PEM ni archivos `.env` en Git. La conexión remota
propaga el JWT del solicitante; los servicios remotos deben ser accesibles
desde el entorno donde se ejecute clínica.

## PostgreSQL

El servicio crea las tablas con Flyway y tiene `ddl-auto: none`. En una
instalación PostgreSQL propia, crea una base y usuario dedicados antes de
arrancar. Para agregarla a una instancia o volumen existente, primero verifica
que no existan ya `gp_clinica` y el rol `gp_clinica`; después conéctate como
administrador a la base `postgres` y ejecuta, en una sesión interactiva:

```sql
CREATE ROLE gp_clinica LOGIN;
```

Asigna la contraseña de forma interactiva (por ejemplo, con
`\password gp_clinica` en `psql`) y luego crea la base fuera de una transacción:

```sql
CREATE DATABASE gp_clinica OWNER gp_clinica;
```

Si la base o el rol ya existen, no los elimines: inspecciona el estado y
coordina su uso. No ejecutes `docker compose down -v`; el volumen compartido
puede contener datos de otros servicios. En el Compose compartido, el script
`backend/postgres/init-clinica.sh` crea la base de forma segura; si el volumen
ya existía, ejecútalo manualmente según `backend/POSTGRES_LOCAL.md`.

## Ejecución local

Desde PowerShell, en este directorio, con Java 21:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/gp_clinica"
$env:DB_USER = "gp_clinica"
$env:DB_PASSWORD = "<contraseña-local>"
$env:JWT_PUBLIC_KEY = "file:C:/ruta/segura/auth-public.pem"
$env:PACIENTES_BASE_URL = "http://localhost:8082"
$env:CITAS_BASE_URL = "http://localhost:8083"
.\mvnw.cmd spring-boot:run
```

El primer arranque aplica la migración de Flyway. Para compilar y probar:

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

## Docker

El `Dockerfile` construye la aplicación con Maven y la ejecuta sobre Java 21;
expone el puerto `8086`. Debes pasar sus variables de entorno y montar solo la
clave pública. Docker y PostgreSQL deben estar disponibles en el host para
realizar esta prueba. El arranque integrado está en `backend/compose.yaml`.

Desde este directorio, con un archivo `.env` local ignorado por Git y una
red Docker donde sean accesibles PostgreSQL, pacientes y citas:

```powershell
docker build -t gaty-perry-clinica:local .
docker run --rm --name clinica --network gaty-perry-backend -p 8086:8086 `
  --env-file .env `
  --mount type=bind,source=C:/ruta/segura/auth-public.pem,target=/keys/auth-public.pem,readonly `
  gaty-perry-clinica:local
```

Configura `JWT_PUBLIC_KEY=file:/keys/auth-public.pem` y URLs de base de datos
y servicios que resuelvan dentro de esa red. El nombre `gaty-perry-backend`
es ilustrativo: usa la red real de tu entorno.

## API

Todas las rutas usan el prefijo `/api/v1/clinica` y requieren JWT Bearer,
excepto `/actuator/health`.

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/mascotas/{mascotaId}/historial?limite=50` | ADMIN; CLIENTE solo propia |
| GET | `/atenciones/{id}` | ADMIN; CLIENTE solo propia |
| POST | `/gestion/atenciones` | ADMIN |
| PUT | `/gestion/atenciones/{id}` | ADMIN |
| PATCH | `/gestion/atenciones/{id}/anulacion` | ADMIN |
| GET | `/vacunas/{id}` | ADMIN; CLIENTE solo propia |
| POST | `/gestion/vacunas` | ADMIN |
| PUT | `/gestion/vacunas/{id}` | ADMIN |
| PATCH | `/gestion/vacunas/{id}/anulacion` | ADMIN |

El historial combina atenciones y vacunas y ordena por fecha descendente.
Incluye registros anulados y acepta `limite` de 1 a 100 (predeterminado: 50).
Las correcciones y anulaciones requieren el `version` devuelto en la consulta;
un conflicto de versión responde 409. Los registros creados devuelven 201 y
`Location`.

Ejemplo de atención (datos ficticios):

```http
POST /api/v1/clinica/gestion/atenciones
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "mascotaId": 42,
  "citaId": 73,
  "fechaAtencion": "2026-10-12T10:30:00",
  "motivo": "Control general",
  "diagnostico": "Buen estado general",
  "tratamiento": "Control anual",
  "observaciones": "Ejemplo ficticio",
  "profesionalResponsable": "Dra. Ejemplo"
}
```

Ejemplo de anulación:

```http
PATCH /api/v1/clinica/gestion/atenciones/15/anulacion
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "motivo": "Registro duplicado de ejemplo",
  "version": 0
}
```

Ejemplo de vacuna aplicada (datos ficticios):

```http
POST /api/v1/clinica/gestion/vacunas
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "mascotaId": 42,
  "nombreVacuna": "Vacuna de prueba",
  "fechaAplicacion": "2026-10-12",
  "profesionalResponsable": "Dra. Ejemplo",
  "lote": "LOTE-FICTICIO-01",
  "proximaDosis": "2027-10-12"
}
```

Las vacunas no permiten fechas de aplicación futuras; la próxima dosis, si se
indica, debe ser posterior a la aplicación. Una vacuna vinculada a atención
debe pertenecer a la misma mascota. Registrar una vacuna no descuenta
inventario.

## Seguridad y dependencias

La matriz aprobada es:

- `ADMIN`: consulta y administra atenciones y vacunas.
- `CLIENTE`: consulta únicamente el historial y los detalles de sus mascotas.
- `RECEPCION`: sin acceso clínico.

Se valida la firma RS256, expiración, emisor `gaty-perry-auth` y audiencia
`gaty-perry-api`. El rol proviene del claim `rol`; el usuario, de `sub`.
Pacientes valida la propiedad del cliente mediante
`GET /api/v1/mascotas/{id}`; el acceso del personal usa
`GET /api/v1/mascotas/gestion/{id}`. Las citas se consultan en
`GET /api/v1/citas/gestion/{id}`. Una cita cancelada o vinculada con otra
mascota/propietario no puede respaldar una atención. Errores remotos controlados
devuelven 503; no se autoriza si falla la comprobación de propiedad.

Swagger UI está en `/swagger-ui.html` y OpenAPI en `/v3/api-docs`; requieren un
JWT de ADMIN o CLIENTE. Health está en `/actuator/health`.

## Pruebas y limitaciones

Las pruebas unitarias no requieren Docker. La prueba de integración usa
PostgreSQL 17 mediante Testcontainers y se omite automáticamente si Docker no
está disponible. Para afirmar que Flyway funciona sobre PostgreSQL real,
ejecuta esa prueba en un entorno con Docker operativo; H2 no se utiliza como
sustituto.

Este servicio está agregado a Compose y al inicializador compartido de
bases de datos. Auth, pacientes y citas deben estar activos con la misma
clave pública y accesibles por las URLs configuradas.
