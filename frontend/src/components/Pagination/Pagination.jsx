import './Pagination.css'

/// Componente de paginación
const Pagination = ({ currentPage, totalPages, onPageChange }) => {

    if (totalPages <= 1) return null
    // Generar array de páginas [1, 2, 3, ..., totalPages]
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <div className="pagination">

            {/* Botón inicio */}
            <button
                className="pagination__btn pagination__btn--text"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            >
                « Start
            </button>

            {/* Botón anterior */}
            <button
                className="pagination__btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ←
            </button>

            {/* Botones de páginas */}
            {pages.map(page => (
                <button
                    key={page}
                    className={`pagination__btn ${currentPage === page ? 'pagination__btn--active' : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            {/* Botón siguiente */}
            <button
                className="pagination__btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                →
            </button>

            <span className="pagination__info">
                {currentPage} of {totalPages}
            </span>

        </div>
    )
}

export default Pagination