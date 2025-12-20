import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function FormModal({ title, children, onClose, footer }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        <div className="modal-footer">
          <div className="modal-footer-actions">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export default FormModal;
