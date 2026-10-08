// src/utils/userValidation.js

// Normalizar y validar RUN
export function normalizeRun(run) {
  if (!run) return ""
  return run.replace(/[^0-9kK]/g, "").toUpperCase()
}

export function isValidRun(run) {
  const clean = normalizeRun(run)
  if (clean.length < 8 || clean.length > 9) return false

  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)

  let sum = 0
  let multiplier = 2

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const expectedDvInt = 11 - (sum % 11)
  let expectedDv = ""

  if (expectedDvInt === 11) expectedDv = "0"
  else if (expectedDvInt === 10) expectedDv = "K"
  else expectedDv = expectedDvInt.toString()

  return dv === expectedDv
}

export function validateRun(run) {
  if (!run?.trim()) return "El RUN es obligatorio."
  if (!isValidRun(run)) return "El RUN ingresado no es válido."
  return ""
}

// Validación de Email
export function validateEmail(email) {
  if (!email?.trim()) return "El correo es obligatorio."
  const emailLower = email.trim().toLowerCase()
  const validDomains = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"]
  const isValidDomain = validDomains.some((domain) => emailLower.endsWith(domain))
  if (!isValidDomain) {
    return "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com."
  }
  return ""
}

// Validación de Contraseña
export function validatePassword(password) {
  if (!password) return "La contraseña es obligatoria."
  if (password.length < 8) return "Debe tener al menos 8 caracteres."
  return ""
}

// Validaciones simples para campos de texto
export function validateName(name) {
  if (!name?.trim()) return "El nombre es obligatorio."
  return ""
}

export function validateLastName(lastName) {
  if (!lastName?.trim()) return "Los apellidos son obligatorios."
  return ""
}

// Validación de Teléfono
export function validatePhone(phone) {
  if (!phone?.trim()) return "El teléfono de contacto es obligatorio."
  return ""
}

// Validación global de usuario
export function validateUser(formData, existingUsers = []) {
  const errors = {}

  const runErr = validateRun(formData.run)
  if (runErr) errors.run = runErr

  const emailErr = validateEmail(formData.email)
  if (emailErr) errors.email = emailErr

  const passErr = validatePassword(formData.password)
  if (passErr) errors.password = passErr

  const phoneErr = validatePhone(formData.telefono)
  if (phoneErr) errors.telefono = phoneErr

  const nameErr = validateName(formData.nombre)
  if (nameErr) errors.nombre = nameErr

  const lastNameErr = validateLastName(formData.apellidos)
  if (lastNameErr) errors.apellidos = lastNameErr

  if (!formData.region) errors.region = "Selecciona una región."
  if (!formData.comuna) errors.comuna = "Selecciona una comuna."

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden."
  }

  // Verificar si ya existe el usuario por correo o RUN
  if (!errors.email && !errors.run) {
    const cleanRun = normalizeRun(formData.run)
    const exists = existingUsers.some(
      (u) =>
        u.email?.toLowerCase() === formData.email.trim().toLowerCase() ||
        normalizeRun(u.run) === cleanRun
    )
    if (exists) {
      errors.general = "Ya existe una cuenta registrada con este correo o RUN."
    }
  }

  return errors
}