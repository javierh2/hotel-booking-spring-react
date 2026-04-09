import { useState, useEffect } from 'react'
import RoomCard from '../../components/RoomCard/RoomCard'
import SearchBar from '../../components/SearchBar/SearchBar'
import './Home.css'
import { getAllRooms } from '../../services/roomService'
import Pagination from '../../components/Pagination/Pagination'
import { getAllCategories } from '../../services/categoryService'

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

    // filtra según el Set de categorías seleccionadas
    // si el Set está vacío muestra todas
    // si tiene ids, muestra solo las rooms cuya category.id esté en el Set
    const filteredRooms = selectedCategories.size > 0
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

            <SearchBar />

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
                            {selectedCategories.size > 0
                                ? `${filteredRooms.length} habitación${filteredRooms.length !== 1 ? 'es' : ''} encontrada${filteredRooms.length !== 1 ? 's' : ''}`
                                : 'Rooms selected for you'
                            }
                        </p>
                    </div>

                    {loading ? (
                        <div className="recommendations__state">
                            <div className="recommendations__spinner" />
                            <p className="recommendations__loading-text">Loading rooms...</p>
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
                            {currentRooms.length === 0 ? (
                                <div className="recommendations__state">
                                    <p className="recommendations__empty">
                                        No hay habitaciones en estas categorías.
                                    </p>
                                    <button
                                        className="recommendations__retry-btn"
                                        onClick={handleClearFilters}
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