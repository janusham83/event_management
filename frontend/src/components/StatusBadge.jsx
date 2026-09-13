const StatusBadge = ({ status }) => {
  const palette = {
    active: 'success',
    inactive: 'secondary',
    registered: 'primary',
    attended: 'success',
    pending: 'warning',
    completed: 'success',
    'In Progress': 'warning',
    Resolved: 'info',
    Closed: 'secondary',
    Open: 'danger',
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
    Urgent: 'danger',
  };

  const tone = palette[status] || 'secondary';

  return <span className={`badge bg-${tone} rounded-pill px-3 py-2`}>{status}</span>;
};

export default StatusBadge;
