import { useState, useRef, useEffect } from 'react'
import './SearchBar.css'

// ciudades sugeridas fijas
// no vienen de la DB porque Room no tiene campo city
// el autocomplete filtra rooms por nombre/descripción en Home
const SUGGESTED_CITIES = [
    'San Carlos de Bariloche',
    'Buenos Aires',
    'Mendoza',
    'Córdoba',
    "Ushuaia",
    'Salta',
    'Mar del Plata',
    'Puerto Iguazú',
    'El Calafate',
    'Villa La Angostura'
]

// nombres cortos de los meses para el encabezado del calendario
const MONTHS = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

const DAYS = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']

// recibe onSearch como prop — SearchBar no sabe nada de rooms ni de paginación
// Home le pasa el callback y reacciona al resultado
// esto hace SearchBar reutilizable en cualquier otra página
const SearchBar = ({ onSearch }) => {

    const [cityInput, setCityInput] = useState('')
    // showSuggestions controla el dropdown de ciudades
    const [showSuggestions, setShowSuggestions] = useState(false)
    // showCalendar controla el dropdown del calendario doble
    const [showCalendar, setShowCalendar] = useState(false)

    // checkIn y checkOut son strings ISO (YYYY-MM-DD) o null
    const [checkIn, setCheckIn] = useState(null)
    const [checkOut, setCheckOut] = useState(null)
    // hoverDate para resaltar el rango mientras el usuario mueve el mouse
    const [hoverDate, setHoverDate] = useState(null)
    // selectionStep: 'checkIn' | 'checkOut' — controla qué estamos seleccionando
    const [selectionStep, setSelectionStep] = useState('checkIn')

    // mes base del calendario izquierdo — el derecho siempre es mes+1
    const today = new Date()
    const [calendarMonth, setCalendarMonth] = useState({
        year: today.getFullYear(),
        month: today.getMonth()
    })

    // refs para detectar clic fuera y cerrar los dropdowns
    const cityRef = useRef(null)
    const calendarRef = useRef(null)

    // cierra dropdowns cuando el usuario hace clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cityRef.current && !cityRef.current.contains(e.target)) {
                setShowSuggestions(false)
            }
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setShowCalendar(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // filtra las ciudades sugeridas según lo que escribe el usuario
    // toLowerCase para hacer la comparación case-insensitive
    const filteredCities = SUGGESTED_CITIES.filter(city =>
        city.toLowerCase().includes(cityInput.toLowerCase())
    )

    const handleCityChange = (e) => {
        setCityInput(e.target.value)
        // mostramos sugerencias solo si hay texto — si borra todo, las ocultamos
        setShowSuggestions(e.target.value.length > 0)
    }

    const handleCitySelect = (city) => {
        setCityInput(city)
        setShowSuggestions(false)
    }

    // genera el label que se muestra en el campo de fechas
    // si no hay fechas seleccionadas, muestra el placeholder
    const getDateLabel = () => {
        if (!checkIn && !checkOut) return 'Check in  —  Check out'
        const fmt = (iso) => {
            const [y, m, d] = iso.split('-')
            return `${d}/${m}/${y}`
        }
        if (checkIn && !checkOut) return `${fmt(checkIn)}  —  Check out`
        return `${fmt(checkIn)}  —  ${fmt(checkOut)}`
    }

    // construye la grilla de días para un mes dado
    // devuelve un array de { dateStr, inMonth } donde dateStr es YYYY-MM-DD
    const buildMonthGrid = (year, month) => {
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const grid = []

        // celdas vacías antes del primer día
        for (let i = 0; i < firstDay; i++) {
            grid.push(null)
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const mm = String(month + 1).padStart(2, '0')
            const dd = String(d).padStart(2, '0')
            grid.push(`${year}-${mm}-${dd}`)
        }
        return grid
    }

    // lógica de selección de fechas en el calendario
    // primer clic → checkIn, segundo clic → checkOut
    // si el segundo clic es anterior al checkIn, reseteamos y empezamos de nuevo
    const handleDayClick = (dateStr) => {
        const todayStr = today.toISOString().split('T')[0]
        // no permitimos seleccionar fechas pasadas
        if (dateStr < todayStr) return

        if (selectionStep === 'checkIn') {
            setCheckIn(dateStr)
            setCheckOut(null)
            setSelectionStep('checkOut')
        } else {
            if (dateStr <= checkIn) {
                // si el usuario hace clic en una fecha anterior o igual al checkIn,
                // reiniciamos desde esa fecha como nuevo checkIn
                setCheckIn(dateStr)
                setCheckOut(null)
                setSelectionStep('checkOut')
            } else {
                setCheckOut(dateStr)
                setSelectionStep('checkIn')
                // cerramos el calendario al completar la selección
                setShowCalendar(false)
            }
        }
    }

    // determina las clases CSS de cada celda del calendario
    // según si es checkIn, checkOut, está en el rango, es pasada, etc.
    const getDayClass = (dateStr) => {
        if (!dateStr) return ''
        const todayStr = today.toISOString().split('T')[0]
        const classes = ['searchbar__cal-day']

        if (dateStr < todayStr) {
            classes.push('searchbar__cal-day--past')
            return classes.join(' ')
        }
        if (dateStr === checkIn) classes.push('searchbar__cal-day--selected')
        if (dateStr === checkOut) classes.push('searchbar__cal-day--selected')

        // resaltado de rango: entre checkIn y checkOut (o checkIn y hoverDate)
        const rangeEnd = checkOut || (selectionStep === 'checkOut' ? hoverDate : null)
        if (checkIn && rangeEnd && dateStr > checkIn && dateStr < rangeEnd) {
            classes.push('searchbar__cal-day--range')
        }
        return classes.join(' ')
    }

    // navega el mes del calendario izquierdo — el derecho se calcula automáticamente
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

    // mes derecho = mes izquierdo + 1
    const rightMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 1)
    const rightMonthData = { year: rightMonth.getFullYear(), month: rightMonth.getMonth() }

    // dispara la búsqueda — llama al callback que recibe de Home
    const handleSearch = () => {
        // si onSearch no fue pasado (ej: uso aislado del componente), no falla
        if (onSearch) {
            onSearch({
                city: cityInput.trim(),
                checkIn,
                checkOut
            })
        }
    }

    // renderiza un mes del calendario (se usa dos veces: izquierdo y derecho)
    const renderMonth = ({ year, month }) => {
        const grid = buildMonthGrid(year, month)
        return (
            <div className="searchbar__cal-month">
                <div className="searchbar__cal-month-title">
                    {MONTHS[month]} {year}
                </div>
                <div className="searchbar__cal-days-header">
                    {DAYS.map(d => (
                        <span key={d} className="searchbar__cal-day-name">{d}</span>
                    ))}
                </div>
                <div className="searchbar__cal-grid">
                    {grid.map((dateStr, i) => (
                        <button
                            key={i}
                            className={getDayClass(dateStr)}
                            // disabled en celdas vacías (null) y fechas pasadas
                            disabled={!dateStr || dateStr < today.toISOString().split('T')[0]}
                            onClick={() => dateStr && handleDayClick(dateStr)}
                            onMouseEnter={() => dateStr && setHoverDate(dateStr)}
                            onMouseLeave={() => setHoverDate(null)}
                            type="button"
                        >
                            {dateStr ? parseInt(dateStr.split('-')[2]) : ''}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <section className="searchbar">
            <div className="searchbar__content">

                <h1 className="searchbar__title">
                    Busca ofertas en hoteles, casas y mucho más
                </h1>

                <div className="searchbar__form">

                    {/* campo de destino con autocomplete */}
                    <div className="searchbar__field searchbar__field--city" ref={cityRef}>
                        <span className="searchbar__field-icon">📍</span>
                        <input
                            type="text"
                            className="searchbar__input"
                            placeholder="¿A dónde vamos?"
                            value={cityInput}
                            onChange={handleCityChange}
                            onFocus={() => cityInput.length > 0 && setShowSuggestions(true)}
                        />
                        {/* dropdown de sugerencias — se muestra cuando hay texto */}
                        {showSuggestions && filteredCities.length > 0 && (
                            <ul className="searchbar__suggestions">
                                {filteredCities.map(city => (
                                    <li
                                        key={city}
                                        className="searchbar__suggestion-item"
                                        // mouseDown en lugar de click para que no dispare el onBlur del input antes
                                        onMouseDown={() => handleCitySelect(city)}
                                    >
                                        <span className="searchbar__suggestion-icon">📍</span>
                                        {city}
                                        <span className="searchbar__suggestion-country">Argentina</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* separador visual */}
                    <div className="searchbar__separator" />

                    {/* campo de fechas con calendario doble */}
                    <div className="searchbar__field searchbar__field--dates" ref={calendarRef}>
                        <span className="searchbar__field-icon">📅</span>
                        <button
                            type="button"
                            className={`searchbar__date-btn ${checkIn ? 'searchbar__date-btn--active' : ''}`}
                            onClick={() => setShowCalendar(prev => !prev)}
                        >
                            {getDateLabel()}
                        </button>

                        {/* dropdown del calendario doble */}
                        {showCalendar && (
                            <div className="searchbar__calendar">
                                <div className="searchbar__cal-header">
                                    <button
                                        type="button"
                                        className="searchbar__cal-nav"
                                        onClick={prevMonth}
                                    >
                                        ‹
                                    </button>
                                    <div className="searchbar__cal-months">
                                        {renderMonth(calendarMonth)}
                                        {renderMonth(rightMonthData)}
                                    </div>
                                    <button
                                        type="button"
                                        className="searchbar__cal-nav"
                                        onClick={nextMonth}
                                    >
                                        ›
                                    </button>
                                </div>
                                {/* botón para limpiar las fechas seleccionadas */}
                                {(checkIn || checkOut) && (
                                    <div className="searchbar__cal-footer">
                                        <button
                                            type="button"
                                            className="searchbar__cal-clear"
                                            onClick={() => {
                                                setCheckIn(null)
                                                setCheckOut(null)
                                                setSelectionStep('checkIn')
                                            }}
                                        >
                                            Limpiar fechas
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="searchbar__button"
                        onClick={handleSearch}
                    >
                        Buscar
                    </button>

                </div>
            </div>
        </section>
    )
}

export default SearchBar