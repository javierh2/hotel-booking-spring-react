import { useState } from 'react'
import './WspButton.css'

// número de WhatsApp de soporte de Digital Booking
// en producción esto vendría de una variable de entorno (import.meta.env.VITE_WA_NUMBER)
// por ahora es una constante para que sea fácil de cambiar en un solo lugar
const WA_NUMBER = '543517863766'

// mensaje predeterminado que se pre-carga en WhatsApp al abrir el chat
// encodeURIComponent lo convierte a formato URL-safe ("+" en lugar de espacios, etc.)
const WA_DEFAULT_MESSAGE = encodeURIComponent(
    '¡Hola! Tengo una consulta sobre un producto en Digital Booking.'
)

// componente flotante de WhatsApp
// se monta una sola vez en App.jsx, fuera del <main>, para que flote sobre cualquier página
const WhatsAppButton = () => {

    // showTooltip controla el mensaje de confirmación visual
    const [showTooltip, setShowTooltip] = useState(false)

    // showError controla el mensaje de error cuando el número no es válido
    // o cuando el entorno no soporta abrir URLs externas
    const [showError, setShowError] = useState(false)

    const handleClick = () => {
        // validación básica del número — debe tener entre 10 y 15 dígitos
        if (!WA_NUMBER || WA_NUMBER.replace(/\D/g, '').length < 10) {
            setShowError(true)
            setTimeout(() => setShowError(false), 3000)
            return
        }

        try {
            // wa.me es la URL oficial de WhatsApp para abrir chats directos
            // funciona en móvil (abre la app) y en desktop (abre WhatsApp Web)
            // target="_blank" + rel="noopener noreferrer" es seguridad estándar:
            // noopener evita que la nueva pestaña pueda acceder a window.opener
            // noreferrer oculta el referrer header
            const url = `https://wa.me/${WA_NUMBER}?text=${WA_DEFAULT_MESSAGE}`
            window.open(url, '_blank', 'noopener,noreferrer')

            // mostramos el tooltip de éxito por 3 segundos y lo ocultamos solo
            setShowTooltip(true)
            setTimeout(() => setShowTooltip(false), 3000)

        } catch (err) {
            // si window.open falla (bloqueado por el browser, sin conexión, etc.)
            // mostramos el mensaje de error en lugar del tooltip de éxito
            setShowError(true)
            setTimeout(() => setShowError(false), 3000)
        }
    }

    return (
        // el botón vive en position: fixed — independiente del scroll y del layout
        <div className="wa-button__wrapper">

            {/* tooltip de éxito — aparece encima del botón al hacer click */}
            {showTooltip && (
                <div className="wa-button__tooltip wa-button__tooltip--success">
                    ¡Chat abierto! 💬
                </div>
            )}

            {/* mensaje de error — mismo espacio visual que el tooltip */}
            {showError && (
                <div className="wa-button__tooltip wa-button__tooltip--error">
                    No se pudo abrir WhatsApp. Revisá tu conexión.
                </div>
            )}

            <button
                className="wa-button"
                onClick={handleClick}
                aria-label="Contactar por WhatsApp"
                // title accesible para lectores de pantalla y hover en desktop
                title="Contactar por WhatsApp"
            >
                {/* SVG oficial del logo de WhatsApp */}
                <svg
                    className="wa-button__icon"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </button>

        </div>
    )
}

export default WhatsAppButton