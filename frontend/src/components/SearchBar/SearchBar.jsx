import { useState } from 'react'
import './SearchBar.css'

const SearchBar = () => {


    const [searchValue, setSearchValue] = useState("")

    const handleInputChange = (event) => {
        setSearchValue(event.target.value)
    }


    const handleSearch = () => {
        console.log("Buscando:", searchValue)
        // TODO: feature of search
    }


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