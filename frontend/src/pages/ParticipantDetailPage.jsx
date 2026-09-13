import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const ParticipantDetailPage = () => {
  const { id } = useParams();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const response = await api.get(`/participants/${id}`);
        setParticipant(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading participant details..." />;
  if (!participant) return <div className="alert alert-warning">Participant not found.</div>;

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Participant Details</h4>
            <div className="mb-2"><strong>Name:</strong> {participant.full_name}</div>
            <div className="mb-2"><strong>Mobile:</strong> {participant.mobile_number}</div>
            <div className="mb-2"><strong>Email:</strong> {participant.email}</div>
            <div className="mb-2"><strong>Organization:</strong> {participant.organization || 'N/A'}</div>
            <div className="mb-2"><strong>Registration:</strong> {participant.registration_number}</div>
            <div className="mb-2"><strong>Guests:</strong> {participant.number_of_guests}</div>
            <div className="mb-2"><strong>QR Token:</strong> {participant.qr_token}</div>
          </div>
        </div>
      </div>

      <div className="col-lg-7">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Event Status</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 rounded-4 bg-light">
                  <div className="text-muted small">Attendance</div>
                  <div className="fw-bold fs-5">{participant.attendance ? 'Marked' : 'Pending'}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 rounded-4 bg-light">
                  <div className="text-muted small">Photo Shoot</div>
                  <div className="fw-bold fs-5">{participant.photo_shoot ? 'Completed' : 'Pending'}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 rounded-4 bg-light">
                  <div className="text-muted small">Tickets</div>
                  <div className="fw-bold fs-5">{participant.issue_tickets?.length || 0}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 rounded-4 bg-light">
                  <div className="text-muted small">Function</div>
                  <div className="fw-bold fs-5">{participant.function_event?.name || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetailPage;
