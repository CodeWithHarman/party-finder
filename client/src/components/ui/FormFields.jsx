/**
 * Shared form primitives used by PostPartyForm.
 */

export const FormField = ({ label, hint, error, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{
      fontSize: '13px', fontWeight: '600',
      color: 'var(--text-secondary)',
      letterSpacing: '0.02em',
    }}>
      {label}
      {required && <span style={{ color: 'var(--accent)', marginLeft: '3px' }}>*</span>}
    </label>
    {children}
    {hint && !error && (
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{hint}</span>
    )}
    {error && (
      <span style={{ fontSize: '12px', color: 'var(--accent)' }}>{error}</span>
    )}
  </div>
);

export const TextInput = ({ error, ...props }) => (
  <input
    {...props}
    style={{
      width: '100%',
      padding: '12px 14px',
      background: 'var(--bg-raised)',
      border: `1px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-primary)',
      fontSize: '14px',
      transition: 'border-color var(--transition)',
      boxSizing: 'border-box',
      ...props.style,
    }}
    onFocus={(e) => {
      if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.2)';
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      if (!error) e.target.style.borderColor = 'var(--border)';
      props.onBlur?.(e);
    }}
  />
);

export const TextArea = ({ error, ...props }) => (
  <textarea
    {...props}
    style={{
      width: '100%',
      padding: '12px 14px',
      background: 'var(--bg-raised)',
      border: `1px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-primary)',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '90px',
      transition: 'border-color var(--transition)',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-body)',
      lineHeight: '1.6',
      ...props.style,
    }}
    onFocus={(e) => {
      if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.2)';
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      if (!error) e.target.style.borderColor = 'var(--border)';
      props.onBlur?.(e);
    }}
  />
);

/**
 * ToggleSwitch - styled boolean toggle.
 * Props: checked, onChange, label, description, accentColor
 */
export const ToggleSwitch = ({
  checked,
  onChange,
  label,
  description,
  emoji,
  accentColor = 'var(--teal)',
}) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      background: checked ? `${accentColor}10` : 'var(--bg-raised)',
      border: `1px solid ${checked ? `${accentColor}35` : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all var(--transition)',
      userSelect: 'none',
    }}
    onMouseEnter={(e) => {
      if (!checked) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
    }}
    onMouseLeave={(e) => {
      if (!checked) e.currentTarget.style.borderColor = 'var(--border)';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '20px' }}>{emoji}</span>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {description}
          </div>
        )}
      </div>
    </div>

    {/* Track */}
    <div style={{
      width: '44px', height: '24px',
      background: checked ? accentColor : 'var(--bg-overlay)',
      borderRadius: 'var(--radius-full)',
      position: 'relative',
      transition: 'background var(--transition)',
      flexShrink: 0,
      boxShadow: checked ? `0 0 10px ${accentColor}60` : 'none',
    }}>
      {/* Thumb */}
      <div style={{
        position: 'absolute',
        top: '3px',
        left: checked ? '23px' : '3px',
        width: '18px', height: '18px',
        background: 'white',
        borderRadius: '50%',
        transition: 'left 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  </div>
);

/**
 * NumberStepper - +/- control for whole numbers like guest count.
 */
export const NumberStepper = ({ value, onChange, min = 1, max = 500, error }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    background: 'var(--bg-raised)',
    border: `1px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    width: 'fit-content',
  }}>
    <StepBtn
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      label="−"
    />
    <div style={{
      padding: '10px 24px',
      fontFamily: 'var(--font-display)',
      fontSize: '20px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      minWidth: '80px',
      textAlign: 'center',
      borderLeft: '1px solid var(--border)',
      borderRight: '1px solid var(--border)',
    }}>
      {value}
    </div>
    <StepBtn
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      label="+"
    />
  </div>
);

const StepBtn = ({ onClick, disabled, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '10px 18px',
      background: 'transparent',
      color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
      fontSize: '20px',
      fontWeight: '300',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--transition)',
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.background = 'var(--bg-overlay)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
    }}
  >
    {label}
  </button>
);