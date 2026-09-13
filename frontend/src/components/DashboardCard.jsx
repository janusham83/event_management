const DashboardCard = ({ title, value, subtitle, icon, tone = 'primary' }) => (
  <div className="dashboard-card card h-100 border-0 shadow-sm">
    <div className="card-body d-flex justify-content-between align-items-start">
      <div>
        <div className="text-muted small fw-semibold text-uppercase">{title}</div>
        <div className="display-6 fw-bold mt-2">{value}</div>
        {subtitle && <div className="text-muted small mt-2">{subtitle}</div>}
      </div>
      <div className={`icon-box bg-${tone} text-white`}>
        <i className={icon}></i>
      </div>
    </div>
  </div>
);

export default DashboardCard;
