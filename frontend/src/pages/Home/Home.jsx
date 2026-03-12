import { useState, useEffect } from 'react'
// import del componente RoomCard,Categories y SearchBar
import RoomCard from '../../components/RoomCard/RoomCard'
import Categories from '../../components/Categories/Categories'
import SearchBar from '../../components/SearchBar/SearchBar'
import './Home.css'
// import del servicio para obtener habitaciones aleatorias desde el backend
import { getRandomRooms } from '../../services/roomService'
import Pagination from '../../components/Pagination/Pagination'

const ROOMS_PER_PAGE = 6

const Home = () => {

    // estados para manejar la información de las habitaciones, el estado de carga y los errores
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)

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
    useEffect(() => {
        fetchRooms()
    }, [])

    // lógica para paginar las habitaciones - cálculo de total de páginas, índice de inicio y habitaciones a mostrar en la página actual
    const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ROOMS_PER_PAGE
    const currentRooms = rooms.slice(startIndex, startIndex + ROOMS_PER_PAGE)

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
            <Categories />

            <section className="recommendations" id="recommendations">
                <div className="recommendations__content">

                    <div className="recommendations__header">
                        <h2 className="recommendations__title">
                            Recommendations
                        </h2>
                        <p className="recommendations__subtitle">
                            Rooms selected for you
                        </p>
                    </div>

                    {loading ? (
                        <div className="recommendations__state">
                            <div className="recommendations__spinner" />
                            <p className="recommendations__loading-text">
                                Loading rooms...
                            </p>
                        </div>

                    ) : error ? (
                        <div className="recommendations__state">
                            <div className="recommendations__error">
                                <span className="recommendations__error-icon">⚠️</span>
                                <p className="recommendations__error-text">
                                    We were unable to load the rooms.
                                    Verify that the backend is running.
                                </p>
                                <button
                                    className="recommendations__retry-btn"
                                    onClick={fetchRooms}
                                >
                                    Retry
                                </button>
                            </div>
                        </div>

                    ) : (
                        <>
                            <div className="recommendations__grid">
                                {currentRooms.map(room => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                    />
                                ))}
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}

                </div>
            </section>

        </div>
    )
}

export default Home
