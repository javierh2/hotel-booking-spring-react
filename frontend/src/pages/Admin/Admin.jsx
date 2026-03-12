import { useEffect, useState } from 'react';
import { deleteRoom, getAllRooms } from '../../services/roomService'
import RoomForm from '../../components/RoomForm/RoomForm'
import './Admin.css'

// página de administración de habitaciones, muestra una tabla con las habitaciones existentes y permite crear nuevas habitaciones o eliminar las existentes
const Admin = () => {

    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    // estado para mostrar u ocultar el formulario de creación de habitaciones
    const [showForm, setShowForm] = useState(false)

    // controla qué vista se renderiza: 'menu' o 'list'
    const [view, setView] = useState('menu')

    // detecta si el ancho de pantalla es mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // carga de habitaciones
    const fetchRooms = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAllRooms()
            setRooms(data)
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }
    // carga inicial de habitaciones al montar el componente
    useEffect(() => {
        fetchRooms()
    }, [])

    // función para manejar la creación de una nueva habitación, agrega la nueva habitación al estado de habitaciones para actualizar la tabla sin necesidad de recargar la página
    const handleRoomCreated = (newRoom) => {
        setRooms(prev => [...prev, newRoom])
    }

    // función para manejar la eliminación de una habitación, muestra una confirmación antes de eliminar y actualiza el estado de habitaciones para reflejar los cambios en la tabla sin necesidad de recargar la página
    const handleDelete = async (id, name) => {
        const confirmation = window.confirm(
            `¿Estás seguro de querer eliminar "${name}"?\
            Esta acción no se puede revertir.`
        )
        if (!confirmation) return
        try {
            await deleteRoom(id)
            setRooms(prev => prev.filter(room => room.id !== id))
        } catch (error) {
            alert(`Error al eliminar: ${error.message}`)
            console.error(`Error al eliminar habitación: `, error)
        }
    }

    // cálculo de estadísticas para mostrar en la parte superior de la página
    const totalRooms = rooms.length
    const averagePrice = rooms.length > 0 ? Math.round(rooms.reduce((acc, room) => acc + room.price, 0) / rooms.length) : 0
    const minimumPrice = rooms.length > 0 ? Math.min(...rooms.map(room => room.price)) : 0

    // si el usuario accede desde un dispositivo móvil, se muestra un mensaje indicando que el panel de administración no está disponible en móvil
    if (isMobile) {
        return (
            <div className="admin admin--mobile-block">
                <div className="admin__mobile-message">
                    <span className="admin__mobile-icon">🖥️</span>
                    <h2>Panel no disponible en móvil</h2>
                    <p>El panel de administración está diseñado para usarse desde una computadora. Por favor accedé desde un dispositivo de escritorio.</p>
                </div>
            </div>
        )
    }

    if (view === 'menu') {
        return (
            <div className="admin">
                <div className="admin__content">

                    <div className="admin__header">
                        <div className="admin__header-info">
                            <h1>Panel de Administración</h1>
                            <p>Gestioná las habitaciones de Digital Booking</p>
                        </div>
                    </div>

                    {/* estadísticas */}
                    {!loading && !error && (
                        <div className="admin__stats">
                            <div className="admin__stat-card">
                                <div className="admin__stat-number">{totalRooms}</div>
                                <div className="admin__stat-label">Habitaciones totales</div>
                            </div>
                            <div className="admin__stat-card">
                                <div className="admin__stat-number">${averagePrice}</div>
                                <div className="admin__stat-label">Precio promedio</div>
                            </div>
                            <div className="admin__stat-card">
                                <div className="admin__stat-number">${minimumPrice}</div>
                                <div className="admin__stat-label">Precio más bajo</div>
                            </div>
                        </div>
                    )}

                    {/* menú de funciones */}
                    <div className="admin__menu">

                        <button
                            className="admin__menu-card"
                            onClick={() => setView('list')}
                        >
                            <span className="admin__menu-icon">📋</span>
                            <span className="admin__menu-title">Lista de productos</span>
                            <span className="admin__menu-desc">Visualizá todas las habitaciones disponibles</span>
                        </button>

                        <button
                            className="admin__menu-card"
                            onClick={() => setShowForm(true)}
                        >
                            <span className="admin__menu-icon">➕</span>
                            <span className="admin__menu-title">Agregar producto</span>
                            <span className="admin__menu-desc">Registrá una nueva habitación en el catálogo</span>
                        </button>

                    </div>

                </div>

                {showForm && (
                    <RoomForm
                        onClose={() => setShowForm(false)}
                        onRoomCreated={handleRoomCreated}
                    />
                )}
            </div>
        )
    }

    // tabla con todos los productos — columnas Id, Imagen, Nombre, Categoría, Precio, Acciones
    return (
        <div className="admin">
            <div className="admin__content">

                <div className="admin__header">
                    <div className="admin__header-info">
                        <h1>Lista de productos</h1>
                        <p>Todas las habitaciones disponibles en Digital Booking</p>
                    </div>
                    <div className="admin__header-actions">
                        <button
                            className="admin__btn-add"
                            onClick={() => setShowForm(true)}
                        >
                            + Agregar producto
                        </button>
                        <button
                            className="admin__btn-back"
                            onClick={() => setView('menu')}
                        >
                            ← Volver al menú
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="admin__state">
                        <div className="admin__spinner" />
                        <p>Cargando habitaciones...</p>
                    </div>

                ) : error ? (
                    <div className="admin__state">
                        <p>⚠️ {error}</p>
                        <button onClick={fetchRooms}>Reintentar</button>
                    </div>

                ) : (
                    <div className="admin__table-wrapper">
                        <table className="admin__table">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room.id}>

                                        <td className="admin__td-id">#{room.id}</td>

                                        <td>
                                            {room.imageRoom ? (
                                                <img
                                                    src={room.imageRoom}
                                                    alt={room.name}
                                                    className="admin__room-img"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none'
                                                        e.target.nextSibling.style.display = 'flex'
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="admin__room-img-placeholder"
                                                style={{ display: room.imageRoom ? 'none' : 'flex' }}
                                            >
                                                🏨
                                            </div>
                                        </td>

                                        <td>{room.name}</td>

                                        <td>
                                            <span className="admin__badge">{room.category}</span>
                                        </td>

                                        <td>
                                            <span className="admin__price">${room.price}</span>
                                        </td>

                                        <td>
                                            <button
                                                className="admin__btn-delete"
                                                onClick={() => handleDelete(room.id, room.name)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {showForm && (
                <RoomForm
                    onClose={() => setShowForm(false)}
                    onRoomCreated={handleRoomCreated}
                />
            )}
        </div>
    )
}

export default Admin