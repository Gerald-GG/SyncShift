import { useState, useEffect, useCallback } from 'react';
import { Link }    from 'react-router-dom';
import * as api    from '../../api/attendance.api';
import { useAuth } from '../../context/AuthContext';
import Button      from '../../components/Button';
import Card        from '../../components/Card';
import { formatDateTime, formatHours } from '../../utils/formatters';

const Attendance = () => {
  const { user }  = useAuth();
  const [status,  setStatus]  = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [locErr,  setLocErr]  = useState('');

  const getCoords = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      p  => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => reject(new Error('Could not get your location'))
    );
  });

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.getStatus();
      setStatus(data.data);
    } catch {}
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.getHistory({ limit: 10 });
      setHistory(data.data.records);
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([fetchStatus(), fetchHistory()]).finally(() => setLoading(false));
  }, [fetchStatus, fetchHistory]);

  const handleSignIn = async () => {
    setError(''); setLocErr(''); setActionLoading(true);
    try {
      const coords = await getCoords();
      await api.signIn(coords);
      await fetchStatus();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (msg.includes('location')) setLocErr(msg);
      else setError(msg);
    } finally { setActionLoading(false); }
  };

  const handleSignOut = async () => {
    setError(''); setLocErr(''); setActionLoading(true);
    try {
      const coords = await getCoords();
      await api.signOut(coords);
      await Promise.all([fetchStatus(), fetchHistory()]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (msg.includes('location')) setLocErr(msg);
      else setError(msg);
    } finally { setActionLoading(false); }
  };

  if (loading) return <div style={{ padding:'40px', textAlign:'center', color:'#6b7280' }}>Loading...</div>;

  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', padding:'24px' }}>
      <div style={{ maxWidth:'700px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h2 style={{ fontWeight:'800', fontSize:'22px' }}>Attendance</h2>
          <Link to="/dashboard" style={{ fontSize:'14px' }}>← Dashboard</Link>
        </div>

        <Card style={{ marginBottom:'24px', textAlign:'center' }}>
          <div style={{ marginBottom:'16px' }}>
            <span style={{
              display:'inline-block', padding:'6px 16px', borderRadius:'999px', fontSize:'13px', fontWeight:'600',
              background: status?.clocked_in ? '#d1fae5' : '#fee2e2',
              color:      status?.clocked_in ? '#065f46' : '#991b1b',
            }}>
              {status?.clocked_in ? '● Clocked In' : '○ Not Clocked In'}
            </span>
          </div>

          {status?.clocked_in && (
            <p style={{ color:'#6b7280', fontSize:'14px', marginBottom:'16px' }}>
              Since {formatDateTime(status.session?.signed_in_at)}
            </p>
          )}

          {locErr && <p className="error" style={{ marginBottom:'12px' }}>{locErr}</p>}
          {error  && <p className="error" style={{ marginBottom:'12px' }}>{error}</p>}

          {status?.clocked_in
            ? <Button variant="danger" loading={actionLoading} onClick={handleSignOut}>Clock Out</Button>
            : <Button loading={actionLoading} onClick={handleSignIn}>Clock In</Button>
          }
        </Card>

        <Card>
          <h3 style={{ fontWeight:'700', marginBottom:'16px' }}>Recent Sessions</h3>
          {history.length === 0
            ? <p style={{ color:'#6b7280', fontSize:'14px' }}>No sessions recorded yet.</p>
            : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #e5e7eb' }}>
                    {['Date','Sign In','Sign Out','Hours','Late'].map(h => (
                      <th key={h} style={{ padding:'8px', textAlign:'left', color:'#6b7280', fontWeight:'600' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom:'1px solid #f3f4f6', background: i%2===0?'#fff':'#f9fafb' }}>
                      <td style={{ padding:'8px' }}>{formatDateTime(s.signed_in_at).split(',')[0]}</td>
                      <td style={{ padding:'8px' }}>{formatDateTime(s.signed_in_at).split(',')[1]}</td>
                      <td style={{ padding:'8px' }}>{s.signed_out_at ? formatDateTime(s.signed_out_at).split(',')[1] : <span style={{color:'#dc2626'}}>Missing</span>}</td>
                      <td style={{ padding:'8px' }}>{formatHours(s.hours_worked)}</td>
                      <td style={{ padding:'8px' }}>{s.is_late ? <span style={{color:'#d97706'}}>Yes</span> : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
