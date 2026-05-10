import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

const emptyForm = {
  name: '', age: '', gender: 'Male', phone: '', email: '', address: '',
  bloodGroup: '', status: 'Active',
  emergencyContact: { name: '', phone: '', relation: '' }
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/patients', { params: { search, status: statusFilter, page, limit: 10 } });
      setPatients(data.patients);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to fetch patients'); }
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (p) => {
    setForm({ ...p, emergencyContact: p.emergencyContact || { name: '', phone: '', relation: '' } });
    setEditId(p._id); setModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('ec_')) {
      const key = name.replace('ec_', '');
      setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [key]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await API.put(`/patients/${editId}`, form);
        toast.success('Patient updated');
      } else {
        await API.post('/patients', form);
        toast.success('Patient added');
      }
      setModal(false);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete patient ${name}?`)) return;
    try {
      await API.delete(`/patients/${id}`);
      toast.success('Patient deleted');
      fetchPatients();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Patient Records</h2>
          <p>{total} total patients registered</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Patient</button>
      </div>

      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
          <span className="search-icon">⌕</span>
          <input placeholder="Search name, ID, phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option>Active</option><option>Discharged</option><option>Critical</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : patients.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">◉</div><p>No patients found</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th><th>Name</th><th>Age/Gender</th>
                  <th>Blood Group</th><th>Phone</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p._id}>
                    <td><span className="td-mono">{p.patientId}</span></td>
                    <td><span className="td-primary">{p.name}</span></td>
                    <td>{p.age} / {p.gender}</td>
                    <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--accent-amber)' }}>{p.bloodGroup || '—'}</span></td>
                    <td>{p.phone}</td>
                    <td><span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(p)} title="Edit">✎</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p._id, p.name)} title="Delete">✕</button>
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
            {[...Array(pages)].map((_, i) => (
              <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editId ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button className="close-btn" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full"><label>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Patient full name" />
                  </div>
                  <div className="form-group"><label>Age *</label>
                    <input name="age" type="number" value={form.age} onChange={handleChange} required placeholder="Age" min="0" max="150" />
                  </div>
                  <div className="form-group"><label>Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleChange}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
                  </div>
                  <div className="form-group"><label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="patient@email.com" />
                  </div>
                  <div className="form-group"><label>Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option>Active</option><option>Discharged</option><option>Critical</option>
                    </select>
                  </div>
                  <div className="form-group full"><label>Address</label>
                    <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full address" rows={2} />
                  </div>
                  <div style={{ gridColumn: '1/-1', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emergency Contact</div>
                    <div className="form-grid">
                      <div className="form-group"><label>Contact Name</label>
                        <input name="ec_name" value={form.emergencyContact?.name || ''} onChange={handleChange} placeholder="Contact name" />
                      </div>
                      <div className="form-group"><label>Contact Phone</label>
                        <input name="ec_phone" value={form.emergencyContact?.phone || ''} onChange={handleChange} placeholder="Phone number" />
                      </div>
                      <div className="form-group"><label>Relation</label>
                        <input name="ec_relation" value={form.emergencyContact?.relation || ''} onChange={handleChange} placeholder="e.g. Father" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editId ? 'Update Patient' : 'Add Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
