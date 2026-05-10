import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

const emptyForm = {
  patient: '', doctor: '', date: '', time: '', type: 'Consultation',
  status: 'Scheduled', symptoms: '', notes: '', fee: ''
};

const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/appointments', { params: { status: statusFilter, date: dateFilter, page, limit: 10 } });
      setAppointments(data.appointments);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to fetch appointments'); }
    setLoading(false);
  }, [statusFilter, dateFilter, page]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  useEffect(() => {
    API.get('/patients', { params: { limit: 200 } }).then(r => setPatients(r.data.patients)).catch(() => {});
    API.get('/doctors', { params: { limit: 200 } }).then(r => setDoctors(r.data.doctors)).catch(() => {});
  }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setEditId(null); setModal(true);
  };

  const openEdit = (a) => {
    setForm({
      patient: a.patient?._id || a.patient,
      doctor: a.doctor?._id || a.doctor,
      date: a.date ? new Date(a.date).toISOString().split('T')[0] : '',
      time: a.time || '',
      type: a.type || 'Consultation',
      status: a.status || 'Scheduled',
      symptoms: a.symptoms || '',
      notes: a.notes || '',
      fee: a.fee || ''
    });
    setEditId(a._id); setModal(true);
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) { await API.put(`/appointments/${editId}`, form); toast.success('Appointment updated'); }
      else { await API.post('/appointments', form); toast.success('Appointment booked'); }
      setModal(false); fetchAppointments();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await API.delete(`/appointments/${id}`); toast.success('Appointment cancelled'); fetchAppointments(); }
    catch { toast.error('Failed to cancel'); }
  };

  const quickStatus = async (id, status) => {
    try { await API.put(`/appointments/${id}`, { status }); toast.success(`Marked as ${status}`); fetchAppointments(); }
    catch { toast.error('Update failed'); }
  };

  const statusColors = { Scheduled: 'scheduled', Completed: 'completed', Cancelled: 'cancelled', 'No-show': 'no-show' };

  return (
    <div>
      <div className="page-header">
        <div><h2>Appointments</h2><p>{total} total appointments</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Book Appointment</button>
      </div>

      <div className="filters-bar">
        <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: 'auto' }} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No-show</option>
        </select>
        {(dateFilter || statusFilter) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setDateFilter(''); setStatusFilter(''); setPage(1); }}>Clear Filters</button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          {loading ? <div className="loading"><div className="spinner" /></div> :
            appointments.length === 0 ? <div className="empty-state"><div className="empty-icon">◷</div><p>No appointments found</p></div> : (
              <table>
                <thead>
                  <tr><th>Apt ID</th><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td><span className="td-mono">{a.appointmentId}</span></td>
                      <td>
                        <span className="td-primary">{a.patient?.name || '—'}</span>
                        <br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{a.patient?.patientId}</span>
                      </td>
                      <td>
                        <span className="td-primary">Dr. {a.doctor?.name || '—'}</span>
                        <br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.doctor?.specialization}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{a.date ? new Date(a.date).toLocaleDateString('en-IN') : '—'}</span>
                        <br /><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{a.time}</span>
                      </td>
                      <td>{a.type}</td>
                      <td><span className={`badge badge-${statusColors[a.status] || a.status?.toLowerCase()}`}>{a.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {a.status === 'Scheduled' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => quickStatus(a._id, 'Completed')} title="Mark Complete" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>✓</button>
                          )}
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(a)}>✎</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(a._id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
        {pages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
            {[...Array(pages)].map((_, i) => <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
            <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editId ? 'Edit Appointment' : 'Book Appointment'}</h3>
              <button className="close-btn" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full"><label>Patient *</label>
                    <select name="patient" value={form.patient} onChange={handleChange} required>
                      <option value="">Select Patient</option>
                      {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
                    </select>
                  </div>
                  <div className="form-group full"><label>Doctor *</label>
                    <select name="doctor" value={form.doctor} onChange={handleChange} required>
                      <option value="">Select Doctor</option>
                      {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Date *</label>
                    <input name="date" type="date" value={form.date} onChange={handleChange} required />
                  </div>
                  <div className="form-group"><label>Time *</label>
                    <select name="time" value={form.time} onChange={handleChange} required>
                      <option value="">Select Time</option>
                      {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Appointment Type</label>
                    <select name="type" value={form.type} onChange={handleChange}>
                      <option>Consultation</option><option>Follow-up</option><option>Emergency</option><option>Checkup</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No-show</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Fee (₹)</label>
                    <input name="fee" type="number" value={form.fee} onChange={handleChange} placeholder="Consultation fee" min="0" />
                  </div>
                  <div className="form-group full"><label>Symptoms / Reason</label>
                    <textarea name="symptoms" value={form.symptoms} onChange={handleChange} placeholder="Chief complaint or symptoms..." rows={2} />
                  </div>
                  <div className="form-group full"><label>Notes / Prescription</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Doctor notes, prescription, follow-up instructions..." rows={2} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editId ? 'Update' : 'Book Appointment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
