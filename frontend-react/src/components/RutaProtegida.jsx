// src/components/RutaProtegida.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function RutaProtegida({ currentUser, roles = [], children }) {
  // 1. Si no hay usuario en sesión, redirige a la página de ingreso
  if (!currentUser) {
    return <Navigate to="/ingresar" replace />;
  }

  // 2. Si la cuenta fue desactivada por un administrador
  if (currentUser.active === false) {
    return <Navigate to="/ingresar" replace />;
  }

  // 3. Si la ruta requiere roles específicos y el usuario no cuenta con ellos
  if (roles.length > 0 && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. Si cumple todas las condiciones, muestra el contenido de la ruta
  return children;
}