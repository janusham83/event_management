const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
          </div>
          <div className="modal-body">{message}</div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
