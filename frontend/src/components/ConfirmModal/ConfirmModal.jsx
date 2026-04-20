import './ConfirmModal.css'

// componente de confirmación, reemplaza window.confirm()
// recibe todo por props para que Admin.jsx controle las decisiones a ejecutar cuando el usuario confirma o cancela
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Sí, confirmar" }) => {

    // si no está abierto no renderiza y evita montar el DOM innecesariamente
    if (!isOpen) return null

    return (
        // overlay oscuro — al hacer clic fuera se cancela, mismo comportamiento que window.confirm al presionar Escape
        <div className="confirm-modal__overlay" onClick={onCancel}>

            {/* stopPropagation evita que un clic dentro del modal cierre el overlay */}
            <div className="confirm-modal__box" onClick={(e) => e.stopPropagation()}>

                <div className="confirm-modal__icon">⚠️</div>

                <h2 className="confirm-modal__title">{title}</h2>
                <p className="confirm-modal__message">{message}</p>

                <div className="confirm-modal__actions">
                    {/* cancelar a la izquierda */}
                    <button className="confirm-modal__btn confirm-modal__btn--cancel" onClick={onCancel}>
                        Cancelar
                    </button>
                    {/* confirmar a la derecha  */}
                    <button className="confirm-modal__btn confirm-modal__btn--confirm" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ConfirmModal