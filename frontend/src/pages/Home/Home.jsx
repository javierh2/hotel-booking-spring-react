import { useState, useEffect } from 'react'
// import del componente RoomCard,Categories y SearchBar
import RoomCard from '../../components/RoomCard/RoomCard'
import Categories from '../../components/Categories/Categories'
import SearchBar from '../../components/SearchBar/SearchBar'
import './Home.css'

// import del servicio para obtener habitaciones aleatorias desde el backend
import {getRandomRooms} from '../../services/roomService'


const Home = () => {

    // estados para manejar la información de las habitaciones, el estado de carga y los errores
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    return (
        <div className="home">
            <SearchBar />

            <Categories />

            <section className="recommendations">
                <div className="recommendations__content">
                    <div className="recommendations__header">
                        <h2 className="recommendations__title">
                            Recomendaciones!!
                        </h2>
                        <p className="recommendations__subtitle"> Habitaciones recomendadas </p>
                    </div>

                    {/* Renderizado condicional */}
                    {loading ? (
                        <div className="recommendations__state">
                            <div className="recommendations__spinner" />
                            <p className="recommendations__loading-text">Cargando habitaciones...</p>
                        </div>
                    ) : error  ? (
                        <div className="recommendations__state">
                            <div className="recommendations__error">
                                <span className="recommendations__error-icon">⚠️</span>
                                <p className="recommendations__error-text">
                                    No pudimos cargar las habitaciones!
                                    Recarga la página o intenta nuevamente más tarde.
                                </p>
                                <button
                                    className="recommendations__retry-btn"
                                    onClick={fetchRooms}
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>

                    ) : (
                        <div className="recommendations__grid">
                            {rooms.map(room => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default Home