import { useState, useEffect } from 'react'
// import del componente RoomCard,Categories y SearchBar
import RoomCard from '../../components/RoomCard/RoomCard'
import SearchBar from '../../components/SearchBar/SearchBar'
import './Home.css'
// import del servicio para obtener habitaciones aleatorias desde el backend
import { getRandomRooms } from '../../services/roomService'
import Pagination from '../../components/Pagination/Pagination'
import { getAllCategories } from '../../services/categoryService'

const ROOMS_PER_PAGE = 6

const Home = () => {

    // estados para manejar la información de las habitaciones, el estado de carga y los errores
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)

    // categorías para el filtro
    const [categories, setCategories] = useState([])
    // id de la categoría seleccionada, null significa "todas"
    const [selectedCategory, setSelectedCategory] = useState(null)

    // función para cargar las habitaciones desde el backend dentro de un useEffect para que se ejecute al montar el componente - DRY - no repetir código de carga en otros componentes
    const fetchRooms = async () => {
        //reset de estados para cada nueva carga
        setLoading(true)
        setError(null)
        try {
            const data = await getRandomRooms() // función del servicio roomService para obtener habitaciones aleatorias
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


    // manejo de seleccion de categorias
    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(prev => prev === categoryId ? null : categoryId)
        setCurrentPage(1)
    }

    // primero filtra según la selección después estructura la paginación
    const filteredRooms = selectedCategory
        ? rooms.filter(room => room.category?.id === selectedCategory)
        : rooms


    // lógica para paginar y filtrar las habitaciones - cálculo de total de páginas, índice de inicio y habitaciones a mostrar en la página actual
    const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ROOMS_PER_PAGE
    const currentRooms = filteredRooms.slice(startIndex, startIndex + ROOMS_PER_PAGE)

    // función para manejar el cambio de página desde el componente Pagination - actualiza el estado de la página actual y hace scroll suave a la sección de recomendaciones
    const handlePageChange = (page) => {
        setCurrentPage(page)
        document.getElementById('recommendations')?.scrollIntoView({
            behavior: 'smooth'
        })
    }

    return (
        <div className="home">

            <SearchBar />

            {/* sección de filtro de categorías — HU #20 */}
            <section className="categories-filter">
                <div className="categories-filter__content">

                    <div className="categories-filter__header">
                        <h2 className="categories-filter__title">Categorías</h2>
                        {selectedCategory && (
                            // botón para limpiar el filtro — HU #20
                            <button
                                className="categories-filter__clear"
                                onClick={() => handleCategorySelect(null)}
                            >
                                Limpiar filtro ✕
                            </button>
                        )}
                    </div>

                    <div className="categories-filter__grid">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`categories-filter__card ${selectedCategory === category.id ? 'categories-filter__card--active' : ''}`}
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
                            {selectedCategory
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
                                        No hay habitaciones en esta categoría.
                                    </p>
                                    <button
                                        className="recommendations__retry-btn"
                                        onClick={() => setSelectedCategory(null)}
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