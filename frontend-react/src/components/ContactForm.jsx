import { useState } from 'react'

function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    })

    const [isSubmitted, setIsSubmitted] = useState(false)

    function handleChange(event) {
        const { name, value } = event.target

        setFormData((currentData) => ({
        ...currentData,
        [name]: value,
        }))

        setIsSubmitted(false)
    }

    function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitted(true)

    setFormData({
        name: '',
        email: '',
        message: '',
    })
    }

    return (
        <section
        className="contact-section"
        aria-labelledby="contact-form-title"
        >
        <div className="container contact-layout">
            <div className="contact-information">
            <span className="eyebrow">Hablemos</span>
            <h2 id="contact-form-title">Envíanos un mensaje</h2>
            <p>
                Completa el formulario y responderemos tu consulta durante nuestro
                horario de atención.
            </p>

            <ul className="contact-details">
                <li>
                <strong>Teléfono:</strong> +56 72 221 3456
                </li>
                <li>
                <strong>Dirección:</strong> Av. República 1240, Rancagua
                </li>
                <li>
                <strong>Horario:</strong> lunes a sábado, 09:00 a 19:00
                </li>
            </ul>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-field">
                <label htmlFor="contact-name">Nombre</label>
                <input
                id="contact-name"
                name="name"
                type="text"
                maxLength={50}
                required
                value={formData.name}
                onChange={handleChange}
                />
            </div>

            <div className="form-field">
                <label htmlFor="contact-email">
                Correo electrónico
                </label>
                <input
                id="contact-email"
                name="email"
                type="email"
                maxLength={100}
                required
                value={formData.email}
                onChange={handleChange}
                />
            </div>

            <div className="form-field">
                <label htmlFor="contact-message">Mensaje</label>
                <textarea
                id="contact-message"
                name="message"
                rows={6}
                maxLength={500}
                required
                value={formData.message}
                onChange={handleChange}
                aria-describedby="contact-message-count"
                />

                <small id="contact-message-count" className="form-help">
                {formData.message.length}/500 caracteres
                </small>
            </div>

            <button className="button button-primary" type="submit">
                Enviar mensaje
            </button>
            {isSubmitted && (
            <p className="form-success" role="status">
                Tu mensaje fue enviado correctamente.
            </p>
            )}            
            </form>
        </div>
        </section>
    )
}

export default ContactForm