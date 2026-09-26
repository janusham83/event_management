import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const PublicTicketPage = () => {
  const { token } = useParams();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/public/tickets/${token}`)
      .then((response) => setParticipant(response.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const downloadTicket = async () => {
    if (!participant) return;

    const event = participant.function_event || {};
    const qrImage = await QRCode.toDataURL(participant.qr_token, { width: 320, margin: 1 });
    const document = new jsPDF();
    document.setFillColor(23, 32, 51);
    document.rect(0, 0, 210, 36, 'F');
    document.setTextColor(255, 255, 255);
    document.setFontSize(10);
    document.text('EVENT ACCESS PASS', 16, 14);
    document.setFontSize(20);
    document.text(event.name || 'Event Ticket', 16, 27);
    document.setTextColor(23, 32, 51);
    document.setFontSize(11);
    document.text('PARTICIPANT', 16, 55);
    document.setFontSize(18);
    document.text(participant.full_name, 16, 66);
    document.setFontSize(11);
    document.text(`Registration: ${participant.registration_number}`, 16, 82);
    document.text(`Date: ${event.date || 'TBA'}`, 16, 92);
    document.text(`Time: ${event.start_time || 'TBA'} - ${event.end_time || 'TBA'}`, 16, 102);
    document.text(`Venue: ${event.venue || 'TBA'}`, 16, 112);
    document.addImage(qrImage, 'PNG', 145, 52, 45, 45);
    document.setFontSize(9);
    document.setTextColor(100, 110, 125);
    document.text('Scan at check-in', 153, 102);
    document.text(`QR token: ${participant.qr_token}`, 16, 132);
    document.text('Present this ticket at check-in.', 16, 146);
    document.save(`${participant.registration_number || 'event-ticket'}.pdf`);
  };

  if (loading) return <LoadingSpinner label="Loading ticket..." />;
  if (notFound) return <div className="container py-5"><div className="alert alert-warning">Ticket not found or no longer available.</div></div>;

  const event = participant.function_event || {};

  return (
    <main className="public-ticket-page py-4 py-md-5">
      <div className="container">
        <div className="public-ticket mx-auto">
          <div className="public-ticket-header">
            <small>EVENT ACCESS PASS</small>
            <h1>{event.name || 'Event Ticket'}</h1>
          </div>
          <div className="public-ticket-body">
            <div>
              <div className="text-muted small text-uppercase">Participant</div>
              <h2>{participant.full_name}</h2>
              <p><strong>Registration:</strong> {participant.registration_number}</p>
              <p><strong>Date:</strong> {event.date || 'TBA'}</p>
              <p><strong>Time:</strong> {event.start_time || 'TBA'} - {event.end_time || 'TBA'}</p>
              <p><strong>Venue:</strong> {event.venue || 'TBA'}</p>
            </div>
            <div className="text-center">
              <QRCodeSVG value={participant.qr_token} size={150} level="M" />
              <div className="small text-muted mt-2">Scan at check-in</div>
            </div>
          </div>
          <div className="public-ticket-footer">
            <span>Keep this ticket ready for entry.</span>
            <button className="btn btn-primary" type="button" onClick={downloadTicket}>
              <i className="bi bi-download me-2"></i>Download Ticket
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PublicTicketPage;
