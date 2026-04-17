const BASE_URL = "http://localhost:8080/api/favorites"

// lee el token del localStorage — mismo patrón que roomService
const getAuthHeader = () => {
    const stored = localStorage.getItem("db_user")
    if (!stored) return {}
    const user = JSON.parse(stored)
    return { "Authorization": `Bearer ${user.token}` }
}

// trae las rooms favoritas completas del usuario logueado
export const getFavoriteRooms = async () => {
    const response = await fetch(BASE_URL, {
        headers: { ...getAuthHeader() }
    })
    if (!response.ok) throw new Error(`Error ${response.status}`)
    return response.json()
}

// trae solo los ids de rooms favoritas — para inicializar los corazones activos
// más eficiente que traer los objetos completos
export const getFavoriteIds = async () => {
    const response = await fetch(`${BASE_URL}/ids`, {
        headers: { ...getAuthHeader() }
    })
    if (!response.ok) throw new Error(`Error ${response.status}`)
    return response.json()
}

// agrega una room a favoritos
export const addFavorite = async (roomId) => {
    const response = await fetch(`${BASE_URL}/${roomId}`, {
        method: "POST",
        headers: { ...getAuthHeader() }
    })
    if (!response.ok) throw new Error(`Error ${response.status}`)
}

// quita una room de favoritos
export const removeFavorite = async (roomId) => {
    const response = await fetch(`${BASE_URL}/${roomId}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() }
    })
    if (!response.ok) throw new Error(`Error ${response.status}`)
}