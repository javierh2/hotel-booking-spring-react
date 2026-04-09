import { useEffect, useState } from 'react';
import { deleteRoom, getAllRooms } from '../../services/roomService'
import { createFeature, deleteFeature, getAllFeatures } from '../../services/featureService';
import { getAllUsers, updateUserRole } from '../../services/userService';
import { createCategory, deleteCategory, getAllCategories } from '../../services/categoryService';
import RoomForm from '../../components/RoomForm/RoomForm'
import './Admin.css'

// página de administración — maneja habitaciones, características, categorías y usuarios
const Admin = () => {

    // ─── estado de rooms ──────────────────────────────────────────────────────
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    // room seleccionada para editar — null significa que no hay edición en curso
    const [roomToEdit, setRoomToEdit] = useState(null)

    // controla qué vista se renderiza: 'menu' | 'list' | 'features' | 'users' | 'categories'
    const [view, setView] = useState('menu')

    // ─── estado de features ───────────────────────────────────────────────────
    const [features, setFeatures] = useState([])
    const [loadingFeatures, setLoadingFeatures] = useState(false)
    const [newFeature, setNewFeature] = useState({ name: "", icon: "" })
    const [featureError, setFeatureError] = useState("")
    const [savingFeature, setSavingFeature] = useState(false)

    // ─── estado de usuarios — HU #16 ─────────────────────────────────────────
    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    // id del usuario cuyo rol está siendo cambiado en este momento
    // sirve para deshabilitar solo ese botón mientras espera la respuesta
    const [updatingUserId, setUpdatingUserId] = useState(null)

    // ─── estado de categorías — HU #21 ───────────────────────────────────────
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [newCategory, setNewCategory] = useState({ title: '', description: '', imageUrl: '' })
    const [categoryError, setCategoryError] = useState('')
    const [savingCategory, setSavingCategory] = useState(false)

    // ─── detección de mobile ──────────────────────────────────────────────────
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // ─── carga de habitaciones ────────────────────────────────────────────────
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

    // ─── carga lazy por vista — un solo useEffect para todas las vistas ───────
    // cada vista carga sus datos solo cuando se necesitan
    // evita hacer 4 requests al montar el componente si el admin quizás
    // solo entra a "Lista de productos"
    const fetchFeatures = async () => {
        setLoadingFeatures(true)
        try {
            const data = await getAllFeatures()
            setFeatures(data)
        } catch (error) {
            console.error('Error al cargar características:', error)
        } finally {
            setLoadingFeatures(false)
        }
    }

    const fetchUsers = async () => {
        setLoadingUsers(true)
        try {
            const data = await getAllUsers()
            setUsers(data)
        } catch (error) {
            console.error('Error al cargar usuarios:', error)
        } finally {
            setLoadingUsers(false)
        }
    }

    const fetchCategories = async () => {
        setLoadingCategories(true)
        try {
            const data = await getAllCategories()
            setCategories(data)
        } catch (error) {
            console.error('Error al cargar categorías:', error)
        } finally {
            setLoadingCategories(false)
        }
    }

    useEffect(() => {
        if (view === 'features') fetchFeatures()
        if (view === 'users') fetchUsers()
        // cuando el admin entra a la vista de categorías cargamos la lista
        if (view === 'categories') fetchCategories()
    }, [view])

    // ─── handlers de rooms ────────────────────────────────────────────────────
    const handleRoomCreated = (newRoom) => {
        setRooms(prev => [...prev, newRoom])
    }

    // actualiza la room modificada en el estado local sin recargar toda la lista
    // mismo patrón que handleRoomCreated pero con map en lugar de push
    const handleRoomUpdated = (updatedRoom) => {
        setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r))
    }

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

    // ─── handlers de features ─────────────────────────────────────────────────
    const handleFeatureChange = (event) => {
        const { name, value } = event.target
        setNewFeature(prev => ({ ...prev, [name]: value }))
        if (featureError) setFeatureError('')
    }

    const handleCreateFeature = async () => {
        if (!newFeature.name.trim()) {
            setFeatureError('El nombre es obligatorio')
            return
        }
        setSavingFeature(true)
        try {
            const created = await createFeature({
                name: newFeature.name.trim(),
                icon: newFeature.icon.trim()
            })
            setFeatures(prev => [...prev, created])
            setNewFeature({ name: '', icon: '' })
        } catch (error) {
            setFeatureError('Ya existe una característica con ese nombre')
            console.error('Error al crear característica:', error)
        } finally {
            setSavingFeature(false)
        }
    }

    const handleDeleteFeature = async (id, name) => {
        const confirmation = window.confirm(
            `¿Eliminar la característica "${name}"? Se quitará de todas las habitaciones que la tengan asignada.`
        )
        if (!confirmation) return
        try {
            await deleteFeature(id)
            setFeatures(prev => prev.filter(f => f.id !== id))
        } catch (error) {
            alert(`Error al eliminar: ${error.message}`)
        }
    }

    // ─── handlers de categorías — HU #21 ─────────────────────────────────────
    const handleCategoryChange = (event) => {
        const { name, value } = event.target
        setNewCategory(prev => ({ ...prev, [name]: value }))
        // limpiamos el error apenas el usuario empieza a corregir
        if (categoryError) setCategoryError('')
    }

    const handleCreateCategory = async () => {
        // título y descripción son obligatorios según CategoryRequestDTO
        // imageUrl es opcional
        if (!newCategory.title.trim()) {
            setCategoryError('El título es obligatorio')
            return
        }
        if (!newCategory.description.trim()) {
            setCategoryError('La descripción es obligatoria')
            return
        }
        setSavingCategory(true)
        try {
            const created = await createCategory({
                title: newCategory.title.trim(),
                description: newCategory.description.trim(),
                // imageUrl vacío lo mandamos como null — el backend acepta null
                imageUrl: newCategory.imageUrl.trim() || null
            })
            // agregamos al estado local sin recargar toda la lista — mismo patrón que features
            setCategories(prev => [...prev, created])
            setNewCategory({ title: '', description: '', imageUrl: '' })
        } catch (error) {
            setCategoryError('Ya existe una categoría con ese título')
            console.error('Error al crear categoría:', error)
        } finally {
            setSavingCategory(false)
        }
    }

    const handleDeleteCategory = async (id, title) => {
        const confirmation = window.confirm(
            `¿Eliminar la categoría "${title}"? Las habitaciones asignadas a esta categoría quedarán sin categoría.`
        )
        if (!confirmation) return
        try {
            await deleteCategory(id)
            setCategories(prev => prev.filter(c => c.id !== id))
        } catch (error) {
            alert(`Error al eliminar: ${error.message}`)
        }
    }

    // ─── handler de rol de usuarios — HU #16 ─────────────────────────────────
    const handleRoleToggle = async (user) => {
        const newRole = user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN'
        const action = newRole === 'ROLE_ADMIN' ? 'promover a administrador' : 'quitar permisos de administrador a'
        const confirmation = window.confirm(
            `¿Estás seguro de querer ${action} "${user.firstName} ${user.lastName}"?`
        )
        if (!confirmation) return
        setUpdatingUserId(user.id)
        try {
            const updated = await updateUserRole(user.id, newRole)
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
        } catch (error) {
            alert(`Error al actualizar el rol: ${error.message}`)
            console.error('Error al actualizar rol:', error)
        } finally {
            setUpdatingUserId(null)
        }
    }

    // ─── estadísticas ─────────────────────────────────────────────────────────
    const totalRooms = rooms.length
    const averagePrice = rooms.length > 0 ? Math.round(rooms.reduce((acc, room) => acc + room.price, 0) / rooms.length) : 0
    const minimumPrice = rooms.length > 0 ? Math.min(...rooms.map(room => room.price)) : 0

    // ─── bloqueo mobile ───────────────────────────────────────────────────────
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

    // ─── vista: menú principal ────────────────────────────────────────────────
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

                        <button className="admin__menu-card" onClick={() => setView('list')}>
                            <span className="admin__menu-icon">📋</span>
                            <span className="admin__menu-title">Lista de productos</span>
                            <span className="admin__menu-desc">Visualizá todas las habitaciones disponibles</span>
                        </button>

                        <button className="admin__menu-card" onClick={() => setShowForm(true)}>
                            <span className="admin__menu-icon">➕</span>
                            <span className="admin__menu-title">Agregar producto</span>
                            <span className="admin__menu-desc">Registrá una nueva habitación en el catálogo</span>
                        </button>

                        <button className="admin__menu-card" onClick={() => setView('features')}>
                            <span className="admin__menu-icon">✨</span>
                            <span className="admin__menu-title">Administrar características</span>
                            <span className="admin__menu-desc">Agregá, editá y eliminá características de productos</span>
                        </button>

                        {/* nueva card — HU #21 */}
                        <button className="admin__menu-card" onClick={() => setView('categories')}>
                            <span className="admin__menu-icon">🏷️</span>
                            <span className="admin__menu-title">Agregar categoría</span>
                            <span className="admin__menu-desc">Creá y gestioná las categorías del catálogo</span>
                        </button>

                        <button className="admin__menu-card" onClick={() => setView('users')}>
                            <span className="admin__menu-icon">👥</span>
                            <span className="admin__menu-title">Gestionar usuarios</span>
                            <span className="admin__menu-desc">Asigná o quitá permisos de administrador</span>
                        </button>

                    </div>

                </div>

                {showForm && (
                    <RoomForm
                        onClose={() => setShowForm(false)}
                        onRoomCreated={handleRoomCreated}
                        onRoomUpdated={handleRoomUpdated}
                        roomToEdit={null}
                    />
                )}
            </div>
        )
    }

    // ─── vista: características — HU #17 ──────────────────────────────────────
    if (view === 'features') {
        return (
            <div className="admin">
                <div className="admin__content">

                    <div className="admin__header">
                        <div className="admin__header-info">
                            <h1>Administrar características</h1>
                            <p>Características disponibles para asignar a las habitaciones</p>
                        </div>
                        <div className="admin__header-actions">
                            <button className="admin__btn-back" onClick={() => setView('menu')}>
                                ← Volver al menú
                            </button>
                        </div>
                    </div>

                    <div className="admin__feature-form">
                        <h2 className="admin__feature-form-title">Añadir nueva característica</h2>
                        <div className="admin__feature-form-row">

                            <div className="admin__feature-form-group">
                                <label className="admin__feature-label">Nombre *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className={`admin__feature-input ${featureError ? 'admin__feature-input--error' : ''}`}
                                    placeholder="Ej: WiFi, Pileta, Desayuno..."
                                    value={newFeature.name}
                                    onChange={handleFeatureChange}
                                />
                                {featureError && <span className="admin__feature-error">{featureError}</span>}
                            </div>

                            <div className="admin__feature-form-group">
                                <label className="admin__feature-label">
                                    Ícono <span className="admin__feature-label--optional">(opcional — emoji)</span>
                                </label>
                                <input
                                    type="text"
                                    name="icon"
                                    className="admin__feature-input"
                                    placeholder="Ej: 📶 🏊 🍳"
                                    value={newFeature.icon}
                                    onChange={handleFeatureChange}
                                />
                            </div>

                            {(newFeature.icon || newFeature.name) && (
                                <div className="admin__feature-preview">
                                    <span className="admin__feature-label">Preview</span>
                                    <div className="admin__feature-preview-item">
                                        <span>{newFeature.icon || '✦'}</span>
                                        <span>{newFeature.name || 'Nombre'}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                className="admin__btn-add admin__feature-btn-add"
                                onClick={handleCreateFeature}
                                disabled={savingFeature}
                            >
                                {savingFeature ? 'Guardando...' : '+ Añadir'}
                            </button>

                        </div>
                    </div>

                    {loadingFeatures ? (
                        <div className="admin__state">
                            <div className="admin__spinner" />
                            <p>Cargando características...</p>
                        </div>
                    ) : features.length === 0 ? (
                        <div className="admin__state">
                            <p>No hay características registradas. ¡Agregá la primera!</p>
                        </div>
                    ) : (
                        <div className="admin__table-wrapper">
                            <table className="admin__table">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Ícono</th>
                                        <th>Nombre</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {features.map(feature => (
                                        <tr key={feature.id}>
                                            <td className="admin__td-id">#{feature.id}</td>
                                            <td className="admin__feature-icon-cell">{feature.icon || '—'}</td>
                                            <td>{feature.name}</td>
                                            <td>
                                                <button
                                                    className="admin__btn-delete"
                                                    onClick={() => handleDeleteFeature(feature.id, feature.name)}
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
            </div>
        )
    }

    // ─── vista: categorías — HU #21 ───────────────────────────────────────────
    if (view === 'categories') {
        return (
            <div className="admin">
                <div className="admin__content">

                    <div className="admin__header">
                        <div className="admin__header-info">
                            <h1>Agregar categoría</h1>
                            <p>Creá y gestioná las categorías del catálogo</p>
                        </div>
                        <div className="admin__header-actions">
                            <button className="admin__btn-back" onClick={() => setView('menu')}>
                                ← Volver al menú
                            </button>
                        </div>
                    </div>

                    {/* formulario de nueva categoría — mismo patrón visual que features
                        pero con 3 campos: título, descripción e imageUrl */}
                    <div className="admin__feature-form">
                        <h2 className="admin__feature-form-title">Nueva categoría</h2>
                        <div className="admin__category-form-grid">

                            <div className="admin__feature-form-group">
                                <label className="admin__feature-label">Título *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className={`admin__feature-input ${categoryError ? 'admin__feature-input--error' : ''}`}
                                    placeholder="Ej: Suite, Hostel, Departamento..."
                                    value={newCategory.title}
                                    onChange={handleCategoryChange}
                                />
                                {categoryError && <span className="admin__feature-error">{categoryError}</span>}
                            </div>

                            <div className="admin__feature-form-group">
                                <label className="admin__feature-label">Descripción *</label>
                                <input
                                    type="text"
                                    name="description"
                                    className="admin__feature-input"
                                    placeholder="Ej: Habitaciones de lujo con vista al mar..."
                                    value={newCategory.description}
                                    onChange={handleCategoryChange}
                                />
                            </div>

                            <div className="admin__feature-form-group">
                                <label className="admin__feature-label">
                                    URL de imagen <span className="admin__feature-label--optional">(opcional)</span>
                                </label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    className="admin__feature-input"
                                    placeholder="https://..."
                                    value={newCategory.imageUrl}
                                    onChange={handleCategoryChange}
                                />
                            </div>

                            <button
                                className="admin__btn-add admin__feature-btn-add"
                                onClick={handleCreateCategory}
                                disabled={savingCategory}
                            >
                                {savingCategory ? 'Guardando...' : '+ Agregar categoría'}
                            </button>

                        </div>
                    </div>

                    {/* listado de categorías existentes */}
                    {loadingCategories ? (
                        <div className="admin__state">
                            <div className="admin__spinner" />
                            <p>Cargando categorías...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="admin__state">
                            <p>No hay categorías registradas. ¡Agregá la primera!</p>
                        </div>
                    ) : (
                        <div className="admin__table-wrapper">
                            <table className="admin__table">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Imagen</th>
                                        <th>Título</th>
                                        <th>Descripción</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(category => (
                                        <tr key={category.id}>
                                            <td className="admin__td-id">#{category.id}</td>
                                            <td>
                                                {category.imageUrl ? (
                                                    <img
                                                        src={category.imageUrl}
                                                        alt={category.title}
                                                        className="admin__room-img"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none'
                                                            e.target.nextSibling.style.display = 'flex'
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    className="admin__room-img-placeholder"
                                                    style={{ display: category.imageUrl ? 'none' : 'flex' }}
                                                >
                                                    🏷️
                                                </div>
                                            </td>
                                            <td>{category.title}</td>
                                            <td className="admin__td-desc">{category.description}</td>
                                            <td>
                                                <button
                                                    className="admin__btn-delete"
                                                    onClick={() => handleDeleteCategory(category.id, category.title)}
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
            </div>
        )
    }

    // ─── vista: usuarios — HU #16 ─────────────────────────────────────────────
    if (view === 'users') {
        return (
            <div className="admin">
                <div className="admin__content">

                    <div className="admin__header">
                        <div className="admin__header-info">
                            <h1>Gestionar usuarios</h1>
                            <p>Asigná o quitá permisos de administrador a los usuarios registrados</p>
                        </div>
                        <div className="admin__header-actions">
                            <button className="admin__btn-back" onClick={() => setView('menu')}>
                                ← Volver al menú
                            </button>
                        </div>
                    </div>

                    {loadingUsers ? (
                        <div className="admin__state">
                            <div className="admin__spinner" />
                            <p>Cargando usuarios...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="admin__state">
                            <p>No hay usuarios registrados.</p>
                        </div>
                    ) : (
                        <div className="admin__table-wrapper">
                            <table className="admin__table">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Rol actual</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="admin__td-id">#{user.id}</td>
                                            <td>{user.firstName} {user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`admin__badge ${user.role === 'ROLE_ADMIN' ? 'admin__badge--admin' : ''}`}>
                                                    {user.role === 'ROLE_ADMIN' ? 'Administrador' : 'Usuario'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={user.role === 'ROLE_ADMIN' ? 'admin__btn-delete' : 'admin__btn-promote'}
                                                    onClick={() => handleRoleToggle(user)}
                                                    disabled={updatingUserId === user.id}
                                                >
                                                    {updatingUserId === user.id
                                                        ? 'Actualizando...'
                                                        : user.role === 'ROLE_ADMIN'
                                                            ? 'Quitar admin'
                                                            : 'Hacer admin'
                                                    }
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        )
    }

    // ─── vista: lista de habitaciones ─────────────────────────────────────────
    return (
        <div className="admin">
            <div className="admin__content">

                <div className="admin__header">
                    <div className="admin__header-info">
                        <h1>Lista de productos</h1>
                        <p>Todas las habitaciones disponibles en Digital Booking</p>
                    </div>
                    <div className="admin__header-actions">
                        <button className="admin__btn-add" onClick={() => setShowForm(true)}>
                            + Agregar producto
                        </button>
                        <button className="admin__btn-back" onClick={() => setView('menu')}>
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
                                            <span className="admin__badge">{room.category?.title || "Sin categoría"}</span>
                                        </td>
                                        <td>
                                            <span className="admin__price">${room.price}</span>
                                        </td>
                                        <td>
                                            <div className="admin__actions-cell">
                                                <button
                                                    className="admin__btn-edit"
                                                    onClick={() => {
                                                        // guardamos la room a editar en el estado
                                                        // RoomForm la recibe como roomToEdit y pre-llena el formulario
                                                        setRoomToEdit(room)
                                                        setShowForm(true)
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="admin__btn-delete"
                                                    onClick={() => handleDelete(room.id, room.name)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
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
                    onClose={() => {
                        setShowForm(false)
                        // limpiamos roomToEdit al cerrar para que
                        // la próxima apertura sea siempre modo creación
                        setRoomToEdit(null)
                    }}
                    onRoomCreated={handleRoomCreated}
                    onRoomUpdated={handleRoomUpdated}
                    roomToEdit={roomToEdit}
                />
            )}
        </div>
    )
}

export default Admin