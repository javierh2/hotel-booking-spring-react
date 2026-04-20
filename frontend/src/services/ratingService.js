const BASE_URL = "http://localhost:8080/api/ratings"

// lee el token del localStorage — mismo patrón que roomService y favoriteService
const getAuthHeader = () => {
    const stored = localStorage.getItem("db_user")
    if (!stored) return {}
    const user = JSON.parse(stored)
    return { "Authorization": `Bearer ${user.token}` }
}

// trae todas las reseñas de una room — público, sin token
export const getRatingsByRoom = async (roomId) => {
    const response = await fetch(`${BASE_URL}/room/${roomId}`)
    if (!response.ok) throw new Error(`Error ${response.status}`)
    return response.json()
}

// consulta si el usuario autenticado puede puntuar esta room
// devuelve { canRate: boolean }
export const canUserRate = async (roomId) => {
    const response = await fetch(`${BASE_URL}/room/${roomId}/can-rate`, {
        headers: { ...getAuthHeader() }
    })
    if (!response.ok) throw new Error(`Error ${response.status}`)
    return response.json()
}

// envía una nueva reseña, requiere token
// body: { stars: number, comment: string | null }
export const createRating = async (roomId, stars, comment) => {
    const response = await fetch(`${BASE_URL}/room/${roomId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify({ stars, comment: comment || null })
    })
    if (!response.ok) throw new Error(`Error ${response.status}`)
    return response.json()
}