import { useNavigate} from 'react-router-dom';
import './RoomCard.css';

const RoomCard = ({ room }) => {
    const navigate = useNavigate()


    // componente para mostrar la informacion de cada habitacion
    const handleViewDetail = () => {
        navigate(`/rooms/${room.id}`); // ${room.id} inyecta el valor de room.id en el string
    }

    // función para manejar el error de carga de la imagen, oculta la imagen y muestra un placeholder
    const handleImageError = (event) => {
        event.target.style.display = "none";
        event.target.nextSibling.style.display = "flex";
    }


    return (
        <article className="room-card" onClick={handleViewDetail}>
            <div className="room-card__image-wrapper">
                {room.imageRoom ? (
                    <>
                        <img
                            src={room.imageRoom}
                            alt={room.name}
                            className="room-card__image"
                            onError={handleImageError}
                        />
                        <div className="room-card__image-placeholder" style={{ display: "none" }}>
                            🏨
                        </div>
                    </>
                ) : (
                    <div className="room-card__image-placeholder">
                        🏨
                    </div>
                )}

                {room.category && (
                    <span className="room-card__badge">{room.category.title}</span>
                )}
            </div>

            <div className="room-card__content">
                <h3 className="room-card__name">{room.name}</h3>
                <p className="room-card__description">{room.description}</p>
                <div className="room-card__footer">
                    <div className="room-card__price">
                        <span className="room-card__price-amount">${room.price}</span>
                        <span className="room-card__price-label">for night</span>
                    </div>

                    <button
                        className="room-card__btn"
                        onClick={(e) =>{
                            e.stopPropagation(); // Evita que el clic en el botón active el evento del card
                            handleViewDetail();
                        }}
                    >
                        View Details
                    </button>
                </div>
            </div>
        </article>
    )
}

export default RoomCard

