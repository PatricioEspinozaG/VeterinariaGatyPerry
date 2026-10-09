import { useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import { services } from '../data/services.js'
import { normalizeText, serviceImage } from '../utils/format.js'

function Services() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = [...new Set(services.map((service) => service.category))].sort()

  const filteredServices = services.filter((service) => {
    const details = `${service.name} ${service.code} ${service.species}`
    const matchesSearch = normalizeText(details).includes(normalizeText(search))
    const matchesCategory = !category || service.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <>
      <PageHero
        eyebrow="Catálogo oficial"
        title="Servicios veterinarios"
        description="Consulta precios, duración y especies atendidas antes de solicitar una hora."
      />

      <section className="services-section">
        <div className="container">
          <div className="service-filters">
            <div>
              <label htmlFor="buscarServicio">Buscar servicio</label>
              <input
                id="buscarServicio"
                type="search"
                placeholder="Ej. vacuna o consulta"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="categoriaServicio">Categoría</label>
              <select
                id="categoriaServicio"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p>
            {filteredServices.length}{' '}
            {filteredServices.length === 1 ? 'servicio' : 'servicios'}
          </p>

          {filteredServices.length === 0 ? (
            <p>No se encontraron servicios con esos filtros.</p>
          ) : (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.code}
                  name={service.name}
                  category={service.category}
                  species={service.species}
                  duration={service.duration}
                  price={service.price}
                  image={serviceImage(service.category)}
                  observation={service.observation}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Services