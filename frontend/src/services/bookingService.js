const BASE_URL = "http://localhost:8080/api/bookings"

const getAuthHeader = () => {
    const stored = localStorage.getItem("db_user")
    if (!stored) return {}
    const user = JSON.parse(stored)
    return { "Authorization": `Bearer ${user.token}` }
}

export const getOccupiedDates = async (roomId) => {
    const response = await fetch(`${BASE_URL}/room/${roomId}/occupied-dates`)
    if (!response.ok) throw new Error(`Error ${response.status}`)
    return response.json()
}


export const createBooking = async (roomId, checkIn, checkOut) => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify({ roomId, checkIn, checkOut })
    })
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || `Error ${response.status}`)
    }
    return response.json()
}