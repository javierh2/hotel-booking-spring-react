import { useNavigate } from 'react-router-dom'
import './Header.css'

const Header = () => {

    // useNavigate es un hook de react-router-dom que permite navegar programáticamente a otras rutas
    const navigate = useNavigate()

    // función para manejar el click en el logo, navega a la página principal ("/")
    const handleLogoClick = () => {
        navigate('/')
    }

    return (

        <header className="header">
            <div className="header__content">

                {/* logo y lema desde el css */}
                <div
                    className="header__brand"
                    onClick={handleLogoClick}
                    role="button"
                    aria-label="Ir a la página principal"
                >

                    <div className="header__logo-icon">
                        <span>DB</span>
                    </div>


                    <div className="header__brand-text">
                        <span className="header__brand-name">Digital Booking</span>
                        <span className="header__tagline">Found your place and enjoy the travel</span>
                    </div>
                </div>

                {/* botones sin funciones */}

                <div className="header__actions">
                    <button
                        className="btn btn--outline"
                        onClick={() => { /* TODO: implement sign up */ }}
                    >
                        Sign up
                    </button>

                    <button
                        className="btn btn--primary"
                        onClick={() => { /* TODO: implement log in */ }}
                    >
                        Log in
                    </button>
                </div>

            </div>
        </header>
    )
}

export default Header