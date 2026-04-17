import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getRatingsByRoom, canUserRate, createRating } from '../../services/ratingService'
import './RatingSection.css'

// componente completo de reseñas — maneja lectura, formulario y visualización
// recibe roomId y averageRating/totalRatings que ya vienen en el objeto room del padre
// así no hacemos un request extra solo para el promedio — ya lo tenemos en RoomDetail
const RatingSection = ({ roomId, averageRating, totalRatings }) => {

    const { isAuthenticated } = useAuth()

    const [ratings, setRatings] = useState([])
    const [loadingRatings, setLoadingRatings] = useState(true)

    // canRate: null = cargando, true = puede puntuar, false = no puede
    const [canRate, setCanRate] = useState(null)

    // estado del formulario
    const [selectedStars, setSelectedStars] = useState(0)
    // hoverStars controla las estrellas resaltadas cuando el mouse pasa por encima
    const [hoverStars, setHoverStars] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    // carga reseñas al montar — público, no depende de autenticación
    useEffect(() => {
        getRatingsByRoom(roomId)
            .then(data => setRatings(data))
            .catch(() => {})
            .finally(() => setLoadingRatings(false))
    }, [roomId])

    // consulta si el usuario puede puntuar — solo si está logueado
    // useEffect separado porque depende de isAuthenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setCanRate(false)
            return
        }
        canUserRate(roomId)
            .then(data => setCanRate(data.canRate))
            .catch(() => setCanRate(false))
    }, [roomId, isAuthenticated])

    const handleSubmit = async () => {
        if (selectedStars === 0) {
            setSubmitError('Seleccioná al menos una estrella')
            return
        }
        setSubmitting(true)
        setSubmitError(null)
        try {
            const newRating = await createRating(roomId, selectedStars, comment)
            // actualización optimista: agregamos la nueva reseña al inicio de la lista
            // sin recargar todas — mismo patrón que favoritos
            setRatings(prev => [newRating, ...prev])
            setSubmitted(true)
            setCanRate(false)
        } catch (err) {
            setSubmitError('No se pudo enviar tu reseña. Intentá de nuevo: ' + err)
        } finally {
            setSubmitting(false)
        }
    }

    // renderiza las estrellas visuales — reutilizado en el formulario y en cada reseña
    // filled controla si son estrellas de display (tamaño fijo) o del picker (interactivas)
    const renderStars = (count, interactive = false) => {
        return Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1
            const filled = interactive
                ? starValue <= (hoverStars || selectedStars)
                : starValue <= count

            return (
                <span
                    key={i}
                    className={`rating-section__star ${filled ? 'rating-section__star--filled' : ''} ${interactive ? 'rating-section__star--interactive' : ''}`}
                    onClick={interactive ? () => setSelectedStars(starValue) : undefined}
                    onMouseEnter={interactive ? () => setHoverStars(starValue) : undefined}
                    onMouseLeave={interactive ? () => setHoverStars(0) : undefined}
                >
                    ★
                </span>
            )
        })
    }

    // formatea la fecha de creación de la reseña para mostrarla en formato legible
    const formatDate = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleDateString('es-AR', {
            day: '2-digit', month: 'long', year: 'numeric'
        })
    }

    return (
        <div className="rating-section">

            {/* encabezado con promedio y total */}
            <div className="rating-section__header">
                <h2 className="rating-section__title">Valoraciones</h2>
                <div className="rating-section__summary">
                    <span className="rating-section__avg">
                        {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                    </span>
                    <div className="rating-section__summary-detail">
                        <div className="rating-section__stars-display">
                            {averageRating > 0
                                ? renderStars(Math.round(averageRating))
                                : <span className="rating-section__no-ratings">Sin valoraciones aún</span>
                            }
                        </div>
                        <span className="rating-section__total">
                            {totalRatings} valoración{totalRatings !== 1 ? 'es' : ''}
                        </span>
                    </div>
                </div>
            </div>

            <div className="rating-section__divider" />

            {/* formulario de puntuación — solo visible si canRate es true */}
            {canRate && !submitted && (
                <div className="rating-section__form">
                    <h3 className="rating-section__form-title">Tu valoración</h3>

                    {/* picker de estrellas interactivo */}
                    <div className="rating-section__picker">
                        {renderStars(selectedStars, true)}
                        {selectedStars > 0 && (
                            <span className="rating-section__picker-label">
                                {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][selectedStars]}
                            </span>
                        )}
                    </div>

                    <textarea
                        className="rating-section__textarea"
                        placeholder="Contá tu experiencia..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        maxLength={1000}
                    />

                    {submitError && (
                        <p className="rating-section__error">{submitError}</p>
                    )}

                    <button
                        className="rating-section__submit"
                        onClick={handleSubmit}
                        disabled={submitting || selectedStars === 0}
                    >
                        {submitting ? 'Enviando...' : 'Publicar valoración'}
                    </button>
                </div>
            )}

            {/* confirmación post-envío */}
            {submitted && (
                <div className="rating-section__success">
                    ✅ ¡Gracias por tu valoración!
                </div>
            )}

            {/* lista de reseñas */}
            {loadingRatings ? (
                <div className="rating-section__loading">Cargando reseñas...</div>
            ) : ratings.length === 0 ? (
                <p className="rating-section__empty">
                    Todavía no hay valoraciones para esta habitación.
                </p>
            ) : (
                <div className="rating-section__list">
                    {ratings.map(rating => (
                        <div key={rating.id} className="rating-section__item">
                            <div className="rating-section__item-header">
                                {/* avatar con iniciales — mismo patrón que Header */}
                                <div className="rating-section__avatar">
                                    {rating.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="rating-section__item-meta">
                                    <span className="rating-section__item-name">{rating.userName}</span>
                                    <span className="rating-section__item-date">{formatDate(rating.createdAt)}</span>
                                </div>
                                <div className="rating-section__item-stars">
                                    {renderStars(rating.stars)}
                                </div>
                            </div>
                            {/* comentario es opcional — solo se renderiza si existe */}
                            {rating.comment && (
                                <p className="rating-section__item-comment">{rating.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default RatingSection