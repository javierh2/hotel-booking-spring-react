import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { addFavorite, removeFavorite } from '../../services/favoriteService'
import './RoomCard.css'

// isFavorite: bool que viene del padre (Home) — indica si esta room está en favoritos
// onFavoriteToggle: callback que notifica al padre cuando cambia el estado
// el padre mantiene el Set de favoriteIds — RoomCard no lo gestiona solo
const RoomCard = ({ room, isFavorite = false, onFavoriteToggle }) => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    // estado local para el optimistic update —
    // actualizamos la UI inmediatamente sin esperar la respuesta del backend
    // si el backend falla, revertimos al valor anterior
    const [favorited, setFavorited] = useState(isFavorite)
    const [loading, setLoading] = useState(false)

    const handleViewDetail = () => {
        navigate(`/rooms/${room.id}`)
    }

    const handleImageError = (event) => {
        event.target.style.display = "none"
        event.target.nextSibling.style.display = "flex"
    }

    const handleFavoriteClick = async (e) => {
        // stopPropagation: evita que el clic en el corazón navegue al detalle
        e.stopPropagation()

        // si no está logueado, redirigimos al login
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        // guardamos el valor anterior para poder revertir si falla
        const previous = favorited
        // optimistic update: actualizamos la UI antes de esperar al backend
        setFavorited(!favorited)
        setLoading(true)

        try {
            if (previous) {
                await removeFavorite(room.id)
            } else {
                await addFavorite(room.id)
            }
            // notificamos al padre para que actualice su Set de favoriteIds
            if (onFavoriteToggle) onFavoriteToggle(room.id, !previous)
        } catch {
            // si falla el backend, revertimos el estado local
            // el usuario ve que el corazón vuelve al estado anterior
            setFavorited(previous)
        } finally {
            setLoading(false)
        }
    }

    return (
        <article className="room-card" onClick={handleViewDetail}>
            <div className="room-card__image-wrapper">
                {room.images && room.images.length > 0 ? (
                    <>
                        <img
                            src={room.images[0]}
                            alt={room.name}
                            className="room-card__image"
                            onError={handleImageError}
                        />
                        <div className="room-card__image-placeholder" style={{ display: "none" }}>
                            🏨
                        </div>
                    </>
                ) : (
                    <div className="room-card__image-placeholder">🏨</div>
                )}

                {room.category && (
                    <span className="room-card__badge">{room.category.title}</span>
                )}

                {/* botón de favorito — visible siempre, pero redirige al login si no está autenticado
                    posicionado absolute sobre la imagen — top right para no tapar el badge */}
                <button
                    className={`room-card__favorite ${favorited ? 'room-card__favorite--active' : ''}`}
                    onClick={handleFavoriteClick}
                    disabled={loading}
                    aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                    {favorited ? '♥' : '♡'}
                </button>
            </div>

            <div className="room-card__content">
                <h3 className="room-card__name">{room.name}</h3>
                <p className="room-card__description">{room.description}</p>
                <div className="room-card__footer">
                    <div className="room-card__price">
                        <span className="room-card__price-amount">${room.price}</span>
                        <span className="room-card__price-label">por noche</span>
                    </div>
                    <button
                        className="room-card__btn"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetail()
                        }}
                    >
                        ver detalles
                    </button>
                </div>
            </div>
        </article>
    )
}

export default RoomCard