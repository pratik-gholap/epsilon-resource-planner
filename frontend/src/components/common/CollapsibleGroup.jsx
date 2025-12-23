export default function CollapsibleGroup({ 
  id, 
  title, 
  icon, 
  count, 
  isExpanded = false, 
  onToggle, 
  children 
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem',
          background: 'var(--bg-tertiary)',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '0.5rem',
          transition: 'all 0.2s ease',
          border: '1px solid var(--border)'
        }}
        onClick={onToggle}
      >
        <div style={{
          fontWeight: 600,
          fontSize: '0.95rem',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>{icon}</span>
          <span>{title}</span>
          <span style={{
            background: 'rgba(245, 158, 11, 0.2)',
            color: 'var(--accent-primary)',
            padding: '0.15rem 0.5rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {count}
          </span>
        </div>
        
        <span style={{
          transition: 'transform 0.2s ease',
          fontSize: '1.2rem',
          transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
        }}>
          ▼
        </span>
      </div>
      
      <div style={{
        paddingLeft: '1rem',
        marginBottom: '1rem',
        maxHeight: isExpanded ? '2000px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease, opacity 0.3s ease',
        opacity: isExpanded ? 1 : 0
      }}>
        {children}
      </div>
    </div>
  );
}
