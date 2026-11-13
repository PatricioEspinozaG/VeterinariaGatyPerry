# Base local para el backend

Los servicios `auth` (8081), `pacientes` (8082), `citas` (8083),
`productos` (8084), `pedidos` (8085) y `clinica` (8086) usan PostgreSQL local. Cada servicio
tiene su propia base y usuario. Flyway crea las tablas en una base nueva.

## Arranque en Windows (PowerShell, desde la raíz del repositorio)

1. Si aún no existe, crea `backend/.env` copiando `backend/.env.example`.
   Si ya existe, conserva sus valores y agrega `PRODUCTOS_DB_PASSWORD`,
   `PEDIDOS_DB_PASSWORD`, `CLINICA_DB_PASSWORD` e `INTERNAL_API_TOKEN` con valores privados.
   Verifica que `KEYS_DIR` apunte a la carpeta con `auth-private.pem` y
   `auth-public.pem`. No subas el archivo ni las claves a Git:

   ```powershell
   if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
   notepad backend/.env
   ```

2. Abre Docker Desktop. Si ya tenías el volumen PostgreSQL con las bases de
   auth, pacientes y citas, crea las tres bases nuevas en ese mismo volumen:

   ```powershell
   docker compose --env-file backend/.env -f backend/compose.yaml up -d postgres
   docker compose --env-file backend/.env -f backend/compose.yaml exec postgres sh /docker-entrypoint-initdb.d/02-comercio.sh
   docker compose --env-file backend/.env -f backend/compose.yaml exec postgres sh /docker-entrypoint-initdb.d/03-clinica.sh
   ```

   El script admite repetición. En una instalación nueva, PostgreSQL lo
   ejecuta automáticamente al inicializar el volumen.

3. Levanta los servicios y revisa su estado:

   ```powershell
   docker compose --env-file backend/.env -f backend/compose.yaml config --quiet
   docker compose --env-file backend/.env -f backend/compose.yaml up -d --build
   docker compose --env-file backend/.env -f backend/compose.yaml ps
   ```

4. Comprueba que cada aplicación esté lista:

   ```powershell
   8081..8086 | ForEach-Object { Invoke-RestMethod "http://localhost:$_/actuator/health" }
   ```

En Postman: registra un cliente, inicia sesión, crea una mascota con su
Bearer token y crea una cita para esa mascota. Confirma que disponibilidad
oculte la hora ocupada; con otro cliente, verifica 403 para datos ajenos.
Prueba también un pedido y su reserva de stock mediante productos-service.

PostgreSQL escucha únicamente en `127.0.0.1:5432` del PC, con las bases
`gp_auth`, `gp_pacientes`, `gp_citas`, `gp_productos`, `gp_pedidos` y `gp_clinica`. Las
contraseñas son las de `backend/.env`.

El volumen `postgres_data` persiste entre reinicios y recreaciones de los
contenedores. **No uses `docker compose down -v`**: ese comando elimina el
volumen y los datos. Los scripts de inicialización corren automáticamente
solo en un volumen nuevo; cambiar contraseñas en `.env` después no actualiza
las contraseñas existentes. Los datos de Oracle no se copian automáticamente.

Este Compose es para desarrollo local. Antes de desplegar en AWS habrá que
definir copias de seguridad y almacenamiento persistente.
