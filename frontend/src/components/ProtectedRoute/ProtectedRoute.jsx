import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// componente que protege rutas según estado de autenticación y rol
// requireAdmin: si es true, además de estar logueado necesita ROLE_ADMIN
// si no está autenticado → redirige a /login
// si está autenticado pero no tiene el rol → redirige a /
// si cumple las condiciones → renderiza el children normalmente
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin } = useAuth()

    if (!isAuthenticated) {
        // guardamos el intento de navegación para poder volver después del login
        return <Navigate to="/login" replace />
    }

    if (requireAdmin && !isAdmin) {
        // está logueado pero no tiene permisos de admin
        // replace evita que quede en el historial — el usuario no puede volver con el botón atrás
        return <Navigate to="/" replace />
    }

    // cumple todas las condiciones — renderiza el contenido protegido
    return children
}

export default ProtectedRoute