
const BASE_URL = "http://localhost:8080/api/auth"


// register llama a la API para crear un nuevo usuario, recibe un objeto con los datos del formulario de registro y devuelve la respuesta de la API
export const registerUser = async (data) => {
    const response = await fetch (`${BASE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    // si la respuesta no es "ok"(409 - 400), se lanza el error con el mensaje del backend para mostrarlo en el formulario o un mensaje genérico si no viene el mensaje específico del error
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.email || error.message || "Error al registrar usuario")
    }

    return response.json()
}


// login llama a la API para iniciar sesión, recibe un objeto con los datos del formulario de login y devuelve la respuesta de la API que incluye el token JWT
export const loginUser = async(data) =>{
    const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al iniciar sesión")
    }

    return response.json()
}