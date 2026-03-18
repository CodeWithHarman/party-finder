import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { postParty } from '../../firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { AddressSearch } from './AddressSearch';
import {
  FormField,
  TextInput,
  TextArea,
  ToggleSwitch,
  NumberStepper,
} from '../ui/FormFields';

// ── Validation schema ────────────────────────────────────────
const schema = z.object({
  address:    z.string().min(5, 'Please enter a full address'),
  message:    z.string().max(280, 'Max 280 characters').optional(),
  date:       z.string().min(1, 'Please pick a date and time'),
  maxPeople:  z.number().min(1).max(500),
  parking:    z.boolean(),
  byob:       z.boolean(),
});

/**
 * PostPartyForm
 * Props:
 *   onSuccess(partyId) - called after successful post
 */
export const PostPartyForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [geocodedCoords, setGeocodedCoords] = useState(null);
  const [geocodeRequired, setGeocodeRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      address:   '',
      message:   '',
      date:      '',
      maxPeople: 20,
      parking:   false,
      byob:      false,
    },
  });

  const messageValue = watch('message') || '';

  const onSubmit = async (data) => {
    if (!geocodedCoords) {
      setGeocodeRequired(true);
      return;
    }
    setGeocodeRequired(false);
    setSubmitting(true);
    try {
      const partyId = await postParty(
        { ...data, lat: geocodedCoords.lat, lng: geocodedCoords.lng },
        user
      );
      onSuccess(partyId);
    } catch (err) {
      console.error('Failed to post party:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Min datetime = now (no past parties)
  const minDate = new Date(Date.now() + 30 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Address ── */}
        <FormField
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
                  setGeocodedCoords(null); // reset until re-verified
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
        </FormField>

        {/* ── Date & Time ── */}
        <FormField
          label="Date & Time"
          required
          error={errors.date?.message}
        >
          <TextInput
            type="datetime-local"
            min={minDate}
            error={errors.date?.message}
            {...register('date')}
            style={{ colorScheme: 'dark' }}
          />
        </FormField>

        {/* ── Guest limit ── */}
        <FormField
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
                min={1}
                max={500}
                error={errors.maxPeople?.message}
              />
            )}
          />
        </FormField>

        {/* ── Message ── */}
        <FormField
          label="Message"
          hint="Vibes, dress code, what to bring… (optional)"
          error={errors.message?.message}
        >
          <div style={{ position: 'relative' }}>
            <TextArea
              placeholder="Casual rooftop hangout, bring good energy 🌙"
              maxLength={280}
              error={errors.message?.message}
              {...register('message')}
            />
            <span style={{
              position: 'absolute', bottom: '8px', right: '12px',
              fontSize: '11px',
              color: messageValue.length > 240 ? 'var(--accent)' : 'var(--text-muted)',
            }}>
              {messageValue.length}/280
            </span>
          </div>
        </FormField>

        {/* ── Toggles ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                accentColor="var(--teal)"
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
                accentColor="var(--purple)"
              />
            )}
          />
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '15px',
            background: submitting ? 'var(--bg-overlay)' : 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: submitting ? 'var(--text-muted)' : 'white',
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: '700',
            letterSpacing: '-0.01em',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition)',
            boxShadow: submitting ? 'none' : 'var(--shadow-accent)',
            marginTop: '8px',
          }}
          onMouseEnter={(e) => {
            if (!submitting) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 40px var(--accent-glow)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = submitting ? 'none' : 'var(--shadow-accent)';
          }}
        >
          {submitting ? 'Posting…' : '🎉 Drop the pin'}
        </button>
      </div>
    </form>
  );
};