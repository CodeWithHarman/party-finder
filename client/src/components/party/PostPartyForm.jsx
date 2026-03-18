import { useState, useRef, useEffect, useCallback } from 'react';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { postParty } from '../../firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { AddressSearch } from './AddressSearch';

// ── Validation schema ─────────────────────────────────────────
const schema = z.object({
  address:   z.string().min(5, 'Please enter a full address'),
  message:   z.string().max(280, 'Max 280 characters').optional(),
  date:      z.string().min(1, 'Please pick a date and time'),
  maxPeople: z.number().min(1).max(500),
  parking:   z.boolean(),
  byob:      z.boolean(),
});

// ── Design tokens ─────────────────────────────────────────────
const tokens = {
  white:        '#FFFFFF',
  offWhite:     '#F7F8FA',
  surface:      '#FFFFFF',
  border:       '#E8EAF0',
  borderFocus:  '#6C63FF',
  text:         '#11131A',
  textSub:      '#6B7280',
  textMuted:    '#9CA3AF',
  accent:       '#6C63FF',
  accentLight:  '#EEF0FF',
  accentSoft:   'rgba(108,99,255,0.12)',
  teal:         '#00C9A7',
  tealLight:    '#E6FAF7',
  coral:        '#FF6B6B',
  amber:        '#F59E0B',
  purple:       '#9B59B6',
  purpleLight:  '#F5EEF8',
  shadow:       '0 2px 12px rgba(0,0,0,0.07)',
  shadowMd:     '0 8px 28px rgba(0,0,0,0.10)',
  shadowLg:     '0 20px 60px rgba(108,99,255,0.18)',
  radius:       '14px',
  radiusSm:     '10px',
  radiusXs:     '8px',
  transition:   'all 0.18s cubic-bezier(0.4,0,0.2,1)',
};

// ── Sub-components ────────────────────────────────────────────

const Label = ({ children, required }) => (
  <label style={{
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: tokens.text,
    marginBottom: '7px',
    letterSpacing: '0.01em',
    fontFamily: "'DM Sans', sans-serif",
  }}>
    {children}
    {required && <span style={{ color: tokens.accent, marginLeft: '3px' }}>*</span>}
  </label>
);

const Hint = ({ children }) => (
  <p style={{
    margin: '5px 0 0',
    fontSize: '12px',
    color: tokens.textMuted,
    fontFamily: "'DM Sans', sans-serif",
  }}>{children}</p>
);

const ErrorMsg = ({ children }) => children ? (
  <p style={{
    margin: '6px 0 0',
    fontSize: '12px',
    color: tokens.coral,
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }}>
    <span>⚠</span> {children}
  </p>
) : null;

const FieldWrap = ({ label, required, hint, error, children }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    {children}
    {hint && !error && <Hint>{hint}</Hint>}
    {error && <ErrorMsg>{error}</ErrorMsg>}
  </div>
);

const inputBase = {
  width: '100%',
  padding: '12px 14px',
  background: tokens.offWhite,
  border: `1.5px solid ${tokens.border}`,
  borderRadius: tokens.radiusSm,
  fontSize: '14px',
  color: tokens.text,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  transition: tokens.transition,
  boxSizing: 'border-box',
};

const StyledInput = React.forwardRef(({ error, style, ...props }, ref) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      ref={ref}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
      style={{
        ...inputBase,
        borderColor: error ? tokens.coral : focused ? tokens.borderFocus : tokens.border,
        boxShadow: focused ? `0 0 0 3px ${tokens.accentSoft}` : 'none',
        ...style,
      }}
    />
  );
});

const StyledTextArea = React.forwardRef(({ error, ...props }, ref) => {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      ref={ref}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
      style={{
        ...inputBase,
        resize: 'none',
        minHeight: '90px',
        lineHeight: '1.5',
        borderColor: error ? tokens.coral : focused ? tokens.borderFocus : tokens.border,
        boxShadow: focused ? `0 0 0 3px ${tokens.accentSoft}` : 'none',
      }}
    />
  );
});

StyledTextArea.displayName = 'StyledTextArea';

// Number Stepper
const NumberStepper = ({ value, onChange, min, max }) => {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const btnStyle = (disabled) => ({
    width: '36px', height: '36px',
    border: `1.5px solid ${tokens.border}`,
    borderRadius: tokens.radiusXs,
    background: disabled ? tokens.offWhite : tokens.white,
    color: disabled ? tokens.textMuted : tokens.text,
    fontSize: '18px', fontWeight: '400',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: tokens.transition,
    lineHeight: 1,
    flexShrink: 0,
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button type="button" onClick={dec} disabled={value <= min} style={btnStyle(value <= min)}>−</button>
      <div style={{
        minWidth: '52px', textAlign: 'center',
        fontSize: '20px', fontWeight: '700',
        color: tokens.text, fontFamily: "'DM Sans', sans-serif",
      }}>{value}</div>
      <button type="button" onClick={inc} disabled={value >= max} style={btnStyle(value >= max)}>+</button>
      <span style={{ fontSize: '13px', color: tokens.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
        guests max
      </span>
    </div>
  );
};

// Toggle Switch
const ToggleSwitch = ({ checked, onChange, emoji, label, description, accentColor }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '13px 16px',
        borderRadius: tokens.radiusSm,
        border: `1.5px solid ${checked ? accentColor : tokens.border}`,
        background: checked ? `${accentColor}10` : tokens.offWhite,
        cursor: 'pointer',
        transition: tokens.transition,
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: '22px', flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: tokens.text, fontFamily: "'DM Sans', sans-serif" }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: '12px', color: tokens.textMuted, marginTop: '1px', fontFamily: "'DM Sans', sans-serif" }}>
            {description}
          </div>
        )}
      </div>
      {/* pill toggle */}
      <div style={{
        width: '42px', height: '24px', borderRadius: '999px',
        background: checked ? accentColor : tokens.border,
        position: 'relative', transition: tokens.transition, flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: '3px',
          left: checked ? '21px' : '3px',
          width: '18px', height: '18px',
          borderRadius: '50%', background: tokens.white,
          transition: tokens.transition,
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }} />
      </div>
    </div>
  );
};

// Section divider
const SectionDivider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
    <div style={{ flex: 1, height: '1px', background: tokens.border }} />
    <span style={{ fontSize: '11px', fontWeight: '600', color: tokens.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
      {label}
    </span>
    <div style={{ flex: 1, height: '1px', background: tokens.border }} />
  </div>
);

// Map placeholder with zoom controls (white background, zoom in/out)
const MapPreview = ({ coords }) => {
  const [zoom, setZoom]       = useState(14);
  const [mapUrl, setMapUrl]   = useState('');

  useEffect(() => {
    if (!coords) return;
    // Use OpenStreetMap static-ish tile via iframe embed — white/light theme
    const { lat, lng } = coords;
    const delta = Math.pow(2, 14 - zoom) * 0.005;
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
    setMapUrl(
      `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=cyclemap&marker=${lat},${lng}`
    );
  }, [coords, zoom]);

  if (!coords) return null;

  return (
    <div style={{
      borderRadius: tokens.radius,
      overflow: 'hidden',
      border: `1.5px solid ${tokens.border}`,
      boxShadow: tokens.shadow,
      position: 'relative',
      marginTop: '6px',
    }}>
      <iframe
        key={mapUrl}
        src={mapUrl}
        width="100%"
        height="220"
        style={{ display: 'block', border: 'none', filter: 'saturate(0.7) brightness(1.05)' }}
        title="Party location map"
        loading="lazy"
      />
      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: '12px', right: '12px',
        display: 'flex', flexDirection: 'column', gap: '4px',
      }}>
        {[{ label: '+', action: () => setZoom(z => Math.min(18, z + 1)) },
          { label: '−', action: () => setZoom(z => Math.max(8,  z - 1)) }].map(({ label, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            style={{
              width: '32px', height: '32px',
              background: tokens.white,
              border: `1.5px solid ${tokens.border}`,
              borderRadius: '8px',
              fontSize: '18px', fontWeight: '500',
              color: tokens.text,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: tokens.shadow,
              transition: tokens.transition,
              lineHeight: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = tokens.accentLight}
            onMouseLeave={e => e.currentTarget.style.background = tokens.white}
          >{label}</button>
        ))}
      </div>
      {/* Zoom badge */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '12px',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(4px)',
        border: `1px solid ${tokens.border}`,
        borderRadius: '6px',
        padding: '3px 8px',
        fontSize: '11px', fontWeight: '600',
        color: tokens.textSub,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Zoom {zoom}
      </div>
    </div>
  );
};

// ── Main Form ─────────────────────────────────────────────────
export const PostPartyForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [geocodedCoords, setGeocodedCoords] = useState(null);
  const [geocodeRequired, setGeocodeRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      address: '', message: '', date: '',
      maxPeople: 20, parking: false, byob: false,
    },
  });

  const messageValue = watch('message') || '';
  const minDate = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16);

  const onSubmit = async (data) => {
    if (!geocodedCoords) { setGeocodeRequired(true); return; }
    setGeocodeRequired(false);
    setSubmitting(true);
    try {
      const partyId = await postParty(
        { ...data, lat: geocodedCoords.lat, lng: geocodedCoords.lng },
        user
      );
      setSubmitted(true);
      onSuccess(partyId);
    } catch (err) {
      console.error('Failed to post party:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Syne:wght@700;800&display=swap');

        .ppf-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 40px rgba(108,99,255,0.32) !important;
        }
        .ppf-submit-btn:active:not(:disabled) {
          transform: translateY(0px) !important;
        }
        .ppf-card {
          animation: ppf-slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes ppf-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          opacity: 0.5;
          cursor: pointer;
        }
      `}</style>

      <div className="ppf-card" style={{
        background: tokens.white,
        borderRadius: '20px',
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.shadowMd,
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: '500px',
        margin: '0 auto',
      }}>

        {/* Header */}
        <div style={{
          padding: '28px 28px 22px',
          borderBottom: `1px solid ${tokens.border}`,
          background: `linear-gradient(135deg, #F7F8FF 0%, ${tokens.white} 100%)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: tokens.accentLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', flexShrink: 0,
            }}>🎉</div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '20px', fontWeight: '800',
                color: tokens.text,
                fontFamily: "'Syne', sans-serif",
                letterSpacing: '-0.02em',
              }}>Drop a Party Pin</h2>
              <p style={{
                margin: '2px 0 0', fontSize: '13px',
                color: tokens.textSub,
              }}>Fill in the details — keep it spicy 🌶️</p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* ── Location ── */}
            <SectionDivider label="Where & When" />

            <FieldWrap
              label="Party Address"
              required
              error={errors.address?.message || (geocodeRequired ? 'Verify your address on the map first' : '')}
            >
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <AddressSearch
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      setGeocodedCoords(null);
                    }}
                    onGeocode={(result) => {
                      if (result) {
                        setGeocodedCoords({ lat: result.lat, lng: result.lng });
                        setGeocodeRequired(false);
                      } else {
                        setGeocodedCoords(null);
                      }
                    }}
                    error={errors.address?.message}
                  />
                )}
              />
              {/* Map preview with zoom controls */}
              <MapPreview coords={geocodedCoords} />
            </FieldWrap>

            <FieldWrap label="Date & Time" required error={errors.date?.message}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <StyledInput
                    type="datetime-local"
                    min={minDate}
                    error={errors.date?.message}
                    style={{ colorScheme: 'light', cursor: 'pointer' }}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
            </FieldWrap>

            {/* ── Details ── */}
            <SectionDivider label="Party Details" />

            <FieldWrap
              label="Max Guests"
              hint="How many people are you comfortable having over?"
              error={errors.maxPeople?.message}
            >
              <Controller
                name="maxPeople"
                control={control}
                render={({ field }) => (
                  <NumberStepper
                    value={field.value}
                    onChange={field.onChange}
                    min={1} max={500}
                  />
                )}
              />
            </FieldWrap>

            <FieldWrap
              label="Message"
              hint="Vibes, dress code, what to bring… (optional)"
              error={errors.message?.message}
            >
              <div style={{ position: 'relative' }}>
                <StyledTextArea
                  placeholder="Casual rooftop hangout — bring good energy 🌙"
                  maxLength={280}
                  error={errors.message?.message}
                  {...register('message')}
                />
                <span style={{
                  position: 'absolute', bottom: '10px', right: '12px',
                  fontSize: '11px', fontWeight: '500',
                  color: messageValue.length > 240 ? tokens.coral : tokens.textMuted,
                  transition: tokens.transition,
                }}>
                  {messageValue.length}/280
                </span>
              </div>
            </FieldWrap>

            {/* ── Options ── */}
            <SectionDivider label="Options" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Controller
                name="parking"
                control={control}
                render={({ field }) => (
                  <ToggleSwitch
                    checked={field.value}
                    onChange={field.onChange}
                    emoji="🚗"
                    label="Parking available"
                    description="Street or driveway parking nearby"
                    accentColor={tokens.teal}
                  />
                )}
              />
              <Controller
                name="byob"
                control={control}
                render={({ field }) => (
                  <ToggleSwitch
                    checked={field.value}
                    onChange={field.onChange}
                    emoji="🍺"
                    label="BYOB"
                    description="Bring your own drinks"
                    accentColor={tokens.purple}
                  />
                )}
              />
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={submitting}
              className="ppf-submit-btn"
              style={{
                width: '100%',
                padding: '15px',
                background: submitting
                  ? tokens.border
                  : `linear-gradient(135deg, ${tokens.accent} 0%, #8B5CF6 100%)`,
                border: 'none',
                borderRadius: tokens.radius,
                color: submitting ? tokens.textMuted : tokens.white,
                fontFamily: "'Syne', sans-serif",
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '0.01em',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: submitting ? 'none' : '0 6px 24px rgba(108,99,255,0.28)',
                marginTop: '4px',
              }}
            >
              {submitting ? 'Posting…' : '🎉 Drop the Pin'}
            </button>

          </div>
        </form>
      </div>
    </>
  );
};