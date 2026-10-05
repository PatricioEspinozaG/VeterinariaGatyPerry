// Validación de RUN Chileno con dígito verificador (Módulo 11)
export const validateRun = (run) => {
  if (!run) return "El RUN es obligatorio.";
  
  const cleanRun = run.replace(/[^0-9kK]/g, "");
  if (cleanRun.length < 8 || cleanRun.length > 9) {
    return "Ingresa un RUN chileno válido.";
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
    return "Ingresa un RUN chileno válido.";
  }

  return "";
};

// Validación de Correo con Dominios Permitidos (@duoc.cl, @profesor.duoc.cl, @gmail.com)
export const validateEmail = (email) => {
  if (!email) return "El correo es obligatorio.";
  
  const allowedDomains = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
  const isValidDomain = allowedDomains.some((domain) =>
    email.toLowerCase().endsWith(domain)
  );

  if (!isValidDomain) {
    return "Usa @duoc.cl, @profesor.duoc.cl o @gmail.com.";
  }

  return "";
};

// Validación de Contraseña (entre 4 y 10 caracteres)
export const validatePassword = (password) => {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < 4 || password.length > 10) {
    return "Debe tener entre 4 y 10 caracteres.";
  }
  return "";
};