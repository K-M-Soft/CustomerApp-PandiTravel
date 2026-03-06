'use client';

import { useState } from 'react';
import type { Pricing } from '@/lib/data';
import DatePicker from 'react-datepicker';
import { hu } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

interface BookingFormProps {
  pricings: Pricing[];
  onSuccess?: () => void;
}

export default function BookingForm({ pricings, onSuccess }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    from_location: '',
    to_location: '',
    pricingId: pricings[0]?.id || 0,
    date: '',
    passengers: 1,
    tripType: 'one-way',
    luggageCount: 0,
    luggageSize: '',
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Clear field-level validation error while the user edits the field.
    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'pricingId' || name === 'passengers' || name === 'luggageCount' 
        ? parseInt(value) || 0
        : value,
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'A név megadása kötelező.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Az email cím megadása kötelező.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Kérlek, érvényes email címet adj meg.';
    }

    if (!formData.from_location.trim()) {
      errors.from_location = 'Az indulási hely megadása kötelező.';
    }

    if (!formData.to_location.trim()) {
      errors.to_location = 'A célhely megadása kötelező.';
    }

    if (!selectedDate) {
      errors.date = 'A foglalás dátuma kötelező.';
    }

    if (!formData.passengers || formData.passengers < 1 || formData.passengers > 4) {
      errors.passengers = 'Az utasok száma 1 és 4 között lehet.';
    }

    if (!formData.tripType) {
      errors.tripType = 'Az utazás típusának kiválasztása kötelező.';
    }

    if (formData.luggageCount > 0 && !formData.luggageSize.trim()) {
      errors.luggageSize = 'A csomagok méretét add meg, ha van csomag.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Convert selected date to ISO string format
      const dateString = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, date: dateString }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Booking failed');
      }

      setSuccess(true);
      setSelectedDate(null);
      setFieldErrors({});
      setFormData({
        name: '',
        email: '',
        phone: '',
        from_location: '',
        to_location: '',
        pricingId: pricings[0]?.id || 0,
        date: '',
        passengers: 1,
        tripType: 'one-way',
        luggageCount: 0,
        luggageSize: '',
        notes: '',
      });

      onSuccess?.();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-gradient-to-r from-[rgb(244,204,126)] to-[rgb(244,204,126)] text-white p-4 rounded-xl flex items-center space-x-3">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Sikeres foglalás! Hamarosan fog kapni egy megerősítő emailt a foglalásáról.</span>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl flex items-center space-x-3">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Hiba: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="group">
          <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Név *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
              fieldErrors.name
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
                : 'border-slate-600 focus:border-[rgb(244,204,126)] focus:ring-[rgba(244,204,126,0.25)]'
            }`}
            placeholder="Teljes név"
          />
          {fieldErrors.name && <p className="mt-1 text-sm text-red-400">{fieldErrors.name}</p>}
        </div>

        {/* Email */}
        <div className="group">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
              fieldErrors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
                : 'border-slate-600 focus:border-[rgb(244,204,126)] focus:ring-[rgba(244,204,126,0.25)]'
            }`}
            placeholder="email@example.com"
          />
          {fieldErrors.email && <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>}
        </div>

        {/* Phone */}
        <div className="group">
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[rgb(244,204,126)] focus:ring-2 focus:ring-[rgba(244,204,126,0.25)]"
            placeholder="+36 20 123 4567"
          />
        </div>

        {/* Pricing */}
        <div className="group">
          <label htmlFor="pricingId" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Díjcsomag *
          </label>
          <select
            id="pricingId"
            name="pricingId"
            value={formData.pricingId}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-[rgb(244,204,126)] focus:ring-2 focus:ring-[rgba(244,204,126,0.25)]"
          >
            {pricings.map((pricing) => (
              <option key={pricing.id} value={pricing.id}>
                {pricing.name}
              </option>
            ))}
          </select>
        </div>

        {/* From Location */}
        <div className="group">
          <label htmlFor="from_location" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Indulási hely *
          </label>
          <input
            type="text"
            id="from_location"
            name="from_location"
            value={formData.from_location}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
              fieldErrors.from_location
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
                : 'border-slate-600 focus:border-[rgb(244,204,126)] focus:ring-[rgba(244,204,126,0.25)]'
            }`}
            placeholder="pl. Budapest"
          />
          {fieldErrors.from_location && <p className="mt-1 text-sm text-red-400">{fieldErrors.from_location}</p>}
        </div>

        {/* To Location */}
        <div className="group">
          <label htmlFor="to_location" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Célhely *
          </label>
          <input
            type="text"
            id="to_location"
            name="to_location"
            value={formData.to_location}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
              fieldErrors.to_location
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
                : 'border-slate-600 focus:border-[rgb(244,204,126)] focus:ring-[rgba(244,204,126,0.25)]'
            }`}
            placeholder="pl. Debrecen"
          />
          {fieldErrors.to_location && <p className="mt-1 text-sm text-red-400">{fieldErrors.to_location}</p>}
        </div>

        {/* Date */}
        <div className="group">
          <label htmlFor="date" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Foglalás dátuma *
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => {
              setSelectedDate(date);
              setFieldErrors((prev) => {
                if (!prev.date) {
                  return prev;
                }
                const next = { ...prev };
                delete next.date;
                return next;
              });
            }}
            dateFormat="yyyy.MM.dd"
            locale={hu}
            minDate={new Date()}
            placeholderText="Válasszon dátumot"
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
              fieldErrors.date
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
                : 'border-slate-600 focus:border-[rgb(244,204,126)] focus:ring-[rgba(244,204,126,0.25)]'
            }`}
            calendarClassName="bg-slate-800 border-slate-600"
            wrapperClassName="w-full"
          />
          {fieldErrors.date && <p className="mt-1 text-sm text-red-400">{fieldErrors.date}</p>}
        </div>

        {/* Passengers */}
        <div className="group">
          <label htmlFor="passengers" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Utasok száma *
          </label>
          <input
            type="number"
            id="passengers"
            name="passengers"
            value={formData.passengers}
            onChange={handleChange}
            min="1"
            max="4"
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 ${
              fieldErrors.passengers
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
                : 'border-slate-600 focus:border-[rgb(244,204,126)] focus:ring-[rgba(244,204,126,0.25)]'
            }`}
          />
          {fieldErrors.passengers && <p className="mt-1 text-sm text-red-400">{fieldErrors.passengers}</p>}
        </div>

        {/* Trip Type */}
        <div className="group">
          <label htmlFor="tripType" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Utazás típusa *
          </label>
          <select
            id="tripType"
            name="tripType"
            value={formData.tripType}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 ${
              fieldErrors.tripType
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
                : 'border-slate-600 focus:border-[rgb(244,204,126)] focus:ring-[rgba(244,204,126,0.25)]'
            }`}
          >
            <option value="one-way">Csak oda</option>
            <option value="round-trip">Oda-vissza</option>
          </select>
          {fieldErrors.tripType && <p className="mt-1 text-sm text-red-400">{fieldErrors.tripType}</p>}
        </div>

        {/* Luggage Count */}
        <div className="group">
          <label htmlFor="luggageCount" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
            Csomagok száma
          </label>
          <input
            type="number"
            id="luggageCount"
            name="luggageCount"
            value={formData.luggageCount}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-[rgb(244,204,126)] focus:ring-2 focus:ring-[rgba(244,204,126,0.25)]"
          />
        </div>

        {/* Luggage Size - Only show if luggageCount > 0 */}
        {formData.luggageCount > 0 && (
          <div className="group">
            <label htmlFor="luggageSize" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
              Csomagok mérete
            </label>
            <input
              type="text"
              id="luggageSize"
              name="luggageSize"
              value={formData.luggageSize}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                fieldErrors.luggageSize
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
                  : 'border-slate-600 focus:border-[rgb(244,204,126)] focus:ring-[rgba(244,204,126,0.25)]'
              }`}
              placeholder="pl. kicsi, közepes, nagy"
            />
            {fieldErrors.luggageSize && <p className="mt-1 text-sm text-red-400">{fieldErrors.luggageSize}</p>}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="group">
        <label htmlFor="notes" className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]">
          Megjegyzések
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[rgb(244,204,126)] focus:ring-2 focus:ring-[rgba(244,204,126,0.25)] resize-none"
          placeholder="Bármilyen további információ az utazásról..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[rgb(244,204,126)] disabled:bg-gray-400 text-black font-bold py-4 px-6 rounded-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Foglalás folyamatban...</span>
          </>
        ) : (
          <>
            <span>FOGLALÁS</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
