import "./ConfirmDialog.css";

// Se você usa ESLint com prop-types, pode ajustar/importar conforme seu setup
// Aqui vou deixar sem prop-types pra simplificar.
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  onlyCancel = false,
  variant = "default", // você usa "danger" em alguns lugares, se quiser tratar depois
}) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div className="confirm-modal__backdrop">
      <div className="confirm-modal" role="dialog" aria-modal="true">
        {/* Cabeçalho */}
        <div className="confirm-modal__header">
          <div className="confirm-modal__icon" aria-hidden="true">
            {isDanger ? "!" : "?"}
          </div>
          <h3 className="confirm-modal__title">{title}</h3>
        </div>

        {/* Descrição */}
        {description && (
          <p className="confirm-modal__description">{description}</p>
        )}

        {/* Botões */}
        <div className="confirm-modal__actions">
          {!onlyCancel && (
            <button
              className="confirm-modal__btn confirm-modal__btn--cancel"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}

          {!onlyCancel && (
            <button
              className="confirm-modal__btn confirm-modal__btn--confirm"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          )}

          {onlyCancel && (
            <button
              className="confirm-modal__btn confirm-modal__btn--cancel"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
