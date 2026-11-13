# Base local para el backend

Los servicios `auth` (8081), `pacientes` (8082) y `citas` (8083) usan un
PostgreSQL local. Cada servicio tiene su propia base y usuario. Flyway crea
las tablas en una base nueva. No se usa Oracle ni wallet.

## Arranque en Windows (PowerShell, desde la raíz del repositorio)

1. Crea `backend/.env` copiando `backend/.env.example`. Reemplaza todos los
   valores de ejemplo por valores privados y ajusta `KEYS_DIR` a la carpeta
   existente con `auth-private.pem` y `auth-public.pem`. No subas ese archivo
   ni las claves a Git:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   notepad backend/.env
   ```
2. Abre Docker Desktop y ejecuta:

   ```powershell
   docker compose --env-file backend/.env -f backend/compose.yaml config --quiet
   docker compose --env-file backend/.env -f backend/compose.yaml up -d --build
   docker compose --env-file backend/.env -f backend/compose.yaml ps
   ```

3. Comprueba que cada aplicación esté lista:

   ```powershell
   Invoke-RestMethod http://localhost:8081/actuator/health
   Invoke-RestMethod http://localhost:8082/actuator/health
   Invoke-RestMethod http://localhost:8083/actuator/health
   ```

En Postman: registra un cliente, inicia sesión, crea una mascota con su
Bearer token y crea una cita para esa mascota. Confirma que disponibilidad
oculte la hora ocupada; con otro cliente, verifica 403 para datos ajenos.

PostgreSQL escucha únicamente en `127.0.0.1:5433` del PC, con las bases
`gp_auth`, `gp_pacientes` y `gp_citas` y sus respectivos usuarios. Las
contraseñas son las de `backend/.env`.

El volumen `postgres_data` persiste entre reinicios y recreaciones de los
contenedores. **No uses `docker compose down -v`**: ese comando elimina el
volumen y los datos. El script de creación de bases corre solo en la primera
inicialización del volumen; cambiar contraseñas en `.env` después no cambia
automáticamente las contraseñas existentes. Los datos de Oracle no se copian:
si se necesitan, habrá que exportarlos cuando esa base vuelva a responder.

En AWS habrá que definir copias de seguridad y almacenamiento persistente
antes de ejecutar esta configuración. Este Compose es para desarrollo local.
