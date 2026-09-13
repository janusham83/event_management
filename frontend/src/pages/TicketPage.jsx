import { useEffect, useState } from 'react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const categories = ['Registration Issue', 'QR Issue', 'Attendance Issue', 'Payment Issue', 'Guest Issue', 'Other'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

const emptyForm = {
  participant_id: 1,
  function_id: 1,
  category: 'Registration Issue',
  description: '',
  priority: 'High',
  status: 'Open',
};

const TicketPage = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingTicket, setEditingTicket] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketResponse, participantResponse, functionResponse] = await Promise.all([
          api.get('/tickets'),
          api.get('/participants'),
          api.get('/functions'),
        ]);
        setTickets(ticketResponse.data);
        setParticipants(participantResponse.data);
        setFunctions(functionResponse.data);
        if (user?.role === 'organizer') {
          setForm((currentForm) => ({ ...currentForm, function_id: user.function_id }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTicket) {
        await api.put(`/tickets/${editingTicket.id}`, form);
      } else {
        await api.post('/tickets', form);
      }

      setForm(emptyForm);
      setEditingTicket(null);
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setForm({
      participant_id: ticket.participant_id,
      function_id: ticket.function_id,
      category: ticket.category,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTicket(null);
    setForm(emptyForm);
  };

  const handleDelete = async (ticket) => {
    if (!window.confirm(`Delete ticket ${ticket.ticket_number}?`)) return;

    try {
      await api.delete(`/tickets/${ticket.id}`);
      setTickets((currentTickets) => currentTickets.filter((item) => item.id !== ticket.id));
      if (editingTicket?.id === ticket.id) handleCancelEdit();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner label="Loading tickets..." />;

  const visibleParticipants = participants.filter((participant) => {
    const target = `${participant.full_name} ${participant.mobile_number} ${participant.registration_number}`.toLowerCase();
    return target.includes(participantSearch.toLowerCase());
  });

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-3">{editingTicket ? 'Edit Issue Ticket' : 'Register Issue Ticket'}</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Search Participant</label>
                <input className="form-control mb-2" value={participantSearch} onChange={(event) => setParticipantSearch(event.target.value)} placeholder="Name, mobile, or registration number" />
                <select className="form-select" name="participant_id" value={form.participant_id} onChange={handleChange} required>
                  <option value="">Select participant</option>
                  {visibleParticipants.map((participant) => <option key={participant.id} value={participant.id}>{participant.full_name} - {participant.registration_number}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Function</label>
                <select className="form-select" name="function_id" value={form.function_id} onChange={handleChange} disabled={user?.role === 'organizer'} required>
                  <option value="">Select function</option>
                  {functions.map((event) => <option key={event.id} value={event.id}>{event.name} - {event.date}</option>)}
                </select>
                {user?.role === 'organizer' && <small className="text-muted">Your assigned function is selected automatically.</small>}
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Priority</label>
                <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                  {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" rows="4" value={form.description} onChange={handleChange} required />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" type="submit">{editingTicket ? 'Update Ticket' : 'Create Ticket'}</button>
                {editingTicket && <button className="btn btn-outline-secondary" type="button" onClick={handleCancelEdit}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Issue Tickets</h4>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Participant</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.ticket_number}</td>
                      <td>{ticket.participant?.full_name}</td>
                      <td>{ticket.category}</td>
                      <td><span className="badge bg-warning text-dark">{ticket.priority}</span></td>
                      <td><span className="badge bg-info">{ticket.status}</span></td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => handleEdit(ticket)} title="Edit ticket">
                            <i className="bi bi-pencil"></i>
                            <span className="visually-hidden">Edit</span>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleDelete(ticket)} title="Delete ticket">
                            <i className="bi bi-trash"></i>
                            <span className="visually-hidden">Delete</span>
                          </button>
                        </div>
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

export default TicketPage;
