const BASE_URL = "http://localhost:8080/api/categories"


// helper que lee el token de localStorage
const getAuthHeader = () => {
    const stored = localStorage.getItem("db_user")
    if (!stored) return {}
    const user = JSON.parse(stored)
    return {"Authorization": `Bearer ${user.token}`}
}

// público, no necesita token de validación, usado en el Home y Form
export const getAllCategories = async() => {
    const response = await fetch(BASE_URL)
    if (!response.ok){
        throw new Error(`Error ${response.status}: no se pudieron cargar las categorias`);
    }
    return response.json()
}

// requiere ROLE_ADMIN
export const createCategory = async(data) =>{
    const response = await fetch(BASE_URL,{
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify(data)
    })
    if (!response.ok){
        const error = await response.json()
        throw new Error(error.message || `Error ${response.status}: no se pudo crear la categoria`)
    }
    return response.json()
}

// requiere ROLE_ADMIN
export const deleteCategory = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() }
    })
    if (!response.ok) {
        throw new Error(`Error ${response.status}: no se pudo eliminar la categoría`)
    }
    return response
}
