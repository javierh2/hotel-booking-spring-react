import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyBookings } from '../../services/bookingService'
import { useAuth } from '../../context/AuthContext'
import './MyBookings.css'

// página de historial de reservas del usuario autenticado
// ProtectedRoute en App.jsx garantiza que solo usuarios logueados llegan
// aun así se chequea isAuthenticated para manejar el edge case de token expirado
const MyBookings = () => {

    const { user } = useAuth()
    const navigate = useNavigate()

    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // fetch al montar, el historial se carga una sola vez al entrar a la página
        // no necesitamos polling ni websockets para un historial estático
        const fetchBookings = async () => {
            try {
                const data = await getMyBookings()
                setBookings(data)
            } catch (err) {
                setError(err + 'No se pudo cargar tu historial. Intentá de nuevo más tarde.')
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [])

    // formatea "2026-05-15" → "15/05/2026" para mostrarle al usuario
    // split+join es más liviano que instanciar un Date, se evita el offset de timezone
    // que ocurre cuando new Date("2026-05-15") interpreta la fecha como UTC medianoche
    const fmt = (iso) => {
        const [y, m, d] = iso.split('-')
        return `${d}/${m}/${y}`
    }

    // calcula las noches a partir de dos strings ISO sin instanciar Date con timezone
    // multiplicamos por 1 para convertir el string a número antes de restar
    const calcNights = (checkIn, checkOut) => {
        const msPerDay = 1000 * 60 * 60 * 24
        return Math.round(
            (new Date(checkOut) - new Date(checkIn)) / msPerDay
        )
    }

    // determina si una reserva es futura, activa o pasada
    // útil para el badge de estado en cada reserva
    const getStatus = (checkIn, checkOut) => {
        const today = new Date().toISOString().split('T')[0]
        if (checkOut <= today) return { label: 'Completada', mod: 'completed' }
        if (checkIn <= today) return { label: 'En curso', mod: 'active' }
        return { label: 'Próxima', mod: 'upcoming' }
    }

    if (loading) {
        return (
            <div className="my-bookings">
                <div className="my-bookings__loading">Cargando tu historial...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="my-bookings">
                <div className="my-bookings__error">{error}</div>
            </div>
        )
    }

    return (
        <div className="my-bookings">

            <div className="my-bookings__header">
                <h1 className="my-bookings__title">Mis reservas</h1>
                {/* subtítulo personalizado con el nombre del usuario */}
                <p className="my-bookings__subtitle">
                    Hola {user?.firstName}, acá encontrás todo tu historial de estadías.
                </p>
            </div>

            {bookings.length === 0 ? (
                // estado vacío, guiamos al usuario a la acción principal de la app: explorar productos
                <div className="my-bookings__empty">
                    <span className="my-bookings__empty-icon">🏨</span>
                    <p className="my-bookings__empty-text">Todavía no tenés reservas.</p>
                    <button
                        className="my-bookings__cta"
                        onClick={() => navigate('/')}
                    >
                        Explorar productos
                    </button>
                </div>
            ) : (
                <div className="my-bookings__list">
                    {bookings.map(booking => {
                        const nights = calcNights(booking.checkIn, booking.checkOut)
                        const status = getStatus(booking.checkIn, booking.checkOut)

                        return (
                            <div key={booking.id} className="my-bookings__card">

                                <div className="my-bookings__card-body">

                                    <span className={`my-bookings__badge my-bookings__badge--${status.mod}`}>
                                        {status.label}
                                    </span>
                                    {/* nombre del producto reservado */}
                                    <h2 className="my-bookings__room-name">{booking.roomName}</h2>

                                    {/* bloque de fechas — el usuario ve exactamente qué período reservó */}
                                    <div className="my-bookings__dates">
                                        <div className="my-bookings__date-block">
                                            <span className="my-bookings__date-label">Check-in</span>
                                            <span className="my-bookings__date-value">{fmt(booking.checkIn)}</span>
                                        </div>
                                        <div className="my-bookings__date-arrow">→</div>
                                        <div className="my-bookings__date-block">
                                            <span className="my-bookings__date-label">Check-out</span>
                                            <span className="my-bookings__date-value">{fmt(booking.checkOut)}</span>
                                        </div>
                                        <div className="my-bookings__nights">
                                            {nights} noche{nights !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                </div>

                                {/* botón para ir al detalle del producto — permite al usuario
                                    revisar el lugar de nuevo o compartirlo */}
                                <button
                                    className="my-bookings__view-btn"
                                    onClick={() => navigate(`/rooms/${booking.roomId}`)}
                                >
                                    Ver producto
                                </button>

                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}

export default MyBookings