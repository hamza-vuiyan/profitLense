import { useState, useEffect } from 'react';
import { getAdminConfig, updateAdminConfig, getDocsTeam, addTeamMember, deleteTeamMember } from '../api';
import Sidebar from '../components/Sidebar';

export default function AdminPage() {
  const [config, setConfig] = useState({
    isVisible: true,
    visibleFrom: '',
    visibleUntil: '',
    pitchText: '',
    techText: ''
  });
  const [team, setTeam] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configData, teamData] = await Promise.all([
        getAdminConfig(),
        getDocsTeam()
      ]);
      // Format dates for datetime-local input if present
      setConfig({
        ...configData,
        visibleFrom: configData.visibleFrom ? configData.visibleFrom.slice(0, 16) : '',
        visibleUntil: configData.visibleUntil ? configData.visibleUntil.slice(0, 16) : ''
      });
      setTeam(teamData);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminConfig({
        isVisible: config.isVisible,
        visibleFrom: config.visibleFrom || null,
        visibleUntil: config.visibleUntil || null,
        pitchText: config.pitchText,
        techText: config.techText
      });
      setMessage('Configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to save config.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addTeamMember(newMember);
      setNewMember({ name: '', role: '', email: '', imageUrl: '' });
      fetchData(); // reload team
    } catch (err) {
      console.error(err);
      setMessage('Failed to add team member.');
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await deleteTeamMember(id);
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete team member.');
    }
  };

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <div className="content"><div className="empty"><div className="em-icon">⏳</div><p>Loading admin panel…</p></div></div>
    </div>
  );

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'var(--font)', fontSize: '.88rem', outline: 'none', background: 'var(--surface)' };
  const labelStyle = { display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '.82rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.05em' };

  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <div className="topbar">
          <div>
            <div className="page-title">⚙️ Admin Panel</div>
            <div className="page-sub">Manage /docs visibility, content, and team</div>
          </div>
          <div className={`chip`}>
            <span className={`dot ${config.isVisible ? 'green' : 'amber'}`} />
            /docs is {config.isVisible ? 'PUBLIC' : 'HIDDEN'}
          </div>
        </div>

        <div className="page-body">
          {message && (
            <div style={{ padding: '14px 20px', background: 'rgba(5,150,105,.12)', border: '1px solid rgba(5,150,105,.25)', borderRadius: 'var(--radius)', marginBottom: 24, color: 'var(--emerald)', fontWeight: 600 }}>
              ✅ {message}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
            {/* LEFT: Config form */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title"><span className="icon">📋</span> Visibility & Content</div>
              </div>
              <form onSubmit={handleSaveConfig} style={{ padding: 24 }}>

                <div style={{ marginBottom: 22, padding: '16px 20px', borderRadius: 10, border: '2px solid var(--border)', background: config.isVisible ? 'rgba(5,150,105,.06)' : 'rgba(245,158,11,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Make /docs Publicly Visible</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: 2 }}>Toggle ON to show the docs page to judges</div>
                  </div>
                  <label style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: 48, height: 26 }}>
                    <input type="checkbox" checked={config.isVisible} onChange={e => setConfig({ ...config, isVisible: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', inset: 0, borderRadius: 26, background: config.isVisible ? 'var(--emerald)' : '#cbd5e1', transition: '.3s', cursor: 'pointer' }}>
                      <span style={{ position: 'absolute', left: config.isVisible ? 24 : 2, top: 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: '.3s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                    </span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={labelStyle}>Visible From (Optional)</label>
                    <input type="datetime-local" value={config.visibleFrom} onChange={e => setConfig({ ...config, visibleFrom: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Visible Until (Optional)</label>
                    <input type="datetime-local" value={config.visibleUntil} onChange={e => setConfig({ ...config, visibleUntil: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Additional Pitch Deck Notes</label>
                  <textarea rows="6" value={config.pitchText} onChange={e => setConfig({ ...config, pitchText: e.target.value })} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }} placeholder="Any extra context to show below the built-in pitch sections…" />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Additional Tech Notes</label>
                  <textarea rows="6" value={config.techText} onChange={e => setConfig({ ...config, techText: e.target.value })} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }} placeholder="Any extra architecture or design decisions to highlight…" />
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" />Saving…</> : '💾 Save Configuration'}
                </button>
              </form>
            </div>

            {/* RIGHT: Team management */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title"><span className="icon">➕</span> Add Team Member</div>
                </div>
                <form onSubmit={handleAddMember} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input required placeholder="Full name *" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} style={inputStyle} />
                  <input required placeholder="Role / Title *" value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} style={inputStyle} />
                  <input type="email" placeholder="Email (optional)" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} style={inputStyle} />
                  <input placeholder="Image URL (optional)" value={newMember.imageUrl} onChange={e => setNewMember({ ...newMember, imageUrl: e.target.value })} style={inputStyle} />
                  <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Add Member</button>
                </form>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title"><span className="icon">👥</span> Current Team</div>
                  <span className="panel-tag blue">{team.length} members</span>
                </div>
                <div style={{ padding: '8px 0' }}>
                  {team.length === 0 && <div style={{ padding: '20px 24px', color: 'var(--text-3)', fontSize: '.85rem' }}>No members yet.</div>}
                  {team.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {m.imageUrl
                          ? <img src={m.imageUrl} alt={m.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{m.name[0]}</div>
                        }
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{m.name}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{m.role}</div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteMember(m.id)} title="Remove" style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontSize: 16, padding: '4px 8px', borderRadius: 6 }}>🗑️</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="footer">
          <span className="footer-brand">ProfitLens © {new Date().getFullYear()}</span>
          <span className="footer-author">Made with <span className="footer-author-heart">❤️</span> by <strong>BrainFreezed Org</strong></span>
        </footer>
      </div>
    </div>
  );
}
