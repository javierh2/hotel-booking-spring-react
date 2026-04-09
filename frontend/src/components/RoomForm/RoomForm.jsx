import { useEffect, useState } from 'react'
import './RoomForm.css'
import { createRoom, updateRoom } from '../../services/roomService'
import { getAllCategories } from '../../services/categoryService'
import { getAllFeatures } from '../../services/featureService'

// modal para crear o editar una habitación
// si recibe roomToEdit → modo edición (PUT), pre-llena el formulario
// si no recibe roomToEdit → modo creación (POST), formulario vacío
const RoomForm = ({ onClose, onRoomCreated, onRoomUpdated, roomToEdit }) => {

    // inicializamos formData con los datos de roomToEdit si existe
    // o con valores vacíos si es creación
    // la función lazy del useState se ejecuta solo una vez al montar
    // evita recalcular en cada render
    const [formData, setFormData] = useState(() => ({
        name: roomToEdit?.name || "",
        description: roomToEdit?.description || "",
        // categoryId viene como objeto {id, title} en roomToEdit — extraemos solo el id
        categoryId: roomToEdit?.category?.id?.toString() || "",
        price: roomToEdit?.price?.toString() || "",
        imageRoom: roomToEdit?.imageRoom || "",
    }))

    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(true)

    const [features, setFeatures] = useState([])
    const [loadingFeatures, setLoadingFeatures] = useState(true)

    // inicializamos el Set con los ids de las features que ya tiene la room
    // si es creación el Set arranca vacío
    // roomToEdit?.features es un array de FeatureResponseDTO — extraemos los ids
    const [selectedFeatureIds, setSelectedFeatureIds] = useState(() => {
        if (roomToEdit?.features) {
            return new Set(roomToEdit.features.map(f => f.id))
        }
        return new Set()
    })

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories()
                setCategories(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Error al cargar las categorías: ", error)
            } finally {
                setLoadingCategories(false)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const data = await getAllFeatures()
                setFeatures(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Error al cargar las características: ", error)
            } finally {
                setLoadingFeatures(false)
            }
        }
        fetchFeatures()
    }, [])

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

    // toggle de feature — creamos Set nuevo para que React detecte el cambio
    const handleFeatureToggle = (featureId) => {
        setSelectedFeatureIds(prev => {
            const next = new Set(prev)
            if (next.has(featureId)) {
                next.delete(featureId)
            } else {
                next.add(featureId)
            }
            return next
        })
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio"
        if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria"
        if (!formData.categoryId) newErrors.categoryId = "La categoría es obligatoria"
        if (!formData.price) {
            newErrors.price = "El precio es obligatorio"
        } else if (Number(formData.price) <= 0) {
            newErrors.price = "El precio debe ser mayor a 0"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSubmitting(true)
        try {
            const roomData = {
                ...formData,
                price: Number(formData.price),
                categoryId: Number(formData.categoryId),
                imageRoom: formData.imageRoom.trim() === '' ? null : formData.imageRoom.trim(),
                featureIds: [...selectedFeatureIds]
            }

            if (roomToEdit) {
                // modo edición — PUT /api/rooms/{id}
                const updated = await updateRoom(roomToEdit.id, roomData)
                // avisamos a Admin con la room actualizada para que refresque la tabla
                onRoomUpdated(updated)
            } else {
                // modo creación — POST /api/rooms
                const newRoom = await createRoom(roomData)
                // avisamos a Admin con la room nueva para que la agregue a la tabla
                onRoomCreated(newRoom)
            }
            onClose()
        } catch (error) {
            setErrors({ name: "Ya existe una habitación con ese nombre" })
            console.error("Error al guardar la habitación:", error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) onClose()
    }

    // el título y el texto del botón cambian según el modo
    const isEditMode = !!roomToEdit

    return (
        <div className="room-form-overlay" onClick={handleOverlayClick}>
            <div className="room-form">

                <div className="room-form__header">
                    <h2 className="room-form__title">
                        {isEditMode ? 'Editar habitación' : 'Nueva habitación'}
                    </h2>
                    <button className="room-form__close" onClick={onClose}>✕</button>
                </div>

                {/* nombre */}
                <div className="room-form__group">
                    <label className="room-form__label">Nombre <span>*</span></label>
                    <input
                        type="text"
                        name="name"
                        className={`room-form__input ${errors.name ? 'room-form__input--error' : ''}`}
                        placeholder="Ej: Suite Presidencial"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && <span className="room-form__error">{errors.name}</span>}
                </div>

                {/* descripción */}
                <div className="room-form__group">
                    <label className="room-form__label">Descripción <span>*</span></label>
                    <textarea
                        name="description"
                        className={`room-form__textarea ${errors.description ? 'room-form__textarea--error' : ''}`}
                        placeholder="Describí la habitación..."
                        value={formData.description}
                        onChange={handleChange}
                    />
                    {errors.description && <span className="room-form__error">{errors.description}</span>}
                </div>

                {/* precio y categoría */}
                <div className="room-form__row">

                    <div className="room-form__group">
                        <label className="room-form__label">Precio por noche <span>*</span></label>
                        <input
                            type="number"
                            name="price"
                            className={`room-form__input ${errors.price ? 'room-form__input--error' : ''}`}
                            placeholder="Ej: 150"
                            value={formData.price}
                            onChange={handleChange}
                            min="1"
                        />
                        {errors.price && <span className="room-form__error">{errors.price}</span>}
                    </div>

                    <div className="room-form__group">
                        <label className="room-form__label">Categoría <span>*</span></label>
                        <select
                            name="categoryId"
                            className={`room-form__select ${errors.categoryId ? 'room-form__select--error' : ''}`}
                            value={formData.categoryId}
                            onChange={handleChange}
                            disabled={loadingCategories}
                        >
                            <option value="">
                                {loadingCategories ? "Cargando..." : "Seleccioná..."}
                            </option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.title}
                                </option>
                            ))}
                            {!loadingCategories && categories.length === 0 && (
                                <option value="" disabled>Sin categorías disponibles</option>
                            )}
                        </select>
                        {errors.categoryId && <span className="room-form__error">{errors.categoryId}</span>}
                    </div>

                </div>

                {/* características — chips seleccionables, múltiple selección en modo edición los chips ya seleccionados aparecen marcados */}
                <div className="room-form__group">
                    <label className="room-form__label">
                        Características <span style={{ color: '#9E8E82', fontWeight: 400 }}>(opcional)</span>
                    </label>
                    {loadingFeatures ? (
                        <p className="room-form__loading-text">Cargando características...</p>
                    ) : features.length === 0 ? (
                        <p className="room-form__loading-text">No hay características disponibles</p>
                    ) : (
                        <div className="room-form__features-grid">
                            {features.map(feature => (
                                <button
                                    key={feature.id}
                                    type="button"
                                    className={`room-form__feature-chip ${selectedFeatureIds.has(feature.id) ? 'room-form__feature-chip--selected' : ''}`}
                                    onClick={() => handleFeatureToggle(feature.id)}
                                >
                                    {feature.icon && (
                                        <span className="room-form__feature-chip-icon">{feature.icon}</span>
                                    )}
                                    {feature.name}
                                </button>
                            ))}
                        </div>
                    )}
                    {selectedFeatureIds.size > 0 && (
                        <span className="room-form__features-count">
                            {selectedFeatureIds.size} característica{selectedFeatureIds.size !== 1 ? 's' : ''} seleccionada{selectedFeatureIds.size !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* imagen */}
                <div className="room-form__group">
                    <label className="room-form__label">
                        URL de imagen <span style={{ color: '#9E8E82', fontWeight: 400 }}>(opcional)</span>
                    </label>
                    <input
                        type="text"
                        name="imageRoom"
                        className="room-form__input"
                        placeholder="https://..."
                        value={formData.imageRoom}
                        onChange={handleChange}
                    />
                </div>

                {/* botones */}
                <div className="room-form__actions">
                    <button className="room-form__btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="room-form__btn-submit"
                        onClick={handleSubmit}
                        disabled={submitting || loadingCategories}
                    >
                        {submitting
                            ? 'Guardando...'
                            : isEditMode ? 'Guardar cambios' : 'Guardar habitación'
                        }
                    </button>
                </div>

            </div>
        </div>
    )
}

export default RoomForm