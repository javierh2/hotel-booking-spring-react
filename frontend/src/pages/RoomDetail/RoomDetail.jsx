import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getRoomById } from "../../services/roomService"
import './RoomDetail.css'
import { getOccupiedDates } from "../../services/bookingService"
import RatingSection from "../../components/RatingSection/RatingSection"
import ShareModal from "../../components/ShareModal/ShareModal"
import BookingForm from "../../components/BookingForm/BookingForm"


// datos de políticas fijos y globales para todas las habitaciones
// no necesitan una DB porque no varían por producto
const POLICIES = [
    {
        id: "checkin",
        title: "Check-in",
        icon: "🗝️",
        items: [
            "Check-out hasta las 11:00 hs",
            "Check-in a partir de las 15:00 hs",
            "Check-in anticipado sujeto a disponibilidad",
            "Se requiere presentar documento de identidad",
        ]
    },
    {
        id: "health",
        title: "Salud y seguridad",
        icon: "🛡️",
        items: [
            "Política de no fumadores en todas las instalaciones",
            "Detector de humo en todas las habitaciones",
            "Botiquín de primeros auxilios disponible en recepción",
            "Protocolo de limpieza certificado",
        ]
    },
    {
        id: "cancellation",
        title: "Política de cancelación",
        icon: "📋",
        items: [
            "Cancelación gratuita hasta 48 hs antes del check-in",
            "Cancelación con menos de 48 hs: cargo del 50%",
            "No-show: cargo del 100% de la primera noche",
            "Reembolsos procesados en 5 a 10 días hábiles",
        ]
    }
]

const RoomDetail = () => {

    // obtiene el ID de la habitación desde la URL
    const { id } = useParams()

    const navigate = useNavigate()

    const [room, setRoom] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // estado de disponibilidad, separado del estado del room
    // si falla la disponibilidad, el room igual se muestra
    const [occupiedRanges, setOccupiedRanges] = useState([])
    const [availabilityLoading, setAvailabilityLoading] = useState(true)
    const [availabilityError, setAvailabilityError] = useState(null)

    // estado del modal de compartir — controla si está abierto o cerrado
    // el modal recibe el objeto room completo para armar la preview y las URLs
    const [shareOpen, setShareOpen] = useState(false)

    // al confirmar una reserva recargamos las fechas ocupadas
    // para que el calendario refleje la nueva reserva inmediatamente
    const handleBookingCreated = () => {
        getOccupiedDates(id)
            .then(data => setOccupiedRanges(data))
            .catch(() => { })
    }


    // Al cargar el detalle la pagina se scrollea al top
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


    // carga las fechas ocupadas en paralelo con la room
    // useEffect separado porque son dos requests independientes
    // si uno falla no bloquea al otro
    // depende de id igual que el fetchRoom
    useEffect(() => {
        const fetchAvailability = async () => {
            setAvailabilityLoading(true)
            setAvailabilityError(null)
            try {
                const data = await getOccupiedDates(id)
                setOccupiedRanges(data)
            } catch (err) {
                setAvailabilityError("No se puede obtener la información de disponibilidad en este momento: " + err)
            } finally {
                setAvailabilityLoading(false)
            }
        }
        fetchAvailability()
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
                        onClick={() => navigate("/")}
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
            {/* top bar: título, badge de categoría, botón compartir y botón volver */}
            <div className="room-detail__top-bar">
                <h1 className="room-detail__name">{room.name}</h1>
                {room.category && (
                    <span className="room-detail__category-badge">
                        {room.category.title}
                    </span>
                )}

                {/* botón compartir, abre el ShareModal.jsx */}
                <button
                    className="room-detail__share-btn"
                    onClick={() => setShareOpen(true)}
                    aria-label="Compartir este producto"
                >
                    ↗ Compartir
                </button>

                <button
                    className="room-detail__back-btn"
                    onClick={() => navigate("/")}
                >
                    ← Volver
                </button>
            </div>

            {/* galería partida: imagen principal izquierda + grilla 2x2 derecha */}
            <div className="room-detail__gallery">
                <div className="room-detail__gallery-main">
                    {room.images && room.images[0] ? (
                        <img
                            src={room.images[0]}
                            alt={room.name}
                            className="room-detail__gallery-img"
                        />
                    ) : (
                        <div className="room-detail__gallery-placeholder">🏨</div>
                    )}
                </div>
                <div className="room-detail__gallery-grid">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="room-detail__gallery-cell">
                            {room.images && room.images[i + 1] ? (
                                <img
                                    src={room.images[i + 1]}
                                    alt={`${room.name} ${i + 2}`}
                                    className="room-detail__gallery-img"
                                />
                            ) : (
                                <div className="room-detail__gallery-placeholder">🏨</div>
                            )}

                            {/* "Ver más" solo en la última celda */}
                            {i === 3 && (
                                <div className="room-detail__ver-mas">
                                    Ver más
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
                    <span className="room-detail__price-label">USD por noche</span>
                </div>
                <div className="room-detail__divider" />
                <p className="room-detail__section-title">Descripción</p>
                <p className="room-detail__description">{room.description}</p>

                <div className="room-detail__divider" />

                {/* bloque de características */}
                {room.features && room.features.length > 0 && (
                    <div className="room-detail__features">
                        <h2 className="room-detail__features-title">
                            ¿Qué ofrece este lugar?
                        </h2>



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

                {/*  bloque de políticas */}
                <div className="room-detail__policies">
                    <h2 className="room-detail__policies-title">
                        Qué tenés que saber
                    </h2>

                    <div className="room-detail__policies-grid">
                        {POLICIES.map(policy => (
                            <div key={policy.id} className="room-detail__policy-col">
                                <h3 className="room-detail__policy-col-title">
                                    <span className="room-detail__policy-col-icon">{policy.icon}</span>
                                    {policy.title}
                                </h3>
                                <ul className="room-detail__policy-list">
                                    {policy.items.map((item, index) => (
                                        <li key={index} className="room-detail__policy-item">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="room-detail__divider" />

                {/* HU #23 — calendario unificado de disponibilidad y reserva
    BookingForm ahora muestra tanto los días ocupados (visual)
    como permite seleccionar fechas y confirmar la reserva (interactivo)
    recibe occupiedRanges del mismo fetch — sin request extra */}
                <div className="room-detail__availability">
                    {availabilityLoading ? (
                        <div className="room-detail__state room-detail__state--inline">
                            <div className="room-detail__spinner" />
                            <p>Cargando disponibilidad...</p>
                        </div>
                    ) : availabilityError ? (
                        <div className="room-detail__availability-error">
                            <span>⚠️</span>
                            <p>{availabilityError}</p>
                            <button
                                className="room-detail__availability-retry"
                                onClick={() => {
                                    setAvailabilityError(null)
                                    setAvailabilityLoading(true)
                                    getOccupiedDates(id)
                                        .then(data => setOccupiedRanges(data))
                                        .catch(() => setAvailabilityError("No se puede obtener la información de disponibilidad en este momento."))
                                        .finally(() => setAvailabilityLoading(false))
                                }}
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : (
                        <BookingForm
                            room={room}
                            occupiedRanges={occupiedRanges}
                            onBookingCreated={handleBookingCreated}
                        />
                    )}
                </div>

                <div className="room-detail__divider" />



                {/* sección de valoraciones;
                averageRating y totalRatings vienen del objeto room — calculados en el backend
                no hace un request extra porque ya están en el RoomResponseDTO */}
                <RatingSection
                    roomId={room.id}
                    averageRating={room.averageRating || 0}
                    totalRatings={room.totalRatings || 0}
                />

                <div className="room-detail__divider" />

                {/* info cards: categoría, precio, disponibilidad */}
                <div className="room-detail__info-grid">
                    <div className="room-detail__info-card">
                        <span className="room-detail__info-icon">🏷️</span>
                        <p className="room-detail__info-label">Categoría</p>
                        <p className="room-detail__info-value">
                            {room.category?.title || "Sin categoría"}
                        </p>
                    </div>
                    <div className="room-detail__info-card">
                        <span className="room-detail__info-icon">💰</span>
                        <p className="room-detail__info-label">Precio por noche</p>
                        <p className="room-detail__info-value">${room.price}</p>
                    </div>
                    <div className="room-detail__info-card">
                        <span className="room-detail__info-icon">✅</span>
                        <p className="room-detail__info-label">Disponibilidad</p>
                        <p className="room-detail__info-value">
                            {room.active ? "Disponible" : "No Disponible"}
                        </p>
                    </div>
                </div>
            </div>

            {/* modal de compartir, recibe el objeto room completo para la preview
            onClose limpia el estado local del modal (mensaje personalizado) al cerrar */}
            <ShareModal
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                room={room}
            />

        </div>
    )
}

export default RoomDetail