import { useNavigate } from 'react-router-dom'
import './Register.css'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { registerUser } from '../../services/authService'

// pagina para registrar un usuario; en formulario con campos obligarios (nombre, apellido, email y contraseña),
// validacion front mas el manejo de errores del back
const Register = () => {


    const navigate = useNavigate()
    // obtenemos la función de login del contexto de autenticación para loguear al usuario automáticamente después de registrarse
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    // función para manejar el cambio en los campos del formulario, actualiza el estado formData y limpia el error correspondiente si es que existe
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }))
        }
    }


    // función para validar los campos del formulario, actualiza el estado errors con los mensajes de error correspondientes y devuelve true si no hay errores
    const validate = () => {
        const newErrors = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = "El nombre es obligatorio"
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = "El apellido es obligatorio"
        }
        if (!formData.email.trim()) {
            newErrors.email = "El email es obligatorio"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "El email debe tener un formato válido"
        }
        if (!formData.password) {
            newErrors.password = "La contraseña es obligatoria"
        } else if (formData.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }


    // función para manejar el submit del formulario, valida los campos, muestra un mensaje de error si no son válidos,
    // llama a la función registerUser del servicio de autenticación para registrar al usuario,
    // loguea al usuario automáticamente y navega a la página principal
    const handleSubmit = async () => {
        if (!validate()) return
        setSubmitting(true)
        try {
            const data = await registerUser(formData)
            login(data)
            navigate("/")
        } catch (error) {
            setErrors({ email: error.message })
        } finally {
            setSubmitting(false)
        }
    }


    return (
        <div className="register">
            <div className="register__card">

                <div className="register__header">
                    <h1 className="register__title">Crear cuenta</h1>
                    <p className="register__subtitle">Registrate para acceder a todas las funcionalidades</p>
                </div>

                <div className="register__form">

                    {/* nombre y apellido en la misma fila */}
                    <div className="register__row">
                        <div className="register__group">
                            <label className="register__label">
                                Nombre <span className="register__required">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                className={`register__input ${errors.firstName ? 'register__input--error' : ''}`}
                                placeholder="Ej: Juan"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            {errors.firstName && (
                                <span className="register__error">{errors.firstName}</span>
                            )}
                        </div>

                        <div className="register__group">
                            <label className="register__label">
                                Apellido <span className="register__required">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                className={`register__input ${errors.lastName ? 'register__input--error' : ''}`}
                                placeholder="Ej: Pérez"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                            {errors.lastName && (
                                <span className="register__error">{errors.lastName}</span>
                            )}
                        </div>
                    </div>

                    <div className="register__group">
                        <label className="register__label">
                            Email <span className="register__required">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            className={`register__input ${errors.email ? 'register__input--error' : ''}`}
                            placeholder="Ej: juanperez@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && (
                            <span className="register__error">{errors.email}</span>
                        )}
                    </div>

                    <div className="register__group">
                        <label className="register__label">
                            Contraseña <span className="register__required">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            className={`register__input ${errors.password ? 'register__input--error' : ''}`}
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && (
                            <span className="register__error">{errors.password}</span>
                        )}
                    </div>

                    <button
                        className="register__btn-submit"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>

                    <p className="register__login-link">
                        ¿Ya tenés cuenta?{' '}
                        <span
                            className="register__login-link-action"
                            onClick={() => navigate('/login')}
                        >
                            Iniciá sesión
                        </span>
                    </p>

                </div>
            </div>
        </div>
    )

}

export default Register