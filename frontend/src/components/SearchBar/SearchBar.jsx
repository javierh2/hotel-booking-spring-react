import { useState } from 'react'
import './SearchBar.css'

const SearchBar = () => {

    // Estado para almacenar el valor del input de búsqueda
    const [searchValue, setSearchValue] = useState("")

    // Función para manejar el cambio en el input de búsqueda
    const handleInputChange = (event) => {
        setSearchValue(event.target.value)
    }

    // TODO: función para manejar la búsqueda, actualmente solo imprime el valor de búsqueda en la consola
    const handleSearch = () => {
        console.log("Search:", searchValue)
        // TODO: feature of search
    }

    // Función para manejar la tecla Enter en el input de búsqueda
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <section className="searchbar">
            <div className="searchbar__content">

                <h1 className="searchbar__title">
                    Find your ideal place
                </h1>

                <p className="searchbar__subtitle">
                    Feel at home, wherever you are
                </p>

                <div className="searchbar__form">
                    <input
                        type="text"
                        className="searchbar__input"
                        placeholder=""
                        value={searchValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />

                    <button
                        className="searchbar__button"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>

            </div>
        </section>
    )
}

export default SearchBar