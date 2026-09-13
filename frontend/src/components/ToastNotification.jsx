const ToastNotification = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3">
      <div className={`toast show align-items-center text-white border-0 bg-${toast.type}`} role="alert">
        <div className="d-flex">
          <div className="toast-body">{toast.message}</div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
