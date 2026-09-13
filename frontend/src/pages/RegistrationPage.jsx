import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';

const RegistrationPage = ({ user }) => {
  const [form, setForm] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    organization: '',
    number_of_guests: 0,
    function_id: 1,
  });
  const [registered, setRegistered] = useState(null);
  const [functions, setFunctions] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkError, setBulkError] = useState('');

  useEffect(() => {
    api.get('/functions').then((response) => {
      setFunctions(response.data);
      if (user?.role === 'organizer') setForm((current) => ({ ...current, function_id: user.function_id }));
    }).catch(() => setFunctions([]));
  }, [user]);

  useEffect(() => {
    if (!registered) return;
    const printTimer = window.setTimeout(() => window.print(), 300);
    return () => window.clearTimeout(printTimer);
  }, [registered]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/participants', form);
      setRegistered(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadTemplate = async () => {
    const response = await api.get('/participants/template', { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'participant-registration-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkSubmit = async (event) => {
    event.preventDefault();
    setBulkMessage('');
    setBulkError('');
    const payload = new FormData();
    payload.append('file', bulkFile);
    if (user?.role !== 'organizer') payload.append('function_id', form.function_id);
    try {
      const response = await api.post('/participants/bulk', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBulkMessage(response.data.message);
      setBulkFile(null);
      event.target.reset();
    } catch (error) {
      setBulkError(error.response?.data?.message || 'Unable to import participants.');
    }
  };

  if (registered) {
    return (
      <div className="card border-0 shadow-sm p-3">
        <div className="card-body text-center">
          <h3 className="fw-bold mb-3">Registration Successful</h3>
          <div className="d-flex justify-content-center mb-3">
              {registered.qr_token ? <QRCodeSVG value={String(registered.qr_token)} size={180} level="M" /> : <div className="alert alert-danger">QR code could not be generated.</div>}
          </div>
          <div className="mb-2"><strong>{registered.full_name}</strong></div>
          <div className="text-muted">Registration: {registered.registration_number}</div>
          <div className="text-muted">Function: {registered.function_event?.name}</div>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={() => window.print()}>Print QR</button>
            <button className="btn btn-outline-secondary ms-2" onClick={() => setRegistered(null)}>Register Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-4 flex-wrap">
          <h3 className="fw-bold mb-0">Participant Registration</h3>
          <button className="btn btn-outline-primary" type="button" onClick={downloadTemplate}><i className="bi bi-download me-2"></i>Download Excel Format</button>
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
              <label className="form-label">Organization / Batch / Group</label>
              <input className="form-control" name="organization" value={form.organization} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Number of Guests</label>
              <input type="number" className="form-control" name="number_of_guests" value={form.number_of_guests} onChange={handleChange} min="0" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Function</label>
              <select className="form-select" name="function_id" value={form.function_id} onChange={handleChange} disabled={user?.role === 'organizer'}>
                {functions.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-lg mt-4" type="submit">Register Participant</button>
        </form>
        <hr className="my-4" />
        <h4 className="fw-bold mb-3">Bulk Registration</h4>
        {bulkMessage && <div className="alert alert-success">{bulkMessage}</div>}
        {bulkError && <div className="alert alert-danger">{bulkError}</div>}
        <form onSubmit={handleBulkSubmit}>
          <input className="form-control mb-3" type="file" accept=".csv,text/csv" onChange={(event) => setBulkFile(event.target.files[0])} required />
          <small className="text-muted d-block mb-3">Use the downloaded Excel-compatible CSV format. One participant per row.</small>
          <button className="btn btn-success" type="submit" disabled={!bulkFile}>Import Participants</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
