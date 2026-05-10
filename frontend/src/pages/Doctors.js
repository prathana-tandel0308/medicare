import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

const DEPARTMENTS = ['Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology','Oncology','Gynecology','General Medicine','Emergency','Radiology','Surgery','ENT'];

const emptyForm = {
  name: '', specialization: '', qualification: '', experience: '',
  phone: '', email: '', department: 'General Medicine', fee: 500, status: 'Active'
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/doctors', { params: { search, department: deptFilter, page, limit: 10 } });
      setDoctors(data.doctors);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to fetch doctors'); }
    setLoading(false);
  }, [search, deptFilter, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (d) => { setForm(d); setEditId(d._id); setModal(true); };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) { await API.put(`/doctors/${editId}`, form); toast.success('Doctor updated'); }
      else { await API.post('/doctors', form); toast.success('Doctor added'); }
      setModal(false); fetchDoctors();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    setSubmitting(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove Dr. ${name}?`)) return;
    try { await API.delete(`/doctors/${id}`); toast.success('Doctor removed'); fetchDoctors(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Medical Staff</h2><p>{total} doctors registered</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
      </div>

      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
          <span className="search-icon">⌕</span>
          <input placeholder="Search name, specialization..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          {loading ? <div className="loading"><div className="spinner" /></div> :
            doctors.length === 0 ? <div className="empty-state"><div className="empty-icon">⚕</div><p>No doctors found</p></div> : (
              <table>
                <thead>
                  <tr><th>Doctor ID</th><th>Name</th><th>Specialization</th><th>Department</th><th>Experience</th><th>Fee (₹)</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {doctors.map(d => (
                    <tr key={d._id}>
                      <td><span className="td-mono">{d.doctorId}</span></td>
                      <td><span className="td-primary">Dr. {d.name}</span><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.qualification}</span></td>
                      <td>{d.specialization}</td>
                      <td>{d.department}</td>
                      <td>{d.experience} yrs</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>₹{d.fee}</td>
                      <td><span className={`badge badge-${d.status?.toLowerCase().replace(' ', '-')}`}>{d.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(d)}>✎</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(d._id, d.name)}>✕</button>
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
              <h3>{editId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button className="close-btn" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full"><label>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Doctor's full name" />
                  </div>
                  <div className="form-group"><label>Specialization *</label>
                    <input name="specialization" value={form.specialization} onChange={handleChange} required placeholder="e.g. Cardiologist" />
                  </div>
                  <div className="form-group"><label>Qualification *</label>
                    <input name="qualification" value={form.qualification} onChange={handleChange} required placeholder="e.g. MBBS, MD" />
                  </div>
                  <div className="form-group"><label>Department *</label>
                    <select name="department" value={form.department} onChange={handleChange}>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Experience (years)</label>
                    <input name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="0" min="0" />
                  </div>
                  <div className="form-group"><label>Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
                  </div>
                  <div className="form-group"><label>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="doctor@hospital.com" />
                  </div>
                  <div className="form-group"><label>Consultation Fee (₹)</label>
                    <input name="fee" type="number" value={form.fee} onChange={handleChange} placeholder="500" min="0" />
                  </div>
                  <div className="form-group"><label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option>Active</option><option>Inactive</option><option>On Leave</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editId ? 'Update Doctor' : 'Add Doctor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
