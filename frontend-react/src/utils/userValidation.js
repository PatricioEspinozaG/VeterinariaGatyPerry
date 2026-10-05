// Validación de RUN Chileno con dígito verificador (Módulo 11)
export const validateRun = (run) => {
  if (!run) return "El RUN es obligatorio";
  
  const cleanRun = run.replace(/[^0-9kK]/g, "");
  if (cleanRun.length < 8 || cleanRun.length > 9) {
    return "El RUN ingresado no es válido";
  }

  const body = cleanRun.slice(0, -1);
  const dv = cleanRun.slice(-1).toUpperCase();

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDv = 11 - (sum % 11);
  const calculatedDv = expectedDv === 11 ? "0" : expectedDv === 10 ? "K" : expectedDv.toString();

  if (dv !== calculatedDv) {
    return "El RUN no es válido (dígito verificador incorrecto)";
  }

  return "";
};

// Validación de Formato de Correo Electrónico
export const validateEmail = (email) => {
  if (!email) return "El correo electrónico es obligatorio";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Formato de correo electrónico inválido";
  }
  return "";
};

// Validación de Contraseña (mínimo 6 caracteres)
export const validatePassword = (password) => {
  if (!password) return "La contraseña es obligatoria";
  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }
  return "";
};