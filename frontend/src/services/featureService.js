const BASE_URL = "http://localhost:8080/api/features"

// obtiene el token del localStorage y lo guarda AuthContext al hacer login
const getToken = () => {
    const user = JSON.parse(localStorage.getItem("db_user"))
    return user?.token || null
}

// GET público, sin token
// usado en Admin para listar las features y en RoomForm para el selector
export const getAllFeatures = async () => {
    const response = await fetch(BASE_URL)
    if (!response.ok) {
        throw new Error("Error al obtener las características")
    }
    return response.json()
}

// POST requiere token de ADMIN
// dto = { name: string, icon: string }
export const createFeature = async (dto) => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(dto)
    })
    if (!response.ok) {
        throw new Error("Error al crear la característica")
    }
    return response.json()
}

// DELETE requiere token de ADMIN
// no devuelve body, el backend responde 204 No Content
export const deleteFeature = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    })
    if (!response.ok) {
        throw new Error("Error al eliminar la característica")
    }
}