import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ParticipantCard from '../components/ParticipantCard';
import SearchBox from '../components/SearchBox';
import LoadingSpinner from '../components/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';

function isScannerAvailable(functionEvent) {
  if (!functionEvent?.date || !functionEvent?.start_time || !functionEvent?.end_time || functionEvent.status !== 'active') return false;

  const date = functionEvent.date.slice(0, 10);
  const start = new Date(`${date}T${functionEvent.start_time}`);
  const end = new Date(`${date}T${functionEvent.end_time}`);
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');

  return today === date && now >= new Date(start.getTime() - 2 * 60 * 60 * 1000) && now <= end;
}

const emptyForm = {
  full_name: '',
  mobile_number: '',
  email: '',
  organization: '',
  number_of_guests: 0,
  function_id: 1,
};

const ParticipantPage = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedIds, setSelectedIds] = useState([]);
  const [printParticipants, setPrintParticipants] = useState([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await api.get('/participants');
        setParticipants(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  const filtered = participants.filter((participant) => {
    const target = `${participant.full_name} ${participant.mobile_number} ${participant.registration_number} ${participant.qr_token}`.toLowerCase();
    return target.includes(search.toLowerCase());
  });

  const handleQuickAction = (type, participant) => {
    if (type === 'details') {
      navigate(`/participants/${participant.id}`);
      return;
    }

    if (type === 'attendance') {
      navigate('/attendance/scan');
      return;
    }

    if (type === 'photo') {
      navigate('/photo-shoot/scan');
      return;
    }

    if (type === 'ticket') {
      navigate('/tickets/new');
    }
  };

  const handleManualAttendance = async (participant) => {
    try {
      let attendance = participant.attendance;

      if (participant.attendance) {
        await api.delete('/attendance/manual', { data: {
          function_id: participant.function_id,
          participant_id: participant.id,
        } });
        attendance = null;
      } else {
        const response = await api.post('/attendance/manual', {
          function_id: participant.function_id,
          participant_id: participant.id,
        });
        attendance = response.data.attendance;
      }
      setParticipants((currentParticipants) => currentParticipants.map((item) => (
        item.id === participant.id
          ? { ...item, attendance }
          : item
      )));
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to mark attendance.');
    }
  };

  const handlePhotoShootToggle = async (participant) => {
    try {
      let photoShoot = participant.photo_shoot;

      if (participant.photo_shoot) {
        await api.delete('/photo-shoot/manual', { data: {
          function_id: participant.function_id,
          participant_id: participant.id,
        } });
        photoShoot = null;
      } else {
        const response = await api.post('/photo-shoot/manual', {
          function_id: participant.function_id,
          participant_id: participant.id,
        });
        photoShoot = response.data.photo_shoot;
      }

      setParticipants((currentParticipants) => currentParticipants.map((item) => (
        item.id === participant.id
          ? { ...item, photo_shoot: photoShoot }
          : item
      )));
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to update photo shoot status.');
    }
  };

  const canMarkParticipant = (participant) => isScannerAvailable(participant.function_event);

  const handlePaymentToggle = async (participant) => {
    try {
      let payment = participant.payment;

      if (participant.payment) {
        await api.delete('/payment/manual', { data: {
          function_id: participant.function_id,
          participant_id: participant.id,
        } });
        payment = null;
      } else {
        const response = await api.post('/payment/manual', {
          function_id: participant.function_id,
          participant_id: participant.id,
        });
        payment = response.data.payment;
      }

      setParticipants((currentParticipants) => currentParticipants.map((item) => (
        item.id === participant.id ? { ...item, payment } : item
      )));
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to update payment status.');
    }
  };

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    setForm({
      full_name: participant.full_name,
      mobile_number: participant.mobile_number,
      email: participant.email,
      organization: participant.organization || '',
      number_of_guests: participant.number_of_guests || 0,
      function_id: participant.function_id,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.put(`/participants/${editingParticipant.id}`, form);
      setParticipants((currentParticipants) => currentParticipants.map((participant) => (
        participant.id === response.data.id
          ? { ...participant, ...response.data }
          : participant
      )));
      setEditingParticipant(null);
      setForm(emptyForm);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingParticipant(null);
    setForm(emptyForm);
  };

  const handleDelete = async (participant) => {
    if (!window.confirm(`Delete participant ${participant.full_name}?`)) return;

    try {
      await api.delete(`/participants/${participant.id}`);
      setParticipants((currentParticipants) => currentParticipants.filter((item) => item.id !== participant.id));
      if (editingParticipant?.id === participant.id) handleCancelEdit();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrintQrs = (selectedParticipants) => {
    if (!selectedParticipants.length) return;
    const printWindow = window.open('', '_blank', 'width=720,height=800');
    if (!printWindow) return;

    setPrintParticipants(selectedParticipants);
    window.setTimeout(() => {
      const qrItems = [...document.querySelectorAll('.qr-print-item')].map((item) => item.outerHTML).join('');
      if (!qrItems) {
        printWindow.close();
        return;
      }
      printWindow.document.write(`<!doctype html><html><head><title>Participant Event Tickets</title><style>
        @page{size:A4 portrait;margin:0}*{box-sizing:border-box}body{width:210mm;margin:0;background:#fff;color:#172033;font-family:Arial,sans-serif}.ticket-grid{display:grid;grid-template-columns:1fr;gap:0}.ticket{width:210mm;height:74.25mm;position:relative;overflow:hidden;border:1px solid #d8dee8;background:#fff;break-inside:avoid;page-break-inside:avoid}.ticket-header{height:17mm;display:flex;align-items:center;gap:3mm;padding:3mm 5mm;background:#172033;color:#fff}.ticket-logo{width:11mm;height:11mm;object-fit:contain;border-radius:2mm;background:#fff;padding:1mm}.ticket-brand{min-width:0}.ticket-kicker{margin:0 0 1mm;color:#9dd9cf;font-size:7pt;font-weight:700;letter-spacing:1.2pt;text-transform:uppercase}.ticket-title{margin:0;overflow:hidden;font-size:13pt;white-space:nowrap;text-overflow:ellipsis}.ticket-body{height:49mm;display:grid;grid-template-columns:1fr 38mm;gap:4mm;padding:4mm 5mm}.ticket-label{margin:0 0 1mm;color:#768197;font-size:7pt;font-weight:700;letter-spacing:.8pt;text-transform:uppercase}.ticket-value{margin:0 0 3mm;font-size:9pt;font-weight:600}.ticket-name{font-size:15pt}.ticket-qr{display:flex;align-items:center;justify-content:center;border-left:1px dashed #cbd3df;padding-left:4mm}.ticket-qr svg{width:33mm;height:33mm}.ticket-footer{height:8.25mm;display:flex;justify-content:space-between;gap:12px;margin:0 5mm;padding:2mm 0;border-top:1px solid #e5e9ef;color:#768197;font-size:7pt}.ticket-footer strong{color:#172033}@media print{body{padding:0}.ticket{box-shadow:none}}
      </style></head><body><div class="ticket-grid">${qrItems}</div></body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
      setPrintParticipants([]);
    }, 250);
  };

  const handlePrintQr = (participant) => handlePrintQrs([participant]);

  if (loading) return <LoadingSpinner label="Loading participants..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Participants</h3>
          <small className="text-muted">Fast search and quick access to event actions</small>
        </div>
      </div>

      <div className="mb-4">
        <SearchBox value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, mobile, registration or QR token" />
      </div>

      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
        <button className="btn btn-outline-secondary" type="button" onClick={() => setSelectedIds(filtered.map((participant) => participant.id))}>Select All</button>
        <button className="btn btn-outline-secondary" type="button" onClick={() => setSelectedIds([])}>Clear Selection</button>
        <button className="btn btn-primary" type="button" disabled={!selectedIds.length} onClick={() => handlePrintQrs(filtered.filter((participant) => selectedIds.includes(participant.id)))}>
          <i className="bi bi-printer me-2"></i>Print QR Codes ({selectedIds.length})
        </button>
      </div>

      {editingParticipant && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">Edit Participant</h4>
              <small className="text-muted">{editingParticipant.registration_number}</small>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mobile Number</label>
                  <input className="form-control" name="mobile_number" value={form.mobile_number} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Organization / Group</label>
                  <input className="form-control" name="organization" value={form.organization} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Number of Guests</label>
                  <input type="number" min="0" className="form-control" name="number_of_guests" value={form.number_of_guests} onChange={handleChange} />
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button className="btn btn-primary" type="submit">Update Participant</button>
                <button className="btn btn-outline-secondary" type="button" onClick={handleCancelEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-4">
        {filtered.map((participant) => (
          <div className="col-lg-6" key={participant.id}>
            <ParticipantCard
              participant={participant}
              onQuickAction={handleQuickAction}
              onAttendanceToggle={handleManualAttendance}
              onPhotoShootToggle={handlePhotoShootToggle}
              canMarkAttendance={participant.attendance || canMarkParticipant(participant)}
              canMarkPhotoShoot={participant.photo_shoot || canMarkParticipant(participant)}
              onPaymentToggle={handlePaymentToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPrintQr={handlePrintQr}
              selected={selectedIds.includes(participant.id)}
              onToggleSelect={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
            />
          </div>
        ))}
      </div>
      {printParticipants.map((participant) => (
        <div className="qr-print-item" key={participant.id}>
          <article className="ticket">
            <header className="ticket-header">
              {participant.function_event?.logo_url && <img className="ticket-logo" src={participant.function_event.logo_url} alt="Event logo" />}
              <div className="ticket-brand">
                <p className="ticket-kicker">Event Access Pass</p>
                <h2 className="ticket-title">{participant.function_event?.name || 'Event'}</h2>
              </div>
            </header>
            <div className="ticket-body">
              <div>
                <p className="ticket-label">Participant</p>
                <p className="ticket-value ticket-name">{participant.full_name}</p>
                <p className="ticket-label">Registration</p>
                <p className="ticket-value">{participant.registration_number}</p>
                <p className="ticket-label">Date & Time</p>
                <p className="ticket-value">{participant.function_event?.date || 'TBA'}<br />{participant.function_event?.start_time || 'TBA'} - {participant.function_event?.end_time || 'TBA'}</p>
                <p className="ticket-label">Location</p>
                <p className="ticket-value">{participant.function_event?.venue || 'TBA'}</p>
              </div>
              <div className="ticket-qr"><QRCodeSVG value={participant.qr_token} size={110} level="M" /></div>
            </div>
            <footer className="ticket-footer"><span>Present this QR code at check-in</span><strong>{participant.function_event?.status === 'active' ? 'VALID' : 'EVENT INACTIVE'}</strong></footer>
          </article>
        </div>
      ))}
    </div>
  );
};

export default ParticipantPage;
