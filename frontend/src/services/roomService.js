const BASE_URL = "http://localhost:8080/api/rooms"

// lee el token del localStorage y arma el header Authorization.
// se usa solo en POST y DELETE que requieren ROLE_ADMIN.
// GET es público y no necesita token.
const getAuthHeader = () => {
    const stored = localStorage.getItem("db_user")
    if (!stored) return {}
    const user = JSON.parse(stored)
    return { "Authorization": `Bearer ${user.token}` }
}

export const getRandomRooms = async () => {
    const response = await fetch(`${BASE_URL}/random`)
    if (!response.ok) {
        throw new Error(`Error ${response.status}: no se pueden cargar las habitaciones, intente más tarde`)
    }
    return response.json()
}

export const getAllRooms = async () => {
    const response = await fetch(BASE_URL)
    if (!response.ok) {
        throw new Error(`Error ${response.status}: no se pueden cargar las habitaciones, intente más tarde`)
    }
    return response.json()
}

export const getRoomById = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`)
    if (!response.ok) {
        throw new Error(`Error ${response.status}: no se pudo encontrar esa habitación particular`)
    }
    return response.json()
}

// requiere ROLE_ADMIN — manda el token en Authorization
export const deleteRoom = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeader()
        }
    })
    if (!response.ok) {
        throw new Error(`Error ${response.status}: no se pudo eliminar la habitación seleccionada`)
    }
    return response
}

// requiere ROLE_ADMIN — manda el token en Authorization
export const createRoom = async (roomData) => {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify(roomData)
    })
    if (!response.ok) {
        throw new Error(`Error ${response.status}: no se pudo crear la habitación`)
    }
    return response.json()
}