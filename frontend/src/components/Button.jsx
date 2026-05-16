const variants = {
  primary:   { background:'#1a56db', color:'#fff', border:'none' },
  secondary: { background:'#f3f4f6', color:'#374151', border:'1px solid #e5e7eb' },
  danger:    { background:'#dc2626', color:'#fff', border:'none' },
};

const Button = ({ children, variant = 'primary', loading, style, ...props }) => (
  <button
    style={{
      padding:'10px 20px', borderRadius:'8px', fontSize:'14px', fontWeight:'600',
      cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
      opacity: loading || props.disabled ? 0.7 : 1,
      transition:'opacity 0.2s',
      ...variants[variant],
      ...style,
    }}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? 'Please wait...' : children}
  </button>
);

export default Button;
