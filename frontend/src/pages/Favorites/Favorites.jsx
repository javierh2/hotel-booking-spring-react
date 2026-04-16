import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getFavoriteRooms} from '../../services/favoriteService'
import RoomCard from '../../components/RoomCard/RoomCard'
import './Favorites.css'

const Favorites = () => {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // si el usuario no está logueado, redirigimos al login
    // esta página no tiene sentido sin autenticación
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        if (!isAuthenticated) return
        const fetch = async () => {
            setLoading(true)
            try {
                const data = await getFavoriteRooms()
                setFavorites(data)
            } catch {
                setError('No se pudieron cargar tus favoritos.')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [isAuthenticated])

    // cuando el usuario desmarca un favorito desde esta página,
    // lo eliminamos directamente del estado local
    // criterio de aceptación: gestión de favoritos desde esta sección
    const handleFavoriteToggle = (roomId, isFavorited) => {
        if (!isFavorited) {
            setFavorites(prev => prev.filter(r => r.id !== roomId))
        }
    }

    return (
        <div className="favorites">
            <div className="favorites__content">

                <div className="favorites__header">
                    <div className="favorites__header-top">
                        {/* botón volver — mismo patrón que RoomDetail y Admin */}
                        <button
                            className="favorites__back-btn"
                            onClick={() => navigate('/')}
                        >
                            ← Volver al inicio
                        </button>
                    </div>
                    <h1 className="favorites__title">Mis favoritos</h1>
                    <p className="favorites__subtitle">
                        Las habitaciones que guardaste para volver a ver
                    </p>
                </div>

                {loading ? (
                    <div className="favorites__state">
                        <div className="favorites__spinner" />
                        <p>Cargando favoritos...</p>
                    </div>
                ) : error ? (
                    <div className="favorites__state">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>
                            Reintentar
                        </button>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="favorites__state favorites__state--empty">
                        <span className="favorites__empty-icon">♡</span>
                        <p className="favorites__empty-text">
                            Todavía no tenés favoritos guardados.
                        </p>
                        <button
                            className="favorites__go-home"
                            onClick={() => navigate('/')}
                        >
                            Explorar habitaciones
                        </button>
                    </div>
                ) : (
                    <div className="favorites__grid">
                        {favorites.map(room => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                isFavorite={true}
                                onFavoriteToggle={handleFavoriteToggle}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Favorites