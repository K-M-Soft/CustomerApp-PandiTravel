'use client';

import { useState } from 'react';
import { useToast } from '@/components/ToastProvider';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

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
      [name]: value,
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

    if (!formData.message.trim()) {
      errors.message = 'Az üzenet megadása kötelező.';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Az üzenet legyen legalább 10 karakter.';
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

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Üzenetküldés sikertelen');
      }

      showToast('Üzenet sikeresen elküldve! Hamarosan válaszolunk.', 'success');
      setFieldErrors({});
      setFormData({
        name: '',
        email: '',
        message: '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ismeretlen hiba történt';
      showToast(`Hiba: ${message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="group">
          <label
            htmlFor="contact-name"
            className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]"
          >
            Név *
          </label>
          <input
            type="text"
            id="contact-name"
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

        <div className="group">
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]"
          >
            Email *
          </label>
          <input
            type="email"
            id="contact-email"
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
      </div>

      <div className="group">
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-[rgb(244,204,126)]"
        >
          Üzenet *
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 resize-none ${
            fieldErrors.message
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
              : 'border-slate-600 focus:border-[rgb(244,204,126)] focus:ring-[rgba(244,204,126,0.25)]'
          }`}
          placeholder="Írd meg, miben segíthetünk..."
        />
        {fieldErrors.message && <p className="mt-1 text-sm text-red-400">{fieldErrors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto bg-[rgb(244,204,126)] disabled:bg-gray-400 text-black font-bold py-3 px-8 rounded-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? 'Küldés...' : 'Üzenet küldése'}
      </button>
    </form>
  );
}
