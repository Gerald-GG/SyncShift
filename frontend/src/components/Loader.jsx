const Loader = ({ message = 'Loading...' }) => (
  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:'12px' }}>
    <div style={{ width:'36px', height:'36px', border:'4px solid #e5e7eb', borderTop:'4px solid #1a56db', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    <p style={{ color:'#6b7280', fontSize:'14px' }}>{message}</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default Loader;
