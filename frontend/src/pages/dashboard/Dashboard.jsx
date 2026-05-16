import { useAuth } from '../../context/AuthContext';
import Card        from '../../components/Card';
import Button      from '../../components/Button';
import { Link }    from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', padding:'24px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontSize:'24px', fontWeight:'800', color:'#1a56db' }}>SyncShift</h1>
            <p style={{ color:'#6b7280', fontSize:'14px' }}>Welcome back, {user?.name}</p>
          </div>
          <Button variant="secondary" onClick={logout}>Sign Out</Button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'16px' }}>
          <Card>
            <h3 style={{ fontWeight:'700', marginBottom:'8px' }}>Clock In / Out</h3>
            <p style={{ color:'#6b7280', fontSize:'14px', marginBottom:'16px' }}>Record your attendance for today</p>
            <Link to="/attendance">
              <Button style={{ width:'100%' }}>Go to Attendance</Button>
            </Link>
          </Card>
          {['admin','superadmin'].includes(user?.role) && (
            <Card>
              <h3 style={{ fontWeight:'700', marginBottom:'8px' }}>Reports</h3>
              <p style={{ color:'#6b7280', fontSize:'14px', marginBottom:'16px' }}>View attendance reports</p>
              <Link to="/reports">
                <Button style={{ width:'100%' }}>View Reports</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
