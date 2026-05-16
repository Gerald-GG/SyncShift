import { useState }       from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth }        from '../../context/AuthContext';
import Button             from '../../components/Button';
import Card               from '../../components/Card';

const Login = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(['admin','superadmin'].includes(user.role) ? '/reports' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <Card style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <h1 style={{ fontSize:'28px', fontWeight:'800', color:'#1a56db' }}>SyncShift</h1>
          <p style={{ color:'#6b7280', marginTop:'4px' }}>Sign in to your account</p>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={onChange} required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={onChange} required />
          </div>
          {error && <p className="error" style={{ marginBottom:'12px' }}>{error}</p>}
          <Button type="submit" loading={loading} style={{ width:'100%' }}>
            Sign In
          </Button>
        </form>
        <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'#6b7280' }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
