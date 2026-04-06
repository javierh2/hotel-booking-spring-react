import { useNavigate } from 'react-router-dom'
import './Header.css'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useRef, useState } from 'react'

const Header = () => {

    const navigate = useNavigate()

    // obtenemos el estado de autenticación y la función de logout del contexto de autenticación
    const { user, isAuthenticated, isAdmin, logout } = useAuth()

    // estado para controlar si el dropdown de usuario está abierto o cerrado
    const [dropdownOpen, setDropdownOpen] = useState(false)
    // referencia al elemento del dropdown para poder detectar clicks fuera de él y cerrarlo
    const dropdownRef = useRef(null)


    // función para manejar el click en el logo, navega a la página principal ("/")
    const handleLogoClick = () => {
        navigate('/')
    }

    // cierra el dropdown si el usuario hace click fuera de él
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // función para manejar el logout del usuario, cierra sesión, cierra el dropdown y navega a la página principal
    const handleLogout = () => {
        logout()
        setDropdownOpen(false)
        navigate('/')
    }

    // función para obtener las iniciales del usuario
    const getInitials = () => {
        if (!user) return ''
        const first = user.firstName?.charAt(0).toUpperCase() || ''
        const last = user.lastName?.charAt(0).toUpperCase() || ''
        return `${first}${last}`
    }

    return (
        <header className="header">
            <div className="header__content">

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

                <div className="header__actions">

                    {/* usuario NO autenticado — muestra Sign up y Log in */}
                    {!isAuthenticated && (
                        <>
                            <button
                                className="btn btn--outline"
                                onClick={() => navigate('/register')}
                            >
                                Sign up
                            </button>
                            <button
                                className="btn btn--primary"
                                onClick={() => navigate('/login')}
                            >
                                Log in
                            </button>
                        </>
                    )}

                    {/* usuario autenticado — muestra avatar con iniciales y dropdown */}
                    {isAuthenticated && (
                        <div className="header__user" ref={dropdownRef}>

                            {/* saludo con el nombre del usuario */}
                            <span className="header__user-greeting">
                                Hello!  {user.firstName}
                            </span>

                            {/* avatar con iniciales — click abre el dropdown */}
                            <button
                                className="header__avatar"
                                onClick={() => setDropdownOpen(prev => !prev)}
                                aria-label="Menú de usuario"
                            >
                                {getInitials()}
                            </button>

                            {/* dropdown — visible solo cuando dropdownOpen es true */}
                            {dropdownOpen && (
                                <div className="header__dropdown">

                                    <div className="header__dropdown-info">
                                        <span className="header__dropdown-name">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        <span className="header__dropdown-email">
                                            {user.email}
                                        </span>
                                    </div>

                                    <div className="header__dropdown-divider" />

                                    {/* solo el admin ve el link al panel */}
                                    {isAdmin && (
                                        <button
                                            className="header__dropdown-item"
                                            onClick={() => {
                                                navigate('/admin')
                                                setDropdownOpen(false)
                                            }}
                                        >
                                            Admin Panel
                                        </button>
                                    )}

                                    {/* cerrar sesión debajo del avatar */}
                                    <button
                                        className="header__dropdown-item header__dropdown-item--logout"
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </button>

                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </header>
    )
}

export default Header