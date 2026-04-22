import { useLocation, useNavigate } from 'react-router-dom'
import './BookingConfirmation.css'

// página de confirmación de reserva exitosa — HU #32
// recibe todos los datos via navigate state — no hace ningún fetch
// si el usuario llega acá sin state (URL directa o refresh) lo mandamos al home
// porque no tenemos datos para mostrar y no queremos una página rota
const BookingConfirmation = () => {

    const { state } = useLocation()
    const navigate = useNavigate()

    // guard: si no hay state, el usuario llegó por URL directa o hizo refresh
    // en ese caso no tenemos datos — mandamos al home limpiamente
    if (!state) {
        navigate('/', { replace: true })
        return null
    }

    const {
        roomId,
        roomName,
        roomImage,
        checkIn,
        checkOut,
        nights,
        total,
        userFirstName,
        userLastName,
        userEmail,
    } = state

    // formatea "2026-05-15" → "15/05/2026"
    // split+join evita el offset de timezone que da new Date() con strings ISO
    const fmt = (iso) => {
        const [y, m, d] = iso.split('-')
        return `${d}/${m}/${y}`
    }

    return (
        <div className="booking-conf">

            {/* encabezado de éxito — el ícono grande y el título son lo primero que ve el usuario
                para darle certeza inmediata de que la operación salió bien */}
            <div className="booking-conf__hero">
                <span className="booking-conf__hero-icon">✅</span>
                <h1 className="booking-conf__hero-title">¡Reserva confirmada!</h1>
                <p className="booking-conf__hero-subtitle">
                    Te enviamos un email con los detalles a <strong>{userEmail}</strong>
                </p>
            </div>

            <div className="booking-conf__body">

                {/* tarjeta del producto reservado — HU #31: mostrar detalle del producto */}
                <div className="booking-conf__card">
                    <h2 className="booking-conf__card-title">Producto reservado</h2>

                    <div className="booking-conf__room">
                        {/* imagen del producto si existe — refuerzo visual de qué reservó */}
                        {roomImage && (
                            <img
                                src={roomImage}
                                alt={roomName}
                                className="booking-conf__room-img"
                            />
                        )}
                        <div className="booking-conf__room-info">
                            <p className="booking-conf__room-name">{roomName}</p>

                            {/* fechas en dos columnas para que sea fácil de escanear */}
                            <div className="booking-conf__dates">
                                <div className="booking-conf__date-block">
                                    <span className="booking-conf__date-label">Check-in</span>
                                    <span className="booking-conf__date-value">{fmt(checkIn)}</span>
                                </div>
                                <span className="booking-conf__date-arrow">→</span>
                                <div className="booking-conf__date-block">
                                    <span className="booking-conf__date-label">Check-out</span>
                                    <span className="booking-conf__date-value">{fmt(checkOut)}</span>
                                </div>
                            </div>

                            <div className="booking-conf__total-row">
                                <span className="booking-conf__total-label">
                                    {nights} noche{nights !== 1 ? 's' : ''}
                                </span>
                                <span className="booking-conf__total-value">
                                    ${total} USD
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* tarjeta del usuario — HU #31: mostrar datos de quien reserva */}
                <div className="booking-conf__card">
                    <h2 className="booking-conf__card-title">Datos del huésped</h2>
                    <div className="booking-conf__user-grid">
                        <div className="booking-conf__user-field">
                            <span className="booking-conf__user-label">Nombre</span>
                            <span className="booking-conf__user-value">{userFirstName}</span>
                        </div>
                        <div className="booking-conf__user-field">
                            <span className="booking-conf__user-label">Apellido</span>
                            <span className="booking-conf__user-value">{userLastName}</span>
                        </div>
                        <div className="booking-conf__user-field booking-conf__user-field--full">
                            <span className="booking-conf__user-label">Email</span>
                            <span className="booking-conf__user-value">{userEmail}</span>
                        </div>
                    </div>
                </div>

                {/* acciones post-confirmación — dos caminos: seguir explorando o ver historial */}
                <div className="booking-conf__actions">
                    <button
                        className="booking-conf__btn booking-conf__btn--primary"
                        onClick={() => navigate('/my-bookings')}
                    >
                        Ver mis reservas
                    </button>
                    <button
                        className="booking-conf__btn booking-conf__btn--secondary"
                        onClick={() => navigate(`/rooms/${roomId}`)}
                    >
                        Volver al producto
                    </button>
                    <button
                        className="booking-conf__btn booking-conf__btn--ghost"
                        onClick={() => navigate('/')}
                    >
                        Explorar más productos
                    </button>
                </div>

            </div>
        </div>
    )
}

export default BookingConfirmation