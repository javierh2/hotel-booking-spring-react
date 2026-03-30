import { useState } from 'react'
import './RoomForm.css'
import { createRoom } from '../../services/roomService'

// modal para crear una nueva habitación, se muestra al hacer click en el botón "Nueva Habitación" en la página de administración de habitaciones
const RoomForm = ({ onClose, onRoomCreated }) => {

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        categoryId: "",
        price: "",
        imageRoom: "",
    })

    // objeto para almacenar los errores de validación de cada campo
    const [errors, setErrors] = useState({})

    // estado para controlar si el formulario se está enviando, para deshabilitar el botón de submit y mostrar un mensaje de "Guardando..." mientras se espera la respuesta del backend
    const [submitting, setSubmitting] = useState(false)


    // función para manejar los cambios en los campos del formulario, actualiza el estado formData y borra el error correspondiente si es que existe
    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }))
        }
    }

    // función para validar los campos del formulario desde el frontend, verifica que los campos obligatorios no estén vacíos y que el precio sea un número mayor a 0, si hay errores actualiza el estado errors con los mensajes correspondientes
    const validate = () => {
        const newErrors = {}
        if (!formData.name.trim()) {
            newErrors.name = "El nombre es obligatorio"
        }
        if (!formData.description.trim()) {
            newErrors.description = "La descripción es obligatoria"
        }
        if (!formData.categoryId) {
            newErrors.categoryId = "La categoría es obligatoria"
        }
        if (!formData.price) {
            newErrors.price = "El precio es obligatorio"
        } else if (Number(formData.price) <= 0) {
            newErrors.price = "El precio debe ser mayor a 0"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0 // si el objeto errors está vacío, la validación es exitosa, de lo contrario hay errores y se muestra el mensaje correspondiente debajo de cada campo con error
    }


    // función para manejar el envío del formulario, primero valida los campos y si la validación es exitosa,
    // llama a la función createRoom del servicio de habitaciones para enviar los datos al backend,
    // mientras se espera la respuesta se deshabilita el botón de submit y se muestra un mensaje de "Guardando...", si la creación es exitosa se llama a la función onRoomCreated para
    // actualizar la lista de habitaciones en la página de administración y se cierra el modal,
    // si hay un error se actualiza el estado errors con un mensaje específico para el campo de nombre
    const handleSubmit = async () => {
        if (!validate()) return
        setSubmitting(true)
        try {
            const roomData = {
                ...formData,
                price: Number(formData.price),
                imageRoom: formData.imageRoom.trim() === '' ? null : formData.imageRoom.trim()
            }
            const newRoom = await createRoom(roomData)
            onRoomCreated(newRoom)
            onClose()
        } catch (error) {
            setErrors({ name: "Ya existe una habitación con ese nombre" })
            console.error("Error al crear la habitación:", error)
        } finally {
            setSubmitting(false)
        }
    }

    // función para manejar el click en el overlay del modal, si el click se hizo en el overlay (y no en el contenido del modal) se cierra el modal llamando a la función onClose
    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="room-form-overlay" onClick={handleOverlayClick}>
            <div className="room-form">

                {/* encabezado  */}
                <div className="room-form__header">
                    <h2 className="room-form__title">Nueva Habitación</h2>
                    <button className="room-form__close" onClick={onClose}>
                        X
                    </button>
                </div>

                {/*  nombre  */}
                <div className="room-form__group">
                    <label className="room-form__label">
                        Nombre <span>*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        className={`room-form__input ${errors.name ? 'room-form__input--error' : ''}`}
                        placeholder="Ej: Suite Presidencial"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && (
                        <span className="room-form__error">{errors.name}</span>
                    )}
                </div>

                {/*  descripción  */}
                <div className="room-form__group">
                    <label className="room-form__label">
                        Descripción <span>*</span>
                    </label>
                    <textarea
                        name="description"
                        className={`room-form__textarea ${errors.description ? 'room-form__textarea--error' : ''}`}
                        placeholder="Describí la habitación..."
                        value={formData.description}
                        onChange={handleChange}
                    />
                    {errors.description && (
                        <span className="room-form__error">{errors.description}</span>
                    )}
                </div>

                {/* precio y categoria */}
                <div className="room-form__row">

                    <div className="room-form__group">
                        <label className="room-form__label">
                            Precio por noche <span>*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            className={`room-form__input ${errors.price ? 'room-form__input--error' : ''}`}
                            placeholder="Ej: 150"
                            value={formData.price}
                            onChange={handleChange}
                            min="1"
                        />
                        {errors.price && (
                            <span className="room-form__error">{errors.price}</span>
                        )}
                    </div>

                    <div className="room-form__group">
                        <label className="room-form__label">
                            Categoría <span>*</span>
                        </label>
                        <select
                            name="categoryId"
                            className={`room-form__select ${errors.categoryId ? 'room-form__select--error' : ''}`}
                            value={formData.categoryId}
                            onChange={handleChange}
                        >
                            <option value="">Seleccioná...</option>
                            <option value="1">Suite</option>
                            <option value="2">Estándar</option>
                            <option value="3">Departamento</option>
                            <option value="4">Hostel</option>
                            <option value="5">Bed & Breakfast</option>
                        </select>
                        {errors.categoryId && (
                            <span className="room-form__error">{errors.categoryId}</span>
                        )}
                    </div>

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
                    <button
                        className="room-form__btn-cancel"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="room-form__btn-submit"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Guardando...' : 'Guardar habitación'}
                    </button>
                </div>

            </div>
        </div>
    )

}

export default RoomForm