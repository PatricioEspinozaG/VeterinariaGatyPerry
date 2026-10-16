import antibiotics from '../assets/productos/antibioticos.svg'
import parasites from '../assets/productos/antiparasitarios.svg'
import inflammation from '../assets/productos/antiinflamatorios.svg'
import skin from '../assets/productos/dermatologia.svg'
import digestive from '../assets/productos/digestivo.svg'
import heart from '../assets/productos/cardiaco.svg'
import pain from '../assets/productos/analgesicos.svg'
import vaccines from '../assets/productos/vacunas.svg'
import supplements from '../assets/productos/suplementos.svg'
import consultations from '../assets/servicios/consultas.svg'
import vaccination from '../assets/servicios/vacunacion.svg'
import surgery from '../assets/servicios/cirugia.svg'
import deworming from '../assets/servicios/desparasitacion.svg'
import exams from '../assets/servicios/examenes.svg'
import other from '../assets/servicios/otros.svg'

export function money(value) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)
}

export function normalizeText(value) {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

const productImages = { antibioticos: antibiotics, antiparasitarios: parasites, antiinflamatorios: inflammation, dermatologia: skin, digestivo: digestive, cardiaco: heart, analgesicos: pain, vacunas: vaccines, suplementos: supplements }
const productPhotos = import.meta.glob('../assets/productos/ME*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
})
const servicePhotos = import.meta.glob('../assets/services/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
})
const serviceImages = { consultas: consultations, vacunacion: vaccination, cirugia: surgery, desparasitacion: deworming, examenes: exams, otros: other }

export function productImage(code, category) {
  return productPhotos[`../assets/productos/${code}.jpg`] ?? productImages[normalizeText(category)] ?? antibiotics
}

export function serviceImage(category) {
  const normalizedCategory = normalizeText(category)
  return servicePhotos[`../assets/services/${normalizedCategory}.jpg`] ?? serviceImages[normalizedCategory] ?? other
}