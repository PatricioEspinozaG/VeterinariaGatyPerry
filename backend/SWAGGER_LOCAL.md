# Swagger UI en local

Los seis servicios exponen Swagger UI y el documento OpenAPI en sus propios puertos:

| Servicio | Swagger UI | JSON OpenAPI |
| --- | --- | --- |
| Auth | http://localhost:8081/swagger-ui.html | http://localhost:8081/v3/api-docs |
| Pacientes | http://localhost:8082/swagger-ui.html | http://localhost:8082/v3/api-docs |
| Citas | http://localhost:8083/swagger-ui.html | http://localhost:8083/v3/api-docs |
| Productos | http://localhost:8084/swagger-ui.html | http://localhost:8084/v3/api-docs |
| Pedidos | http://localhost:8085/swagger-ui.html | http://localhost:8085/v3/api-docs |
| Clínica | http://localhost:8086/swagger-ui.html | http://localhost:8086/v3/api-docs |

Arranca los servicios con `docker compose --env-file backend/.env -f backend/compose.yaml up -d --build` desde la raíz del repositorio.

Para probar rutas protegidas, inicia sesión en Auth con `POST /api/v1/auth/login`, copia solo `accessToken` de la respuesta y pulsa **Authorize** en el Swagger UI del servicio correspondiente. Pega el token JWT sin el prefijo `Bearer `. El botón no cambia los permisos reales del servicio: cada endpoint mantiene sus reglas de roles y propietario.

La documentación OpenAPI y la interfaz Swagger se permiten sin sesión para poder cargar el navegador. En un despliegue público, restringe la documentación o desactívala con `SPRINGDOC_API_DOCS_ENABLED=false` y `SPRINGDOC_SWAGGER_UI_ENABLED=false` en cada servicio.

La definición OpenAPI muestra JWT globalmente para facilitar **Authorize**. Las rutas públicas (registro, login y catálogo) siguen siendo públicas según sus reglas de Spring Security, aunque Swagger muestre el candado.
