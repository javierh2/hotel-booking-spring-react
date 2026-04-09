const BASE_URL = 'http://localhost:8080/api/users'

// lee el token del localStorage usando la key "db_user" — igual que featureService
// los endpoints de /api/users requieren ROLE_ADMIN
const getToken = () => {
    const user = JSON.parse(localStorage.getItem("db_user"))
    return user?.token || null
}

// GET /api/users — devuelve todos los usuarios registrados
// solo ROLE_ADMIN puede llamar este endpoint — SecurityConfig lo garantiza
export const getAllUsers = async () => {
    const response = await fetch(BASE_URL, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    })
    if (!response.ok) {
        throw new Error('Error al obtener los usuarios')
    }
    return response.json()
}

// PUT /api/users/{id}/role — cambia el rol de un usuario
// newRole es el string del enum: "ROLE_ADMIN" o "ROLE_USER"
export const updateUserRole = async (id, newRole) => {
    const response = await fetch(`${BASE_URL}/${id}/role`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        // el backend espera RoleUpdateRequestDTO con campo "role"
        body: JSON.stringify({ role: newRole })
    })
    if (!response.ok) {
        throw new Error('Error al actualizar el rol')
    }
    return response.json()
}