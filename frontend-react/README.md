# React + Vite

## Conexión local de autenticación

El frontend se conecta por defecto a `http://localhost:8081` (auth-service).
Puedes cambiar esa dirección definiendo `VITE_AUTH_API_URL` en un archivo
`.env.local` de este directorio. Para que las cookies de sesión funcionen,
abre frontend y backend usando `localhost`; auth-service permite por defecto
el origen de Vite `http://localhost:5173`. Cambia `FRONTEND_ORIGIN` en
`backend/.env` si usas otro origen. Consulta `backend/POSTGRES_LOCAL.md` para
levantar los servicios locales.

La gestión de mascotas usa `pacientes-service` en `http://localhost:8082`.
Puedes cambiar esa dirección con `VITE_PACIENTES_API_URL` en `.env.local`.
La gestión de citas usa `citas-service` en `http://localhost:8083` y admite
la variable `VITE_CITAS_API_URL` en el mismo archivo.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
