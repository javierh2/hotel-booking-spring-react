import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createBooking } from '../../services/bookingService'
import './BookingForm.css'

const MONTHS = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]
const DAYS = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']

// visualizar qué días están ocupados
// permitir seleccionar un rango de fechas para reservar
// ambas responsabilidades comparten el mismo calendar grid — un solo componente, cero redundancia
// recibe room para calcular el precio total y occupiedRanges del fetch en RoomDetail
// HU #31: agregamos bloque de datos del usuario autenticado arriba del calendario
// HU #32: al confirmar exitosamente, navegamos a /booking/confirmation con los datos via state
//         en lugar de mostrar el éxito inline — la HU pide una página dedicada
const BookingForm = ({ room, occupiedRanges = [], onBookingCreated }) => {

    // HU #31: necesitamos user para mostrar nombre, apellido y email en el formulario
    const { isAuthenticated, user } = useAuth()
    const navigate = useNavigate()

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const [calendarMonth, setCalendarMonth] = useState({
        year: today.getFullYear(),
        month: today.getMonth()
    })

    // checkIn y checkOut: strings "YYYY-MM-DD" o null
    const [checkIn, setCheckIn] = useState(null)
    const [checkOut, setCheckOut] = useState(null)
    // hoverDate: resalta el rango mientras el mouse se mueve antes de confirmar checkOut
    const [hoverDate, setHoverDate] = useState(null)
    // selectionStep controla qué fecha estamos eligiendo en este momento
    const [selectionStep, setSelectionStep] = useState('checkIn')

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // mes derecho siempre es mes izquierdo + 1
    const rightDate = new Date(calendarMonth.year, calendarMonth.month + 1, 1)
    const rightMonth = { year: rightDate.getFullYear(), month: rightDate.getMonth() }

    // construye el array de celdas — null para celdas vacías de padding, string "YYYY-MM-DD" para días
    const buildGrid = (year, month) => {
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const grid = []
        for (let i = 0; i < firstDay; i++) grid.push(null)
        for (let d = 1; d <= daysInMonth; d++) {
            const mm = String(month + 1).padStart(2, '0')
            const dd = String(d).padStart(2, '0')
            grid.push(`${year}-${mm}-${dd}`)
        }
        return grid
    }

    // un día está ocupado si cae dentro de algún rango de reserva existente
    // checkOut es el día de salida — ese día ya está disponible (por eso < y no <=)
    const isOccupied = (dateStr) => {
        return occupiedRanges.some(r =>
            dateStr >= r.checkIn && dateStr < r.checkOut
        )
    }

    // determina la clase CSS de cada celda del calendario
    // el orden de los if importa: pasado y ocupado tienen prioridad sobre seleccionado
    const getDayClass = (dateStr) => {
        if (!dateStr) return 'booking-form__cal-day booking-form__cal-day--empty'
        const classes = ['booking-form__cal-day']

        if (dateStr < todayStr) {
            classes.push('booking-form__cal-day--past')
            return classes.join(' ')
        }
        if (isOccupied(dateStr)) {
            // días ocupados se muestran igual que en el antiguo AvailabilityCalendar
            // terracota para que el usuario entienda que no puede seleccionarlos
            classes.push('booking-form__cal-day--occupied')
            return classes.join(' ')
        }
        if (dateStr === checkIn || dateStr === checkOut) {
            classes.push('booking-form__cal-day--selected')
            return classes.join(' ')
        }
        // resaltado de rango: entre checkIn y checkOut o entre checkIn y hoverDate
        const rangeEnd = checkOut || (selectionStep === 'checkOut' ? hoverDate : null)
        if (checkIn && rangeEnd && dateStr > checkIn && dateStr < rangeEnd) {
            classes.push('booking-form__cal-day--range')
            return classes.join(' ')
        }
        // día disponible — verde suave para señal positiva al usuario
        classes.push('booking-form__cal-day--available')
        return classes.join(' ')
    }

    const handleDayClick = (dateStr) => {
        // ignoramos clics en días pasados u ocupados
        if (dateStr < todayStr || isOccupied(dateStr)) return

        if (selectionStep === 'checkIn') {
            setCheckIn(dateStr)
            setCheckOut(null)
            setSelectionStep('checkOut')
            setError(null)
        } else {
            if (dateStr <= checkIn) {
                // si el usuario hace clic en una fecha anterior o igual al checkIn,
                // reiniciamos con esa fecha como nuevo checkIn
                setCheckIn(dateStr)
                setCheckOut(null)
                setSelectionStep('checkOut')
            } else {
                // verificamos que no haya días ocupados dentro del rango elegido
                const rangeHasOccupied = occupiedRanges.some(r =>
                    r.checkIn < dateStr && r.checkOut > checkIn
                )
                if (rangeHasOccupied) {
                    setError('El rango incluye fechas ya reservadas. Elegí otro período.')
                    return
                }
                setCheckOut(dateStr)
                setSelectionStep('checkIn')
                setError(null)
            }
        }
    }

    const prevMonth = () => {
        setCalendarMonth(prev => {
            const d = new Date(prev.year, prev.month - 1, 1)
            return { year: d.getFullYear(), month: d.getMonth() }
        })
    }
    const nextMonth = () => {
        setCalendarMonth(prev => {
            const d = new Date(prev.year, prev.month + 1, 1)
            return { year: d.getFullYear(), month: d.getMonth() }
        })
    }

    const renderMonth = ({ year, month }) => {
        const grid = buildGrid(year, month)
        return (
            <div className="booking-form__cal-month">
                <div className="booking-form__cal-month-title">
                    {MONTHS[month]} {year}
                </div>
                <div className="booking-form__cal-days-header">
                    {DAYS.map(d => (
                        <span key={d} className="booking-form__cal-day-name">{d}</span>
                    ))}
                </div>
                <div className="booking-form__cal-grid">
                    {grid.map((dateStr, i) => (
                        <button
                            key={i}
                            type="button"
                            className={getDayClass(dateStr)}
                            disabled={!dateStr || dateStr < todayStr || isOccupied(dateStr)}
                            onClick={() => dateStr && handleDayClick(dateStr)}
                            onMouseEnter={() => dateStr && setHoverDate(dateStr)}
                            onMouseLeave={() => setHoverDate(null)}
                        >
                            {dateStr ? parseInt(dateStr.split('-')[2]) : ''}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    // cantidad de noches entre checkIn y checkOut
    const nights = checkIn && checkOut
        ? Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
        : 0

    const fmt = (iso) => {
        const [y, m, d] = iso.split('-')
        return `${d}/${m}/${y}`
    }

    const handleSubmit = async () => {
        // si no está logueado lo mandamos al login — no tiene sentido reservar sin cuenta
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        if (!checkIn || !checkOut) {
            setError('Seleccioná las fechas de check-in y check-out')
            return
        }
        setSubmitting(true)
        setError(null)
        try {
            await createBooking(room.id, checkIn, checkOut)

            // notificamos al padre para que recargue occupiedRanges
            // así el calendario refleja inmediatamente la reserva recién creada
            if (onBookingCreated) onBookingCreated()

            // HU #32: navegamos a la página de confirmación con los datos via state
            // usamos navigate state en lugar de query params para no exponer datos en la URL
            // y para no tener que re-fetchear el room en la página de confirmación
            navigate('/booking/confirmation', {
                state: {
                    roomId: room.id,
                    roomName: room.name,
                    roomImage: room.images?.[0] || null,
                    checkIn,
                    checkOut,
                    nights,
                    total: (room.price * nights).toFixed(2),
                    // datos del usuario para mostrar en la confirmación (HU #31)
                    userFirstName: user.firstName,
                    userLastName: user.lastName,
                    userEmail: user.email,
                }
            })
        } catch (err) {
            setError(err.message || 'No se pudo completar la reserva. Intentá de nuevo.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="booking-form">

            <div className="booking-form__header">
                <h2 className="booking-form__title">Disponibilidad y reserva</h2>
                {/* instrucción contextual — cambia según el paso actual para guiar al usuario */}
                <p className="booking-form__step-hint">
                    {!checkIn
                        ? 'Seleccioná la fecha de llegada'
                        : !checkOut
                            ? 'Ahora seleccioná la fecha de salida'
                            : `${fmt(checkIn)} → ${fmt(checkOut)} · ${nights} noche${nights !== 1 ? 's' : ''}`
                    }
                </p>
            </div>

            {/* HU #31 — bloque de datos del usuario autenticado
                solo se muestra si está logueado — si no lo está, el botón de submit
                ya lo redirige al login, no tiene sentido mostrar un bloque vacío
                los datos vienen de AuthContext, no hace ningún fetch extra */}
            {isAuthenticated && user && (
                <div className="booking-form__user-info">
                    <h3 className="booking-form__user-info-title">Tus datos</h3>
                    <div className="booking-form__user-info-grid">
                        <div className="booking-form__user-info-field">
                            <span className="booking-form__user-info-label">Nombre</span>
                            <span className="booking-form__user-info-value">{user.firstName}</span>
                        </div>
                        <div className="booking-form__user-info-field">
                            <span className="booking-form__user-info-label">Apellido</span>
                            <span className="booking-form__user-info-value">{user.lastName}</span>
                        </div>
                        <div className="booking-form__user-info-field booking-form__user-info-field--full">
                            <span className="booking-form__user-info-label">Email</span>
                            <span className="booking-form__user-info-value">{user.email}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* calendario doble con navegación */}
            <div className="booking-form__cal-controls">
                <button type="button" className="booking-form__cal-nav" onClick={prevMonth}>‹</button>
                <div className="booking-form__cal-months">
                    {renderMonth(calendarMonth)}
                    {renderMonth(rightMonth)}
                </div>
                <button type="button" className="booking-form__cal-nav" onClick={nextMonth}>›</button>
            </div>

            {/* leyenda unificada — incluye todos los estados posibles del día */}
            <div className="booking-form__legend">
                <div className="booking-form__legend-item">
                    <div className="booking-form__legend-dot booking-form__legend-dot--available" />
                    <span>Disponible</span>
                </div>
                <div className="booking-form__legend-item">
                    <div className="booking-form__legend-dot booking-form__legend-dot--occupied" />
                    <span>Ocupado</span>
                </div>
                <div className="booking-form__legend-item">
                    <div className="booking-form__legend-dot booking-form__legend-dot--selected" />
                    <span>Tu selección</span>
                </div>
                <div className="booking-form__legend-item">
                    <div className="booking-form__legend-dot booking-form__legend-dot--past" />
                    <span>Fecha pasada</span>
                </div>
            </div>

            {/* resumen de selección — aparece cuando hay al menos checkIn */}
            {checkIn && (
                <div className="booking-form__summary">
                    <div className="booking-form__summary-row">
                        <span>Check-in</span>
                        <strong>{fmt(checkIn)}</strong>
                    </div>
                    {checkOut && (
                        <>
                            <div className="booking-form__summary-row">
                                <span>Check-out</span>
                                <strong>{fmt(checkOut)}</strong>
                            </div>
                            <div className="booking-form__summary-divider" />
                            <div className="booking-form__summary-row">
                                <span>{nights} noche{nights !== 1 ? 's' : ''} × ${room.price}</span>
                                <strong className="booking-form__summary-total">
                                    ${(room.price * nights).toFixed(2)} USD
                                </strong>
                            </div>
                        </>
                    )}
                    <button
                        type="button"
                        className="booking-form__clear"
                        onClick={() => {
                            setCheckIn(null)
                            setCheckOut(null)
                            setSelectionStep('checkIn')
                            setError(null)
                        }}
                    >
                        Limpiar selección
                    </button>
                </div>
            )}

            {error && <p className="booking-form__error">{error}</p>}

            <button
                type="button"
                className="booking-form__btn booking-form__btn--primary"
                onClick={handleSubmit}
                disabled={submitting || !checkIn || !checkOut}
            >
                {!isAuthenticated
                    ? 'Iniciá sesión para reservar'
                    : submitting
                        ? 'Confirmando...'
                        : checkIn && checkOut
                            ? `Confirmar reserva · $${(room.price * nights).toFixed(2)} USD`
                            : 'Seleccioná las fechas'
                }
            </button>

        </div>
    )
}

export default BookingForm