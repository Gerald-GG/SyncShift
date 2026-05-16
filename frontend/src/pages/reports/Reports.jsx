import { useState, useEffect } from 'react';
import { Link }   from 'react-router-dom';
import api        from '../../api/axios';
import Card       from '../../components/Card';
import Button     from '../../components/Button';

const Reports = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users')
      .then(r => setUsers(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', padding:'24px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h2 style={{ fontWeight:'800', fontSize:'22px' }}>Attendance Reports</h2>
          <Link to="/dashboard" style={{ fontSize:'14px' }}>← Dashboard</Link>
        </div>
        <Card>
          {loading
            ? <p style={{ color:'#6b7280' }}>Loading users...</p>
            : users.length === 0
              ? <p style={{ color:'#6b7280' }}>No employees found.</p>
              : (
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
                  <thead>
                    <tr style={{ borderBottom:'2px solid #e5e7eb' }}>
                      {['Name','Email','Role','Report'].map(h => (
                        <th key={h} style={{ padding:'10px 8px', textAlign:'left', color:'#6b7280', fontWeight:'600' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} style={{ borderBottom:'1px solid #f3f4f6', background: i%2===0?'#fff':'#f9fafb' }}>
                        <td style={{ padding:'10px 8px', fontWeight:'600' }}>{u.name}</td>
                        <td style={{ padding:'10px 8px', color:'#6b7280' }}>{u.email}</td>
                        <td style={{ padding:'10px 8px' }}>
                          <span style={{ padding:'2px 10px', borderRadius:'999px', fontSize:'12px', background:'#eff6ff', color:'#1a56db', fontWeight:'600' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding:'10px 8px' }}>
                          <Link to={`/reports/${u.id}`}>
                            <Button style={{ padding:'6px 14px', fontSize:'13px' }}>View</Button>
                          </Link>
                        </td>
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

export default Reports;
