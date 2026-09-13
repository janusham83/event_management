import { useState } from 'react';
import api from '../api';

const LoginPage = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: 'admin@event.com', password: 'admin123' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', form);
      localStorage.setItem('event_token', response.data.token);
      localStorage.setItem('event_user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message
          || (err.request ? 'Unable to reach the server. Make sure the backend is running on port 8000.' : 'Unable to login. Please verify your credentials.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card border-0 shadow-lg p-3">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="brand-mark mb-3">E</div>
                  <h3 className="fw-bold">EventFlow</h3>
                  <p className="text-muted mb-0">Attendance & Registration Manager</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input className="form-control form-control-lg" name="email" value={form.email} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control form-control-lg" name="password" value={form.password} onChange={handleChange} />
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <button className="btn btn-primary btn-lg w-100" type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Login'}
                  </button>
                </form>

                <div className="mt-4 small text-muted">
                  Demo accounts: admin@event.com / admin123 or staff@event.com / staff123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
