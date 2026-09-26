import StatusBadge from './StatusBadge';

const ParticipantCard = ({ participant, onQuickAction, onAttendanceToggle, onPhotoShootToggle, onPaymentToggle, onEdit, onDelete, onPrintQr, onWhatsAppTicket, selected, onToggleSelect, canMarkAttendance = true, canMarkPhotoShoot = true }) => {
  const attendanceStatus = participant.attendance ? '✓ Attended' : 'Pending';
  const photoStatus = participant.photo_shoot ? '✓ Completed' : 'Pending';
  const paymentStatus = participant.payment ? '✓ Paid' : 'Pending';

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div className="d-flex align-items-start gap-2">
            <input className="form-check-input mt-1" type="checkbox" checked={selected} onChange={() => onToggleSelect(participant.id)} aria-label={`Select ${participant.full_name}`} />
            <div>
            <h6 className="mb-1">{participant.full_name}</h6>
            <small className="text-muted">{participant.registration_number}</small>
            </div>
          </div>
          <StatusBadge status={participant.attendance ? 'attended' : 'pending'} />
        </div>

        <div className="mt-3 small text-muted">
          <div><strong>Function:</strong> {participant.function_event?.name || 'N/A'}</div>
          <div><strong>Attendance:</strong> {attendanceStatus}</div>
          <div><strong>Photo Shoot:</strong> {photoStatus}</div>
          <div><strong>Payment:</strong> {paymentStatus}</div>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-3">
          <button className={`btn btn-sm ${participant.attendance ? 'btn-outline-danger' : 'btn-outline-primary'}`} onClick={() => onAttendanceToggle(participant)} disabled={!participant.attendance && !canMarkAttendance}>
            {participant.attendance ? 'Undo Attendance' : 'Mark Attendance'}
          </button>
          <button className={`btn btn-sm ${participant.photo_shoot ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => onPhotoShootToggle(participant)} disabled={!participant.photo_shoot && !canMarkPhotoShoot}>
            {participant.photo_shoot ? 'Undo Photo Shoot' : 'Mark Photo Shoot'}
          </button>
          <button className={`btn btn-sm ${participant.payment ? 'btn-outline-danger' : 'btn-outline-warning'}`} onClick={() => onPaymentToggle(participant)}>
            {participant.payment ? 'Undo Payment' : 'Mark Payment'}
          </button>
          <button className="btn btn-sm btn-outline-dark" onClick={() => onPrintQr(participant)} title="Print QR code">
            <i className="bi bi-printer"></i>
            <span className="visually-hidden">Print QR code</span>
          </button>
          <button className="btn btn-sm btn-outline-success" onClick={() => onWhatsAppTicket(participant)} disabled={!participant.payment} title={participant.payment ? 'Send ticket link by WhatsApp' : 'Complete payment to send the ticket'}>
            <i className="bi bi-whatsapp me-1"></i>WhatsApp Ticket
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => onQuickAction('details', participant)}>View Details</button>
          <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(participant)} title="Edit participant">
            <i className="bi bi-pencil"></i>
            <span className="visually-hidden">Edit participant</span>
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(participant)} title="Delete participant">
            <i className="bi bi-trash"></i>
            <span className="visually-hidden">Delete participant</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;
