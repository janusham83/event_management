import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ParticipantCard from '../components/ParticipantCard';
import SearchBox from '../components/SearchBox';
import LoadingSpinner from '../components/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';

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
      printWindow.document.write(`<!doctype html><html><head><title>Participant QR Codes</title><style>body{font-family:Arial,sans-serif;padding:24px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}.item{text-align:center;border:1px solid #ddd;padding:16px;break-inside:avoid}.item svg{display:block;margin:16px auto;max-width:100%}h3{margin:0 0 8px}p{margin:4px 0;color:#444}@media print{.grid{grid-template-columns:repeat(2,1fr)}}</style></head><body><div class="grid">${qrItems}</div></body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
      setPrintParticipants([]);
    }, 100);
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
          <h3>{participant.full_name}</h3>
          <p>{participant.registration_number}</p>
          <QRCodeSVG value={participant.qr_token} size={220} />
          <p>{participant.function_event?.name || 'Event'}</p>
        </div>
      ))}
    </div>
  );
};

export default ParticipantPage;
