import { useState } from 'react'
import './AvailabilityCalendar.css'

const MONTHS = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]
const DAYS = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']

// recibe occupiedRanges: [{checkIn: "YYYY-MM-DD", checkOut: "YYYY-MM-DD"}]
// es un componente de solo lectura, el usuario no selecciona nada
// solo visualiza qué días están ocupados y cuáles disponibles
const AvailabilityCalendar = ({ occupiedRanges = [] }) => {

    const today = new Date()
    // mes izquierdo arranca en el mes actual
    const [calendarMonth, setCalendarMonth] = useState({
        year: today.getFullYear(),
        month: today.getMonth()
    })

    // mes derecho siempre es mes izquierdo + 1
    const rightDate = new Date(calendarMonth.year, calendarMonth.month + 1, 1)
    const rightMonth = { year: rightDate.getFullYear(), month: rightDate.getMonth() }

    // construye el array de celdas del mes — misma lógica que en SearchBar
    // null = celda vacía (padding antes del día 1), string = "YYYY-MM-DD"
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

    // determina si un día cae dentro de algún rango ocupado
    // la lógica: dateStr >= checkIn AND dateStr < checkOut
    // checkOut es el día de salida — ese día la room ya está disponible
    const isOccupied = (dateStr) => {
        return occupiedRanges.some(range =>
            dateStr >= range.checkIn && dateStr < range.checkOut
        )
    }

    const todayStr = today.toISOString().split('T')[0]

    const getDayClass = (dateStr) => {
        if (!dateStr) return 'av-cal__day av-cal__day--empty'
        const classes = ['av-cal__day']
        if (dateStr < todayStr) {
            classes.push('av-cal__day--past')
        } else if (isOccupied(dateStr)) {
            // día ocupado — se muestra en color diferente según criterio de aceptación
            classes.push('av-cal__day--occupied')
        } else {
            // día disponible — color positivo para el usuario
            classes.push('av-cal__day--available')
        }
        return classes.join(' ')
    }

    // navega al mes anterior o siguiente actualizando el estado
    const prevMonth = () => {
        setCalendarMonth(prev => {
            const d = new Date(prev.year, prev.month - 1, 1)
            return { year: d.getFullYear(), month: d.getMonth() }
        })
    }

    // navega al mes siguiente actualizando el estado
    const nextMonth = () => {
        setCalendarMonth(prev => {
            const d = new Date(prev.year, prev.month + 1, 1)
            return { year: d.getFullYear(), month: d.getMonth() }
        })
    }

    // renderiza un mes con su título, días de la semana y grilla de días
    const renderMonth = ({ year, month }) => {
        const grid = buildGrid(year, month)
        return (
            <div className="av-cal__month">
                <div className="av-cal__month-title">
                    {MONTHS[month]} {year}
                </div>
                <div className="av-cal__days-header">
                    {DAYS.map(d => (
                        <span key={d} className="av-cal__day-name">{d}</span>
                    ))}
                </div>
                <div className="av-cal__grid">
                    {grid.map((dateStr, i) => (
                        <div key={i} className={getDayClass(dateStr)}>
                            {dateStr ? parseInt(dateStr.split('-')[2]) : ''}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="av-cal">
            <div className="av-cal__controls">
                <button
                    type="button"
                    className="av-cal__nav"
                    onClick={prevMonth}
                >
                    ‹
                </button>
                <div className="av-cal__months">
                    {renderMonth(calendarMonth)}
                    {renderMonth(rightMonth)}
                </div>
                <button
                    type="button"
                    className="av-cal__nav"
                    onClick={nextMonth}
                >
                    ›
                </button>
            </div>

            {/* leyenda: explica el código de color al usuario */}
            <div className="av-cal__legend">
                <div className="av-cal__legend-item">
                    <div className="av-cal__legend-dot av-cal__legend-dot--available" />
                    <span>Disponible</span>
                </div>
                <div className="av-cal__legend-item">
                    <div className="av-cal__legend-dot av-cal__legend-dot--occupied" />
                    <span>Ocupado</span>
                </div>
                <div className="av-cal__legend-item">
                    <div className="av-cal__legend-dot av-cal__legend-dot--past" />
                    <span>Fecha pasada</span>
                </div>
            </div>
        </div>
    )
}

export default AvailabilityCalendar