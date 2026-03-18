/**
 * RadiusSlider - lets users adjust the party search radius.
 * Range: 0.5km – 20km. Default: 2km.
 */
export const RadiusSlider = ({ value, onChange }) => {
  const min = 0.5;
  const max = 20;
  const pct = ((value - min) / (max - min)) * 100;

  const presets = [1, 2, 5, 10];

  return (
    <div style={{
      padding: '16px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📡</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Search radius
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px', fontWeight: '800',
          color: 'var(--teal)',
          textShadow: '0 0 12px var(--teal-glow)',
        }}>
          {value < 1 ? `${value * 1000}m` : `${value}km`}
        </span>
      </div>

      {/* Slider */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <div style={{
          height: '4px',
          background: 'var(--bg-overlay)',
          borderRadius: 'var(--radius-full)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--teal), var(--purple))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.1s ease',
          }} />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            opacity: 0, cursor: 'pointer',
            margin: 0,
          }}
        />

        {/* Thumb indicator */}
        <div style={{
          position: 'absolute',
          left: `calc(${pct}% - 10px)`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px', height: '20px',
          background: 'var(--teal)',
          borderRadius: '50%',
          border: '3px solid var(--bg-base)',
          boxShadow: 'var(--shadow-teal)',
          transition: 'left 0.1s ease',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Preset chips */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {presets.map((km) => (
          <button
            key={km}
            onClick={() => onChange(km)}
            style={{
              flex: 1,
              padding: '5px 0',
              background: value === km ? 'var(--teal-dim)' : 'var(--bg-raised)',
              border: value === km ? '1px solid rgba(0,229,200,0.35)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: value === km ? 'var(--teal)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={(e) => {
              if (value !== km) e.currentTarget.style.borderColor = 'rgba(0,229,200,0.2)';
            }}
            onMouseLeave={(e) => {
              if (value !== km) e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            {km}km
          </button>
        ))}
      </div>
    </div>
  );
};