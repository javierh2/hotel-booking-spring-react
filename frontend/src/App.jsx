// BrowserRouter activa el sistema de rutas en toda la app
// Routes  contenedor de todas las rutas
// Route define qué componente mostrar según la URL
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// import del header y el css global de la app
import Header from './components/Header/Header'
// import del footer
import Footer from './components/Footer/Footer'
// import del searchbar
import SearchBar from './components/SearchBar/SearchBar'


import './index.css'

const App = () => {
  return (
    //BrowserRouter envuelve TODA la app para que el sistema de rutas funcione en cualquier parte
    <BrowserRouter>
      {/*no podemos entregar Header y main sueltos por ende se necesita un contenedor*/}
      <div className="app-wrapper">

        {/* header siempre visible*/}
        <Header />

        {/* Routes decide qué página mostrar según la URL actual */}
        <main className="app-main">
          <Routes>

            <Route path="/" element={<h1>Home — YA TENDRÁS TU LUGAR </h1>} />

          </Routes>
        </main>

        {/* footer siempre visible */}
        <Footer />

      </div>
    </BrowserRouter>
  )
}

export default App