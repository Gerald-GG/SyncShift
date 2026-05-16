const Card = ({ children, style }) => (
  <div style={{
    background:'#fff', borderRadius:'12px', padding:'24px',
    boxShadow:'0 1px 3px rgba(0,0,0,0.1)', border:'1px solid #e5e7eb',
    ...style,
  }}>
    {children}
  </div>
);

export default Card;
