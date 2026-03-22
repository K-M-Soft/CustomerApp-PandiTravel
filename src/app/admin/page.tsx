'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Pricing, Service, MonthlyView } from '@/lib/data';

type Booking = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  from_location: string;
  to_location: string;
  tripType?: 'one-way' | 'round-trip';
  date?: string;
  passengers?: number;
  serviceName?: string;
  createdAt: string;
};

type DashboardData = {
  monthlyViews: MonthlyView[];
  bookings: Booking[];
  pricings: Pricing[];
  services: Service[];
};


export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [locked, setLocked] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sessionSecret, setSessionSecret] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<DashboardData | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [newPricing, setNewPricing] = useState({
    name: '',
    basePrice: 0,
    pricePerKm: 0,
    description: '',
  });
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    sortOrder: 0,
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/admin/session');
      const result = await response.json();
      setAuthenticated(Boolean(result.authenticated));
      setLocked(Boolean(result.locked));
      if (result.authenticated) {
        await loadDashboard();
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setAuthenticated(false);
      setLocked(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        throw new Error('Dashboard lekérése sikertelen.');
      }
      const result = (await response.json()) as DashboardData;
      setData(result);
    } catch (error) {
      console.error(error);
      setSaveError('Admin adatok lekérése sikertelen.');
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      let response;
      if (locked) {
        response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionSecret }),
        });
      } else {
        response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Belépés sikertelen.');
      }

      if (locked && result.unlocked) {
        setLocked(false);
        setSessionSecret('');
        setLoginError('');
        // Optionally, reload session state
        await checkSession();
        return;
      }

      setAuthenticated(true);
      setUsername('');
      setPassword('');
      setSessionSecret('');
      await loadDashboard();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Belépés sikertelen.');
      // If unlock failed, stay locked
      await checkSession();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setData(null);
    setSaveMessage('');
    setSaveError('');
  };

  const updatePricingField = (id: number, key: keyof Pricing, value: string) => {
    if (!data) return;
    setData({
      ...data,
      pricings: data.pricings.map((pricing) =>
        pricing.id === id
          ? {
              ...pricing,
              [key]: key === 'pricePerKm' || key === 'basePrice' ? Number(value) : value,
            }
          : pricing
      ),
    });
  };

  const updateServiceField = (id: number, key: keyof Service, value: string) => {
    if (!data) return;
    setData({
      ...data,
      services: data.services.map((service) =>
        service.id === id
          ? {
              ...service,
              [key]: key === 'sortOrder' ? Number(value) : value,
            }
          : service
      ),
    });
  };

  const savePricing = async (pricing: Pricing) => {
    setSaveMessage('');
    setSaveError('');

    const response = await fetch('/api/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pricing),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Ár mentése sikertelen.');
    }

    setSaveMessage(`Ár mentve: ${pricing.name}`);
  };

  const createPricing = async () => {
    setSaveMessage('');
    setSaveError('');

    const response = await fetch('/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPricing),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Ár létrehozása sikertelen.');
    }

    setSaveMessage('Új ár létrehozva.');
    setNewPricing({ name: '', basePrice: 0, pricePerKm: 0, description: '' });
    await loadDashboard();
  };

  const saveService = async (service: Service) => {
    setSaveMessage('');
    setSaveError('');

    const response = await fetch('/api/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Szolgáltatás mentése sikertelen.');
    }

    setSaveMessage(`Szolgáltatás mentve: ${service.title}`);
  };

  const createService = async () => {
    setSaveMessage('');
    setSaveError('');

    const response = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newService),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Szolgáltatás létrehozása sikertelen.');
    }

    setSaveMessage('Új szolgáltatás létrehozva.');
    setNewService({ title: '', description: '', sortOrder: 0 });
    await loadDashboard();
  };

  const removeService = async (id: number) => {
    setSaveMessage('');
    setSaveError('');

    const response = await fetch(`/api/services?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Szolgáltatás törlése sikertelen.');
    }

    setSaveMessage('Szolgáltatás törölve.');
    await loadDashboard();
  };

  const removePricing = async (id: number) => {
    setSaveMessage('');
    setSaveError('');

    const response = await fetch(`/api/pricing?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Ár törlése sikertelen.');
    }

    setSaveMessage('Ár törölve.');
    await loadDashboard();
  };

  const monthLabel = (month: string) => {
    const [year, mon] = month.split('-');
    return `${year}. ${mon}.`;
  };

  const tripTypeLabel = (tripType?: string) => {
    if (tripType === 'round-trip') {
      return 'Oda-vissza';
    }
    return 'Csak oda';
  };

  const sortedViews = useMemo(() => {
    if (!data) return [];
    return [...data.monthlyViews].sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [data]);

  if (authenticated === null) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <p>Betöltés...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-black text-white px-4 py-16">
        <div className="max-w-md mx-auto glass-effect border border-[rgba(244,204,126,0.30)] rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-6">Admin belépés</h1>
          {locked ? (
            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Titkos kulcs</label>
                <input
                  type="password"
                  value={sessionSecret}
                  onChange={(e) => setSessionSecret(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-[rgb(244,204,126)]"
                  autoFocus
                />
              </div>
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[rgb(244,204,126)] text-black font-bold py-3 rounded-xl disabled:bg-gray-500"
              >
                {loading ? 'Ellenőrzés...' : 'Feloldás'}
              </button>
              <p className="text-slate-400 text-xs mt-2">Túl sok hibás próbálkozás miatt a fiók zárolva lett. Add meg a titkos kulcsot a feloldáshoz.</p>
            </form>
          ) : (
            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Felhasználónév</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-[rgb(244,204,126)]"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Jelszó</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-[rgb(244,204,126)]"
                />
              </div>
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[rgb(244,204,126)] text-black font-bold py-3 rounded-xl disabled:bg-gray-500"
              >
                {loading ? 'Belépés...' : 'Belépés'}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-zinc-900 to-black text-white px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-bold">Admin felület</h1>
          <div className="flex gap-3">
            <button
              onClick={loadDashboard}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            >
              Frissítés
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
            >
              Kijelentkezés
            </button>
          </div>
        </div>

        {saveMessage && <p className="text-green-400">{saveMessage}</p>}
        {saveError && <p className="text-red-400">{saveError}</p>}

        <section className="glass-effect rounded-2xl p-6 border border-[rgba(244,204,126,0.30)]">
          <h2 className="text-2xl font-bold mb-4">Oldal nézettség hónapokra bontva</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedViews.length === 0 && (
              <div className="text-slate-300">Még nincs nézettségi adat.</div>
            )}
            {sortedViews.map((item) => (
              <div key={item.month} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="text-slate-300">{monthLabel(item.month)}</div>
                <div className="text-2xl font-bold text-[rgb(244,204,126)]">{item.views}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-effect rounded-2xl p-6 border border-[rgba(244,204,126,0.30)] overflow-x-auto">
          <h2 className="text-2xl font-bold mb-4">Foglalások</h2>
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="text-left text-slate-300 border-b border-slate-700">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Név</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Telefonszám</th>
                <th className="py-2 pr-4">Honnan</th>
                <th className="py-2 pr-4">Hová</th>
                <th className="py-2 pr-4">Utazás típusa</th>
                <th className="py-2 pr-4">Dátum</th>
                <th className="py-2 pr-4">Hány fő</th>
                <th className="py-2 pr-4">Szolgáltatás</th>
              </tr>
            </thead>
            <tbody>
              {(data?.bookings || []).map((booking) => (
                <tr key={booking.id} className="border-b border-slate-800 text-slate-200">
                  <td className="py-2 pr-4">{booking.id}</td>
                  <td className="py-2 pr-4">{booking.name}</td>
                  <td className="py-2 pr-4">{booking.email}</td>
                  <td className="py-2 pr-4">{booking.phone || '-'}</td>
                  <td className="py-2 pr-4">{booking.from_location}</td>
                  <td className="py-2 pr-4">{booking.to_location}</td>
                  <td className="py-2 pr-4">{tripTypeLabel(booking.tripType)}</td>
                  <td className="py-2 pr-4">{booking.date || '-'}</td>
                  <td className="py-2 pr-4">{booking.passengers || 1}</td>
                  <td className="py-2 pr-4">{booking.serviceName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="glass-effect rounded-2xl p-6 border border-[rgba(244,204,126,0.30)] space-y-4">
          <h2 className="text-2xl font-bold">Árak szerkesztése</h2>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs text-slate-300 mb-1">Csomag neve</label>
              <input
                value={newPricing.name}
                onChange={(e) => setNewPricing((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Új ár csomag neve"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs text-slate-300 mb-1">Alapdíj (Ft)</label>
              <input
                type="number"
                value={newPricing.basePrice}
                onChange={(e) =>
                  setNewPricing((prev) => ({ ...prev, basePrice: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs text-slate-300 mb-1">Km díj (Ft/km)</label>
              <input
                type="number"
                value={newPricing.pricePerKm}
                onChange={(e) =>
                  setNewPricing((prev) => ({ ...prev, pricePerKm: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs text-slate-300 mb-1">Művelet</label>
              <button
                onClick={async () => {
                  try {
                    await createPricing();
                  } catch (error) {
                    setSaveError(error instanceof Error ? error.message : 'Ár létrehozása sikertelen.');
                  }
                }}
                className="w-full bg-[rgb(244,204,126)] text-black font-bold rounded-lg px-4 py-2"
              >
                Új ár felvétele
              </button>
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs text-slate-300 mb-1">Leírás</label>
              <textarea
                value={newPricing.description}
                onChange={(e) =>
                  setNewPricing((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Új ár csomag leírása"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
                rows={2}
              />
            </div>
          </div>

          {(data?.pricings || []).map((pricing) => (
            <div key={pricing.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-300 mb-1">Csomag neve</label>
                <input
                  value={pricing.name}
                  onChange={(e) => updatePricingField(pricing.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-300 mb-1">Alapdíj (Ft)</label>
                <input
                  type="number"
                  value={pricing.basePrice}
                  onChange={(e) => updatePricingField(pricing.id, 'basePrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-300 mb-1">Km díj (Ft/km)</label>
                <input
                  type="number"
                  value={pricing.pricePerKm}
                  onChange={(e) => updatePricingField(pricing.id, 'pricePerKm', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-300 mb-1">Művelet</label>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await savePricing(pricing);
                      } catch (error) {
                        setSaveError(error instanceof Error ? error.message : 'Ár mentése sikertelen.');
                      }
                    }}
                    className="flex-1 bg-[rgb(244,204,126)] text-black font-bold rounded-lg px-4 py-2"
                  >
                    Mentés
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await removePricing(pricing.id);
                      } catch (error) {
                        setSaveError(
                          error instanceof Error ? error.message : 'Ár törlése sikertelen.'
                        );
                      }
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-3 py-2"
                    title="Ár törlése"
                    aria-label="Ár törlése"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs text-slate-300 mb-1">Leírás</label>
                <textarea
                  value={pricing.description || ''}
                  onChange={(e) => updatePricingField(pricing.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="glass-effect rounded-2xl p-6 border border-[rgba(244,204,126,0.30)] space-y-4">
          <h2 className="text-2xl font-bold">Szolgáltatások szerkesztése</h2>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs text-slate-300 mb-1">Szolgáltatás címe</label>
              <input
                value={newService.title}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Új szolgáltatás cím"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs text-slate-300 mb-1">Sorrend</label>
              <input
                type="number"
                value={newService.sortOrder}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    sortOrder: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-slate-300 mb-1">Leírás</label>
              <textarea
                value={newService.description}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Új szolgáltatás leírás"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
                rows={3}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs text-slate-300 mb-1">Művelet</label>
              <button
                onClick={async () => {
                  try {
                    await createService();
                  } catch (error) {
                    setSaveError(
                      error instanceof Error ? error.message : 'Szolgáltatás létrehozása sikertelen.'
                    );
                  }
                }}
                className="w-full bg-[rgb(244,204,126)] text-black font-bold rounded-lg px-4 py-2"
              >
                Új szolgáltatás
              </button>
            </div>
          </div>

          {(data?.services || []).map((service) => (
            <div key={service.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-300 mb-1">Szolgáltatás címe</label>
                <input
                  value={service.title}
                  onChange={(e) => updateServiceField(service.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-300 mb-1">Sorrend</label>
                <input
                  type="number"
                  value={service.sortOrder}
                  onChange={(e) => updateServiceField(service.id, 'sortOrder', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-300 mb-1">Leírás</label>
                <textarea
                  value={service.description}
                  onChange={(e) => updateServiceField(service.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700"
                  rows={3}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-300 mb-1">Művelet</label>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await saveService(service);
                      } catch (error) {
                        setSaveError(
                          error instanceof Error ? error.message : 'Szolgáltatás mentése sikertelen.'
                        );
                      }
                    }}
                    className="flex-1 bg-[rgb(244,204,126)] text-black font-bold rounded-lg px-4 py-2"
                  >
                    Mentés
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await removeService(service.id);
                      } catch (error) {
                        setSaveError(
                          error instanceof Error ? error.message : 'Szolgáltatás törlése sikertelen.'
                        );
                      }
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-3 py-2"
                    title="Szolgáltatás törlése"
                    aria-label="Szolgáltatás törlése"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
