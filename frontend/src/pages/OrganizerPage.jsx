import { useEffect, useState } from 'react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = { name: '', email: '', password: '', phone: '' };

const OrganizerPage = () => {
  const [organizers, setOrganizers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [error, setError] = useState('');

  const fetchOrganizers = async () => {
    try {
      const response = await api.get('/organizers');
      setOrganizers(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load organizers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('/organizers', form);
      setCreatedCredentials(response.data);
      setForm(emptyForm);
      fetchOrganizers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create organizer.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading organizers..." />;

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h3 className="fw-bold mb-3">Create Organizer</h3>
            {createdCredentials && (
              <div className="alert alert-success">
                <div className="fw-semibold">Share these credentials with the organizer</div>
                <div>Username: {createdCredentials.email}</div>
                <div>Password: {createdCredentials.password}</div>
              </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <input className="form-control mb-3" name="name" placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              <input className="form-control mb-3" name="email" type="email" placeholder="Username / email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              <input className="form-control mb-3" name="password" type="password" placeholder="Temporary password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
              <input className="form-control mb-3" name="phone" placeholder="Phone (optional)" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              <button className="btn btn-primary w-100" type="submit">Create Organizer Account</button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h3 className="fw-bold mb-3">Organizers</h3>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Name</th><th>Username</th><th>Status</th></tr></thead>
                <tbody>{organizers.map((organizer) => (
                  <tr key={organizer.id}><td>{organizer.name}</td><td>{organizer.email}</td><td><span className="badge bg-success">Active</span></td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerPage;
