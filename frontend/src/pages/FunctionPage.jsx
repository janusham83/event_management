import { useEffect, useState } from 'react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const FunctionPage = ({ canManage = false }) => {
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    date: '',
    start_time: '',
    end_time: '',
    venue: '',
    description: '',
    status: 'active',
    organizer_name: '',
    organizer_email: '',
    organizer_password: '',
    organizer_phone: '',
  });
  const [credentials, setCredentials] = useState(null);
  const [editingFunction, setEditingFunction] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchFunctions = async () => {
    try {
      const response = await api.get('/functions');
      setFunctions(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunctions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFunction) {
        await api.put(`/functions/${editingFunction.id}`, {
          name: form.name,
          logo_url: form.logo_url,
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time,
          venue: form.venue,
          description: form.description,
          status: form.status,
          organizer_name: form.organizer_name,
          organizer_email: form.organizer_email,
          organizer_password: form.organizer_password || undefined,
          organizer_phone: form.organizer_phone,
        });
      } else {
        const response = await api.post('/functions', form);
        setCredentials(response.data.credentials);
      }
      setEditingFunction(null);
      setForm({
        name: '',
        logo_url: '',
        date: '',
        start_time: '',
        end_time: '',
        venue: '',
        description: '',
        status: 'active',
        organizer_name: '',
        organizer_email: '',
        organizer_password: '',
        organizer_phone: '',
      });
      fetchFunctions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (event) => {
    setEditingFunction(event);
    setCredentials(null);
    setForm({
      name: event.name,
      logo_url: event.logo_url || '',
      date: event.date?.slice(0, 10) || '',
      start_time: event.start_time?.slice(0, 5) || '',
      end_time: event.end_time?.slice(0, 5) || '',
      venue: event.venue,
      description: event.description || '',
      status: event.status,
      organizer_name: event.organizer?.name || '',
      organizer_email: event.organizer?.email || '',
      organizer_password: '',
      organizer_phone: event.organizer?.phone || '',
    });
    setShowPassword(false);
    setShowPassword(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingFunction(null);
    setForm({
      name: '', logo_url: '', date: '', start_time: '', end_time: '', venue: '', description: '', status: 'active',
      organizer_name: '', organizer_email: '', organizer_password: '', organizer_phone: '',
    });
  };

  const handleToggle = async (id) => {
    try {
      await api.post(`/functions/${id}/toggle-status`);
      fetchFunctions();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner label="Loading functions..." />;

  return (
    <div className="row g-4">
      {canManage && <div className="col-lg-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-3">{editingFunction ? 'Edit Function' : 'Create Function'}</h4>
            {credentials && <div className="alert alert-success">
              <div className="fw-semibold">Organizer login created</div>
              <div>Username: {credentials.email}</div>
              <div>Password: {credentials.password}</div>
            </div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Function Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Function Logo URL</label>
                <input type="url" className="form-control" name="logo_url" value={form.logo_url} onChange={handleChange} placeholder="https://example.com/logo.png" />
              </div>
              <div className="mb-3">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-control" name="start_time" value={form.start_time} onChange={handleChange} required />
                </div>
                <div className="col-6">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-control" name="end_time" value={form.end_time} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3 mt-3">
                <label className="form-label">Venue</label>
                <input className="form-control" name="venue" value={form.venue} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3" />
              </div>
              {!editingFunction && <>
                <h6 className="fw-bold mt-4">Organizer Account</h6>
                <input className="form-control mb-3" name="organizer_name" placeholder="Organizer name" value={form.organizer_name} onChange={handleChange} required />
                <input className="form-control mb-3" name="organizer_email" type="email" placeholder="Username / email" value={form.organizer_email} onChange={handleChange} required />
                <input className="form-control mb-3" name="organizer_password" type="password" placeholder="Password" minLength="6" value={form.organizer_password} onChange={handleChange} required />
                <input className="form-control mb-3" name="organizer_phone" placeholder="Phone (optional)" value={form.organizer_phone} onChange={handleChange} />
              </>}
              {editingFunction && <>
                <h6 className="fw-bold mt-4">Organizer Login</h6>
                <input className="form-control mb-3" name="organizer_name" placeholder="Organizer name" value={form.organizer_name} onChange={handleChange} required />
                <input className="form-control mb-3" name="organizer_email" type="email" placeholder="Username / email" value={form.organizer_email} onChange={handleChange} required />
                <div className="input-group mb-3">
                  <input className="form-control" name="organizer_password" type={showPassword ? 'text' : 'password'} placeholder="New password (optional)" minLength="6" value={form.organizer_password} onChange={handleChange} />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
                <input className="form-control mb-3" name="organizer_phone" placeholder="Phone (optional)" value={form.organizer_phone} onChange={handleChange} />
                <small className="text-muted d-block mb-3">Leave the password blank to keep the current password.</small>
              </>}
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" type="submit">{editingFunction ? 'Update Function' : 'Save Function'}</button>
                {editingFunction && <button className="btn btn-outline-secondary" type="button" onClick={handleCancelEdit}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>
      </div>}

      <div className={canManage ? 'col-lg-8' : 'col-12'}>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Events</h4>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Organizer</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {functions.map((event) => (
                    <tr key={event.id}>
                      <td><div className="d-flex align-items-center gap-2">{event.logo_url && <img className="function-logo function-logo-sm" src={event.logo_url} alt="" />}<span>{event.name}</span></div></td>
                      <td>{new Date(event.date).toLocaleDateString()}</td>
                      <td>{event.venue}</td>
                      <td>{event.organizer?.email || 'Not assigned'}</td>
                      <td><span className={`badge bg-${event.status === 'active' ? 'success' : 'secondary'}`}>{event.status}</span></td>
                      <td>
                        {canManage && <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(event)}>Edit</button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleToggle(event.id)}>
                            {event.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionPage;
