import { useState } from 'react'

function correoPermitido(email) {
    return /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(
        email.trim(),
    )
}

function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })

    const [isSubmitted, setIsSubmitted] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [formError, setFormError] = useState('')

    function handleChange(event) {
        const { name, value } = event.target

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }))

        setIsSubmitted(false)
        setFormError('')
        if (name === 'email') setEmailError('')
    }

    function handleSubmit(event) {
        event.preventDefault()

        const name = formData.name.trim()
        const subject = formData.subject.trim()
        const message = formData.message.trim()

        if (name.length < 3 || subject.length < 5 || message.length < 10) {
            setFormError(
                'Revisa nombre, asunto y mensaje: no pueden estar vacíos ni contener solo espacios.',
            )
            return
        }

        if (!correoPermitido(formData.email)) {
            setEmailError('Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.')
            return
        }

        setIsSubmitted(true)

        setFormData({
            name: '',
            email: '',
            subject: '',
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
                        Completa el formulario para revisar tu consulta. El envío estará
                        disponible cuando conectemos el sistema.
                    </p>

                    <ul className="contact-details">
                        <li><strong>Teléfono:</strong> +56 72 221 3456</li>
                        <li><strong>Dirección:</strong> Av. República 1240, Rancagua</li>
                        <li><strong>Horario:</strong> lunes a sábado, 09:00 a 19:00</li>
                        <li><strong>Correo:</strong> contacto@gatyperry.cl</li>
                    </ul>

                    <div className="contact-map">
                        <h3>Dónde encontrarnos</h3>
                        <div className="map-frame">
                            <iframe
                                src="https://www.google.com/maps?q=Av.+Rep%C3%BAblica+1240,+Rancagua,+Chile&output=embed"
                                title="Mapa de la veterinaria en Av. República 1240, Rancagua"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="contact-name">Nombre</label>
                        <input
                            id="contact-name"
                            name="name"
                            type="text"
                            minLength={3}
                            maxLength={100}
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
                        {emailError && (
                            <small className="form-help" role="alert">
                                {emailError}
                            </small>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="contact-subject">Asunto</label>
                        <input
                            id="contact-subject"
                            name="subject"
                            type="text"
                            minLength={5}
                            maxLength={100}
                            required
                            value={formData.subject}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="contact-message">Mensaje</label>
                        <textarea
                            id="contact-message"
                            name="message"
                            rows={6}
                            minLength={10}
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
                    {formError && (
                        <p className="form-help" role="alert">
                            {formError}
                        </p>
                    )}
                    <button className="button button-primary" type="submit">
                        Validar mensaje
                    </button>
                    {isSubmitted && (
                        <p className="form-success" role="status">
                            Los datos son válidos. Por ahora, este formulario no envía mensajes.
                        </p>
                    )}
                </form>
            </div>
        </section>
    )
}

export default ContactForm