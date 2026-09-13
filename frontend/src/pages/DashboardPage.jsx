import { useEffect, useState } from 'react';
import api from '../api';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = ({ onUnauthorized, user }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          onUnauthorized();
          return;
        }

        setError('Unable to load the dashboard. Please try again.');
      }
    };

    fetchData();
  }, [onUnauthorized]);

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        <div className="fw-semibold">Dashboard unavailable</div>
        <div>{error}</div>
        <button className="btn btn-outline-danger btn-sm mt-3" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return <LoadingSpinner label="Loading dashboard..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Dashboard</h3>
          <small className="text-muted">{user?.function_event?.name ? `${user.function_event.name} overview and recent activity` : 'Event overview and recent activity'}</small>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-xl-4">
          <DashboardCard title="Total Registered" value={data.total_registered} icon="bi bi-people-fill" tone="primary" />
        </div>
        <div className="col-md-6 col-xl-4">
          <DashboardCard title="Total Attended" value={data.total_attended} icon="bi bi-check-circle-fill" tone="success" />
        </div>
        <div className="col-md-6 col-xl-4">
          <DashboardCard title="Attendance Percentage" value={`${data.attendance_percentage}%`} icon="bi bi-percent" tone="info" />
        </div>
        <div className="col-md-6 col-xl-4">
          <DashboardCard title="Total Issue Tickets" value={data.total_issue_tickets} icon="bi bi-ticket-detailed-fill" tone="warning" />
        </div>
        <div className="col-md-6 col-xl-4">
          <DashboardCard title="Resolved Tickets" value={data.resolved_tickets} icon="bi bi-check2-square" tone="success" />
        </div>
        <div className="col-md-6 col-xl-4">
          <DashboardCard title="Photo Shoot Completed" value={data.photo_shoot_completed} icon="bi bi-camera-fill" tone="secondary" />
        </div>
      </div>

      <div className="row mt-4 g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {data.recent_activities?.map((item, index) => (
                  <div className="list-group-item px-0" key={`${item.type}-${index}`}>
                    <div className="d-flex justify-content-between align-items-center gap-3">
                      <div>
                        <div className="fw-semibold">{item.type}</div>
                        <div className="text-muted small">{item.title}</div>
                      </div>
                      <small className="text-muted">{new Date(item.time).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0">Quick Summary</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="text-muted small">Pending Photo Shoots</div>
                <div className="fw-bold fs-4">{data.photo_shoot_pending}</div>
              </div>
              <div className="mb-3">
                <div className="text-muted small">Unresolved Issues</div>
                <div className="fw-bold fs-4">{Math.max(data.total_issue_tickets - data.resolved_tickets, 0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
