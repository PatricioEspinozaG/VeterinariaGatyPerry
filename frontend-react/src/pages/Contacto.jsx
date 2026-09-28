import ContactForm from '../components/ContactForm.jsx'
import PageHero from '../components/PageHero.jsx'

function Contacto() {
  return (
    <>
      <PageHero
        eyebrow="Estamos para ayudarte"
        title="Contacto"
        description="Escríbenos para resolver dudas generales. Para una urgencia veterinaria, comunícate directamente por teléfono."
      />

      <ContactForm />
    </>
  )
}

export default Contacto