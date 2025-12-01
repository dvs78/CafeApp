// src/components/ConfirmDialog.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faCircleInfo,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const ICONS = {
  danger: faTriangleExclamation,
  info: faCircleInfo,
  success: faCheckCircle,
};

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  variant = "danger", // ← default
}) => {
  if (!open) return null;

  return (
    <div className="confirm-modal__backdrop" onClick={onCancel}>
      <div
        className={`confirm-modal confirm-modal--${variant}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="confirm-modal__header">
          <div className="confirm-modal__icon">
            <FontAwesomeIcon icon={ICONS[variant]} />
          </div>

          <h3 className="confirm-modal__title">{title}</h3>
        </div>

        {/* Descrição */}
        {description && (
          <div className="confirm-modal__description">{description}</div>
        )}

        {/* Botões */}
        <div className="confirm-modal__actions">
          <button
            type="button"
            className="confirm-modal__btn confirm-modal__btn--cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="confirm-modal__btn confirm-modal__btn--confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
