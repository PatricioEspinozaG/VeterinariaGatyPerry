import consultasIcon from '../assets/services/consultas.svg'
import vacunacionIcon from '../assets/services/vacunacion.svg'
import examenesIcon from '../assets/services/examenes.svg'

export const stats = [
  { id: 1, value: '17', label: 'años de experiencia' },
  { id: 2, value: '31', label: 'servicios disponibles' },
  { id: 3, value: '3', label: 'médicos veterinarios' },
  { id: 4, value: '6 días', label: 'de atención semanal' },
]

export const featuredServices = [
  {
    code: 'SV001',
    category: 'Consultas',
    name: 'Consulta general',
    species: 'Perro / Gato',
    duration: '30 min',
    price: 15000,
    image: consultasIcon,
  },
  {
    code: 'VA001',
    category: 'Vacunación',
    name: 'Vacuna antirrábica canina',
    species: 'Perro',
    duration: '10 min',
    price: 12000,
    image: vacunacionIcon,
  },
  {
    code: 'EX001',
    category: 'Exámenes',
    name: 'Hemograma completo',
    species: 'Perro / Gato',
    duration: '30 min',
    price: 22000,
    image: examenesIcon,
  },
]
