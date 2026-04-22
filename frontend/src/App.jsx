// BrowserRouter activa el sistema de rutas en toda la app
// Routes  contenedor de todas las rutas
// Route define qué componente mostrar según la URL
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import del header y el css global de la app
import Header from './components/Header/Header'
import './index.css'
// import del footer
import Footer from './components/Footer/Footer'
//import de la página Home
import Home from './pages/Home/Home'
//import de la página Admin
import Admin from './pages/Admin/Admin'
//import de la página RoomDetail
import RoomDetail from './pages/RoomDetail/RoomDetail'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import Favorites from './pages/Favorites/Favorites'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import MyBookings from './pages/MyBookings/MyBookings'
import WspButton from './components/WspButton/WspButton'
import BookingConfirmation from './pages/BookingConfirmation/BookingConfirmation'


const App = () => {
  return (
    // AuthProvider envuelve toda la app para que el estado de autenticación esté disponible en cualquier parte
    <AuthProvider>
      {/* BrowserRouter envuelve TODA la app para que el sistema de rutas funcione en cualquier parte */}
      <BrowserRouter>
        {/*no podemos entregar Header y main sueltos por ende se necesita un contenedor*/}
        <div className="app-wrapper">

          {/* header siempre visible*/}
          <Header />

          {/* Routes decide qué página mostrar según la URL actual */}
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* /admin requiere estar logueado Y tener ROLE_ADMIN
              si escribís la URL a mano sin ser admin redirige al home */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              <Route path="/rooms/:id" element={<RoomDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* /favorites requiere solo estar logueado, no ser admin
              si escribís la URL sin sesión  redirige a login */}
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />

              {/* /my-bookings requiere estar logueado
              sin sesión redirige a login con replace para no ensuciar el historial */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* /booking/confirmation — página de éxito post-reserva — HU #32
    no tiene ProtectedRoute porque si el usuario llega sin state
    el propio componente lo redirige al home con replace */}
              <Route path="/booking/confirmation" element={<BookingConfirmation />} />

            </Routes>
          </main>

          {/* footer siempre visible */}
          <Footer />

          {/* botón flotante de WhatsApp*/}
          <WspButton />

        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
