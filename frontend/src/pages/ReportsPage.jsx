import { useEffect, useState } from 'react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/reports');
        setReport(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner label="Loading reports..." />;

  return (
    <div className="row g-4">
      <div className="col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Attendance Report</h4>
            <div className="row g-2">
              <div className="col-6"><strong>Total Registered:</strong> {report?.attendance?.total_registered}</div>
              <div className="col-6"><strong>Attended:</strong> {report?.attendance?.attended}</div>
              <div className="col-6"><strong>Not Attended:</strong> {report?.attendance?.not_attended}</div>
              <div className="col-6"><strong>Attendance %:</strong> {report?.attendance?.attendance_percentage}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Photo Shoot Report</h4>
            <div className="row g-2">
              <div className="col-6"><strong>Total Participants:</strong> {report?.photo_shoot?.total_participants}</div>
              <div className="col-6"><strong>Completed:</strong> {report?.photo_shoot?.completed}</div>
              <div className="col-6"><strong>Pending:</strong> {report?.photo_shoot?.pending}</div>
              <div className="col-6"><strong>Completion %:</strong> {report?.photo_shoot?.completion_percentage}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Issue Report</h4>
            <div className="row g-2">
              <div className="col-6"><strong>Total Issues:</strong> {report?.issues?.total_issues}</div>
              <div className="col-6"><strong>Open:</strong> {report?.issues?.open}</div>
              <div className="col-6"><strong>In Progress:</strong> {report?.issues?.in_progress}</div>
              <div className="col-6"><strong>Resolved:</strong> {report?.issues?.resolved}</div>
              <div className="col-6"><strong>Closed:</strong> {report?.issues?.closed}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
