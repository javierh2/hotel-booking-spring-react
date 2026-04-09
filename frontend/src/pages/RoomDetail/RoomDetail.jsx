import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getRoomById } from "../../services/roomService"
import './RoomDetail.css'



const RoomDetail = () => {

    // Obtener el ID de la habitación desde la URL
    const { id } = useParams()

    const navigate = useNavigate()

    const [room, setRoom] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Al cargar el detalle, asegurarnos de que la página esté scrolleada al top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const data = await getRoomById(id)
                setRoom(data)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchRoom()
    }, [id])

    if (loading) {
        return (
            <div className="room-detail">
                <div className="room-detail__state">
                    <div className="room-detail__spinner" />
                    <p>Cargando habitación...</p>
                </div>
            </div>
        )
    }
    if (error) {
        return (
            <div className="room-detail">
                <div className="room-detail__state">
                    <span style={{ fontSize: '40px' }}>⚠️</span>
                    <p className="room-detail__error-text">
                        No encontramos la habitación que buscás.
                    </p>
                    <button
                        className="room-detail__back-btn"
                        onClick={() => navigate('/')}
                    >
                        ← Volver al inicio
                    </button>

                </div>
            </div>
        )
    }

    return (
        <div className="room-detail">

            {/* top bar: título, badge de categoría, botón volver */}
            <div className="room-detail__top-bar">
                <h1 className="room-detail__name">{room.name}</h1>
                {room.category && (
                    <span className="room-detail__category-badge">
                        {room.category.title}
                    </span>
                )}
                <button
                    className="room-detail__back-btn"
                    onClick={() => navigate('/')}
                >
                    ← return
                </button>
            </div>

            {/* galería partida: imagen principal izquierda + grilla 2x2 derecha */}
            <div className="room-detail__gallery">
                <div className="room-detail__gallery-main">
                    {room.imageRoom ? (
                        <img
                            src={room.imageRoom}
                            alt={room.name}
                            className="room-detail__gallery-img"
                        />
                    ) : (
                        <div className="room-detail__gallery-placeholder">🏨</div>
                    )}
                </div>
                <div className="room-detail__gallery-grid">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="room-detail__gallery-cell">
                            {room.imageRoom ? (
                                <img
                                    src={room.imageRoom}
                                    alt={`${room.name} ${i + 2}`}
                                    className="room-detail__gallery-img"
                                />
                            ) : (
                                <div className="room-detail__gallery-placeholder">🏨</div>
                            )}
                            {/* "Ver más" solo en la última celda */}
                            {i === 3 && (
                                <div className="room-detail__ver-mas">
                                    See more
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* contenido principal */}
            <div className="room-detail__content">
                <div className="room-detail__price-row">
                    <span className="room-detail__price">${room.price}</span>
                    <span className="room-detail__price-label">per night</span>
                </div>
                <div className="room-detail__divider" />
                <p className="room-detail__section-title">Description</p>
                <p className="room-detail__description">{room.description}</p>
                <div className="room-detail__divider" />
                {/* bloque de características */}
                {room.features && room.features.length > 0 && (
                    <div className="room-detail__features">
                        <h2 className="room-detail__features-title">
                            What does this place offer?
                        </h2>

                        <div className="room-detail__divider" />

                        {/* grilla de features */}
                        <div className="room-detail__features-grid">
                            {room.features.map(feature => (
                                <div key={feature.id} className="room-detail__feature-item">
                                    <span className="room-detail__feature-icon">
                                        {feature.icon || '✦'}
                                    </span>
                                    <span className="room-detail__feature-name">
                                        {feature.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="room-detail__divider" />
                {/* info cards: categoría, precio, disponibilidad */}
                <div className="room-detail__info-grid">
                    <div className="room-detail__info-card">
                        <span className="room-detail__info-icon">🏷️</span>
                        <p className="room-detail__info-label">Category</p>
                        <p className="room-detail__info-value">
                            {room.category?.title || 'Sin categoría'}
                        </p>
                    </div>
                    <div className="room-detail__info-card">
                        <span className="room-detail__info-icon">💰</span>
                        <p className="room-detail__info-label">Price per night</p>
                        <p className="room-detail__info-value">${room.price}</p>
                    </div>
                    <div className="room-detail__info-card">
                        <span className="room-detail__info-icon">✅</span>
                        <p className="room-detail__info-label">Availability</p>
                        <p className="room-detail__info-value">
                            {room.active ? "Available" : "Not available"}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RoomDetail