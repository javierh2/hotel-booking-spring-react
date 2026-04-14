import { useState, useEffect } from 'react'
import RoomCard from '../../components/RoomCard/RoomCard'
import SearchBar from '../../components/SearchBar/SearchBar'
import { getAvailableRooms } from '../../services/roomService'
import { getAllRooms } from '../../services/roomService'
import Pagination from '../../components/Pagination/Pagination'
import { getAllCategories } from '../../services/categoryService'
import './Home.css'


const ROOMS_PER_PAGE = 6

const Home = () => {

    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [categories, setCategories] = useState([])

    // Set para manejar las categorías seleccionadas porque:
    // has(), add(), delete() son O(1) y no permite duplicados
    const [selectedCategories, setSelectedCategories] = useState(new Set())

    // searchResults: null = no hay búsqueda activa, array = hay búsqueda activa
    // la distinción entre null y [] es importante:
    // null → mostrar todas las rooms; [] → búsqueda sin resultados
    const [searchResults, setSearchResults] = useState(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState(null)
    // guarda el texto de ciudad para mostrarlo en el subtítulo de resultados
    const [activeSearch, setActiveSearch] = useState(null)


    const fetchRooms = async () => {
        setLoading(true)
        setError(null)
        try {
            // getAllRooms en lugar de getRandomRooms — trae todas las habitaciones
            // así el filtro opera sobre el pool completo y ninguna desaparece
            const data = await getAllRooms()
            setRooms(data)
        } catch (err) {
            setError(err.message)
            console.log("Error al cargar habitaciones", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories()
            setCategories(data)
        } catch (error) {
            console.error("Error al cargar las categorías", error)
        }
    }

    useEffect(() => {
        fetchRooms()
        fetchCategories()
    }, [])

    // toggle de categoría; si ya estaba seleccionada la deselecciona, si no, la agrega
    // mismo patrón que handleFeatureToggle en RoomForm
    const handleCategorySelect = (categoryId) => {
        setSelectedCategories(prev => {
            const next = new Set(prev)
            if (next.has(categoryId)) {
                next.delete(categoryId)
            } else {
                next.add(categoryId)
            }
            return next
        })
        // vuelve a página 1 al cambiar el filtro
        // evita quedar en una página que ya no existe con el nuevo filtro
        setCurrentPage(1)
    }

    // limpia todos los filtros de una vez
    const handleClearFilters = () => {
        setSelectedCategories(new Set())
        setCurrentPage(1)
    }

    // recibe { city, checkIn, checkOut } desde SearchBar
    // si hay fechas: consulta el backend por disponibilidad real
    // si solo hay ciudad: filtra sobre las rooms ya en memoria
    // en ambos casos, si también hay ciudad, aplica el filtro de texto encima
    const handleSearch = async ({ city, checkIn, checkOut }) => {

        // si no hay ningún criterio, reseteamos a estado normal
        if (!city && !checkIn && !checkOut) {
            setSearchResults(null)
            setActiveSearch(null)
            return
        }

        setSearchLoading(true)
        setSearchError(null)
        setActiveSearch({ city, checkIn, checkOut })
        // reseteamos la paginación — los resultados de búsqueda empiezan en página 1
        setCurrentPage(1)
        // limpiamos el filtro de categorías — no tiene sentido tener ambos activos
        setSelectedCategories(new Set())

        try {
            // base: si hay fechas, consultamos disponibilidad al backend
            // si no hay fechas, usamos todas las rooms ya en memoria
            let base = rooms
            if (checkIn && checkOut) {
                base = await getAvailableRooms(checkIn, checkOut)
            }

            // filtro de ciudad encima de la base
            // buscamos en name y description para cubrir más casos
            // (ej: "Buenos Aires" puede estar en la descripción aunque no en el nombre)
            const filtered = city
                ? base.filter(room =>
                    room.name.toLowerCase().includes(city.toLowerCase()) ||
                    room.description.toLowerCase().includes(city.toLowerCase())
                )
                : base

            setSearchResults(filtered)
        } catch (err) {
            setSearchError(err + 'No se pudo realizar la búsqueda. Verificá tu conexión e intentá de nuevo. ??????????????????????')
            setSearchResults([])
        } finally {
            setSearchLoading(false)
        }
    }

    // limpia la búsqueda activa y vuelve al catálogo normal
    const handleClearSearch = () => {
        setSearchResults(null)
        setActiveSearch(null)
        setCurrentPage(1)
    }


    // si hay búsqueda activa usamos searchResults como fuente
    // si no, aplicamos el filtro de categorías sobre todas las rooms
    // los dos modos son mutuamente excluyentes — handleSearch limpia selectedCategories
    const filteredRooms = searchResults !== null
        ? searchResults
        : selectedCategories.size > 0
            ? rooms.filter(room =>
                room.category && selectedCategories.has(room.category.id)
            )
            : rooms

    const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ROOMS_PER_PAGE
    const currentRooms = filteredRooms.slice(startIndex, startIndex + ROOMS_PER_PAGE)

    const handlePageChange = (page) => {
        setCurrentPage(page)
        document.getElementById('recommendations')?.scrollIntoView({
            behavior: 'smooth'
        })
    }

    return (
        <div className="home">

            <SearchBar onSearch={handleSearch} />

            {/* sección de filtro de categorías */}
            <section className="categories-filter">
                <div className="categories-filter__content">

                    <div className="categories-filter__header">
                        <h2 className="categories-filter__title">Categories</h2>

                        {/* mostramos cuántas categorías están activas y botón para limpiar
                            solo visible cuando hay al menos un filtro activo */}
                        {selectedCategories.size > 0 && (
                            <div className="categories-filter__active-info">
                                <span className="categories-filter__active-count">
                                    {selectedCategories.size} filtro{selectedCategories.size !== 1 ? 's' : ''} activo{selectedCategories.size !== 1 ? 's' : ''}
                                </span>
                                <button
                                    className="categories-filter__clear"
                                    onClick={handleClearFilters}
                                >
                                    Limpiar filtros ✕
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="categories-filter__grid">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                // la card se marca como activa si su id está en el Set
                                className={`categories-filter__card ${selectedCategories.has(category.id) ? 'categories-filter__card--active' : ''}`}
                                onClick={() => handleCategorySelect(category.id)}
                            >
                                {category.imageUrl && (
                                    <img
                                        src={category.imageUrl}
                                        alt={category.title}
                                        className="categories-filter__img"
                                    />
                                )}
                                <span className="categories-filter__label">{category.title}</span>
                            </button>
                        ))}
                    </div>

                </div>
            </section>

            <section className="recommendations" id="recommendations">
                <div className="recommendations__content">

                    <div className="recommendations__header">
                        <h2 className="recommendations__title">Recommendations</h2>
                        <p className="recommendations__subtitle">
                            {searchResults !== null
                                ? `${filteredRooms.length} resultado${filteredRooms.length !== 1 ? 's' : ''} encontrado${filteredRooms.length !== 1 ? 's' : ''}`
                                : selectedCategories.size > 0
                                    ? `${filteredRooms.length} habitación${filteredRooms.length !== 1 ? 'es' : ''} encontrada${filteredRooms.length !== 1 ? 's' : ''}`
                                    : 'Rooms selected for you'
                            }
                        </p>
                    </div>

                    {loading || searchLoading ? (
                        <div className="recommendations__state">
                            <div className="recommendations__spinner" />
                            <p className="recommendations__loading-text">
                                {searchLoading ? 'Buscando disponibilidad...' : 'Loading rooms...'}
                            </p>
                        </div>

                    ) : searchError ? (
                        <div className="recommendations__state">
                            <div className="recommendations__error">
                                <span className="recommendations__error-icon">⚠️</span>
                                <p className="recommendations__error-text">{searchError}</p>
                                <button className="recommendations__retry-btn" onClick={handleClearSearch}>
                                    Ver todas las habitaciones
                                </button>
                            </div>
                        </div>

                    ) : error ? (
                        <div className="recommendations__state">
                            <div className="recommendations__error">
                                <span className="recommendations__error-icon">⚠️</span>
                                <p className="recommendations__error-text">
                                    We were unable to load the rooms. Verify that the backend is running.
                                </p>
                                <button className="recommendations__retry-btn" onClick={fetchRooms}>
                                    Retry
                                </button>
                            </div>
                        </div>

                    ) : (
                        <>
                            {/* banner de búsqueda activa — muestra qué se buscó y permite limpiar */}
                            {searchResults !== null && activeSearch && (
                                <div className="recommendations__search-banner">
                                    <span>
                                        {activeSearch.checkIn && activeSearch.checkOut
                                            ? `Disponibilidad del ${activeSearch.checkIn} al ${activeSearch.checkOut}`
                                            : ''}
                                        {activeSearch.city && activeSearch.checkIn
                                            ? ` · en "${activeSearch.city}"`
                                            : activeSearch.city
                                                ? `Resultados para "${activeSearch.city}"`
                                                : ''}
                                    </span>
                                    <button
                                        className="recommendations__search-clear"
                                        onClick={handleClearSearch}
                                    >
                                        ✕ Limpiar búsqueda
                                    </button>
                                </div>
                            )}

                            {currentRooms.length === 0 ? (
                                <div className="recommendations__state">
                                    <p className="recommendations__empty">
                                        {searchResults !== null
                                            ? 'No hay habitaciones disponibles para esos criterios.'
                                            : 'No hay habitaciones en estas categorías.'
                                        }
                                    </p>
                                    <button
                                        className="recommendations__retry-btn"
                                        onClick={searchResults !== null ? handleClearSearch : handleClearFilters}
                                    >
                                        Ver todas
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="recommendations__grid">
                                        {currentRooms.map(room => (
                                            <RoomCard key={room.id} room={room} />
                                        ))}
                                    </div>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}
                        </>
                    )}


                </div>
            </section>

        </div>
    )
}

export default Home