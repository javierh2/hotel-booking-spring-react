import './Footer.css'

// Iconos SVG para redes sociales, no se usan librerías externas para mantener el proyecto ligero y sin dependencias innecesarias.
const IconFacebook = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
)

const IconLinkedin = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
    </svg>
)

const IconTwitter = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
)

const IconInstagram = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
)

// Integro los iconos SVG al componente Foooter
const Footer = () => {
    // Obtengo el año actual dinámicamente para mantener el pie de página actualizado sin necesidad de cambios manuales cada año.
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer__content">

                <div className="footer__brand">
                    <div className="footer__logo-icon">
                        <span>DB</span>
                    </div>
                    <div className="footer__brand-info">
                        <span className="footer__brand-name">Digital Booking</span>
                        <span className="footer__copyright">
                            © {currentYear} Digital Booking. Todos los derechos reservados.
                        </span>
                    </div>
                </div>

                <div className="footer__social">
                    <a href="https://facebook.com" className="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Visitar Facebook">
                        <IconFacebook />
                    </a>
                    <a href="https://linkedin.com" className="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Visitar LinkedIn">
                        <IconLinkedin />
                    </a>
                    <a href="https://twitter.com" className="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Visitar Twitter">
                        <IconTwitter />
                    </a>
                    <a href="https://instagram.com" className="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Visitar Instagram">
                        <IconInstagram />
                    </a>
                </div>

            </div>
        </footer>
    )
}

export default Footer
