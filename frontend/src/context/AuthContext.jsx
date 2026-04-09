import { createContext, useContext, useState } from "react";


// contenedor global del estado de autentificacion, maneja el usuario logueado, el login, el logout, y si el usuario es admin o no
const AuthContext = createContext(null);

// el AuthProvider envuelve la app y provee el estado de autenticación a toda la app
export const AuthProvider = ({ children }) =>{
    // el estado del usuario se inicializa leyendo el localStorage para mantener la sesión aunque se recargue la página(si el token es válido y no expiró)
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("db_user")
            return stored ? JSON.parse(stored) : null
        }catch{
            return null
        }
    })


    // login actualiza el estado del usuario y guarda el token en localStorage para mantener la sesión aunque se recargue la página
    const login = (data) => {
        setUser(data)
        localStorage.setItem("db_user", JSON.stringify(data))
    }


    // logout limpia el estado y el localStorage para cerrar la sesión del usuario (vuelve a ser un user anonimo)
    const logout = () => {
        setUser(null)
        localStorage.removeItem("db_user")
    }

    // helper para saber si el usuario logueado tiene rol de admin; para mostrar/ocultar funcionalidades solo para "admins"
    const isAdmin = user?.role === "ROLE_ADMIN"

    // helper para saber si el usuario está autenticado (logueado) o no; para mostrar/ocultar funcionalidades solo para usuarios "logueados"
    const isAuthenticated = !!user


    // el value del contexto es un objeto con el estado del usuario y las funciones de login/logout, y los helpers de isAdmin/isAuthenticated
    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

// custom hook para usar el contexto de autenticación en cualquier componente de la app, devuelve el estado del usuario y las funciones de login/logout, y los helpers de isAdmin/isAuthenticated
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth debe usarse dentro de authProvider")
    }
    return context
}