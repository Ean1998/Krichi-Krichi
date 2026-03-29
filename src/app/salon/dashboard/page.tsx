'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Salon { id: string; name: string; description: string; address: string; city: string; phone: string; email: string; cover_image: string; logo: string; rating: number; review_count: number; }
interface Service { id: string; name: string; description: string; price: number; duration: number; category: string; }
interface Booking { id: string; customer_name: string; customer_phone: string; booking_date: string; booking_time: string; status: string; total_price: number; commission: number; service_name: string; notes: string; }
interface Photo { id: string; url: string; caption: string; }

export default function SalonDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tab, setTab] = useState<'overview' | 'services' | 'photos' | 'bookings' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [noSalon, setNoSalon] = useState(false);

  // Service form
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', duration: '30', category: '' });
  const [serviceError, setServiceError] = useState('');
  const [serviceSuccess, setServiceSuccess] = useState('');
  const [serviceLoading, setServiceLoading] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ name: '', description: '', address: '', city: '', phone: '', email: '' });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login?callbackUrl=/salon/dashboard');
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      loadSalonData();
      loadBookings();
    }
  }, [session]);

  const loadSalonData = async () => {
    try {
      const res = await fetch('/api/salons/my-salon');
      if (res.ok) {
        const salonData = await res.json();
        if (salonData.salon) {
          setSalon(salonData.salon);
          setServices(salonData.services || []);
          setPhotos(salonData.photos || []);
          setSettingsForm({
            name: salonData.salon.name || '',
            description: salonData.salon.description || '',
            address: salonData.salon.address || '',
            city: salonData.salon.city || '',
            phone: salonData.salon.phone || '',
            email: salonData.salon.email || '',
          });
        } else {
          setNoSalon(true);
        }
      } else {
        setNoSalon(true);
      }
    } catch (err) {
      console.error('Failed to load salon data:', err);
      setNoSalon(true);
    }
    setLoading(false);
  };

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceError('');
    setServiceSuccess('');
    setServiceLoading(true);

    try {
      const res = await fetch('/api/salons/my-salon/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceForm.name,
          description: serviceForm.description,
          price: parseFloat(serviceForm.price),
          duration: parseInt(serviceForm.duration),
          category: serviceForm.category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setServices([...services, data.service]);
        setServiceForm({ name: '', description: '', price: '', duration: '30', category: '' });
        setServiceSuccess('Service added successfully!');
        setTimeout(() => setServiceSuccess(''), 3000);
      } else {
        const data = await res.json();
        setServiceError(data.error || 'Failed to add service. Please try again.');
      }
    } catch (err) {
      setServiceError('Network error. Please check your connection and try again.');
    }

    setServiceLoading(false);
  };

  const deleteService = async (serviceId: string) => {
    const res = await fetch(`/api/salons/my-salon/services?id=${serviceId}`, { method: 'DELETE' });
    if (res.ok) setServices(services.filter(s => s.id !== serviceId));
  };

  const uploadImage = async (file: File, type: 'photo' | 'cover' | 'logo') => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) return;
    const { url } = await res.json();

    if (type === 'photo') {
      const res2 = await fetch('/api/salons/my-salon/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res2.ok) {
        const data = await res2.json();
        setPhotos([data.photo, ...photos]);
      }
    } else {
      const update = type === 'cover' ? { cover_image: url } : { logo: url };
      await fetch(`/api/salons/${salon?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settingsForm, ...update }),
      });
      setSalon({ ...salon!, ...(type === 'cover' ? { cover_image: url } : { logo: url }) });
    }
  };

  const deletePhoto = async (photoId: string) => {
    const res = await fetch(`/api/salons/my-salon/photos?id=${photoId}`, { method: 'DELETE' });
    if (res.ok) setPhotos(photos.filter(p => p.id !== photoId));
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon) return;
    const res = await fetch(`/api/salons/${salon.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsForm),
    });
    if (res.ok) {
      setSalon({ ...salon, ...settingsForm });
      alert('Settings updated!');
    }
  };

  if (status === 'loading' || loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="salon" />
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  if (noSalon) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="salon" />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="card p-10">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold mb-2">No Salon Yet</h2>
          <p className="text-gray-600 mb-6">You haven&apos;t registered a salon. Create one now!</p>
          <a href="/salon/register" className="btn-primary inline-block">Register Salon</a>
        </div>
      </div>
    </div>
  );

  const totalEarnings = bookings.reduce((sum, b) => sum + (Number(b.total_price) || 0) - (Number(b.commission) || 0), 0);
  const totalBookingsCount = bookings.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="salon" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{salon?.name}</h1>
        <p className="text-gray-500 mb-6">Manage your salon, services, and bookings</p>

        {/* Tab nav */}
        <div className="flex overflow-x-auto gap-1 bg-white rounded-xl p-1 shadow-sm mb-6 no-scrollbar">
          {(['overview', 'services', 'photos', 'bookings', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-shrink-0 px-5 py-3 rounded-lg font-medium text-sm transition-all capitalize
                ${tab === t ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:text-primary-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Bookings', value: totalBookingsCount, color: 'bg-blue-50 text-blue-700' },
                { label: 'Your Earnings', value: `$${totalEarnings.toFixed(2)}`, color: 'bg-green-50 text-green-700' },
                { label: 'Rating', value: salon?.rating ? `${Number(salon.rating).toFixed(1)} ★` : 'N/A', color: 'bg-yellow-50 text-yellow-700' },
                { label: 'Reviews', value: salon?.review_count || 0, color: 'bg-purple-50 text-purple-700' },
              ].map(stat => (
                <div key={stat.label} className={`card p-5 ${stat.color}`}>
                  <p className="text-sm font-medium opacity-80">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
            {bookings.slice(0, 5).length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 5).map(b => (
                  <div key={b.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{b.customer_name}</p>
                      <p className="text-sm text-gray-500">{b.service_name} &bull; {b.booking_date} at {b.booking_time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">${b.total_price}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No bookings yet.</p>
            )}
          </div>
        )}

        {/* Services */}
        {tab === 'services' && (
          <div>
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Add New Service</h3>
              {serviceError && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{serviceError}</div>}
              {serviceSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-sm">{serviceSuccess}</div>}
              <form onSubmit={addService} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Service name *" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} required />
                  <input className="input-field" placeholder="Category (e.g., Haircut, Nails)" value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })} />
                </div>
                <input className="input-field" placeholder="Description" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="0.01" min="0" className="input-field" placeholder="Price ($) *" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} required />
                  <input type="number" min="1" className="input-field" placeholder="Duration (min) *" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} required />
                </div>
                <button type="submit" className="btn-primary" disabled={serviceLoading}>
                  {serviceLoading ? 'Adding...' : 'Add Service'}
                </button>
              </form>
            </div>

            <h3 className="text-lg font-semibold mb-3">Your Services ({services.length})</h3>
            <div className="space-y-3">
              {services.map(service => (
                <div key={service.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-sm text-gray-500">{service.category || 'General'} &bull; {service.duration} min</p>
                    {service.description && <p className="text-sm text-gray-400">{service.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary-600">${service.price}</span>
                    <button onClick={() => deleteService(service.id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-gray-500 text-center py-6">No services added yet.</p>}
            </div>
          </div>
        )}

        {/* Photos */}
        {tab === 'photos' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card p-6 text-center">
                <p className="font-medium mb-3">Cover Image</p>
                <div className="h-32 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                  {salon?.cover_image ? <img src={salon.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400">No cover</div>}
                </div>
                <label className="btn-secondary text-sm cursor-pointer inline-block">
                  Upload Cover
                  <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'cover')} />
                </label>
              </div>
              <div className="card p-6 text-center">
                <p className="font-medium mb-3">Logo</p>
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-3 overflow-hidden">
                  {salon?.logo ? <img src={salon.logo} alt="" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400 text-sm">No logo</div>}
                </div>
                <label className="btn-secondary text-sm cursor-pointer inline-block">
                  Upload Logo
                  <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'logo')} />
                </label>
              </div>
              <div className="card p-6 text-center">
                <p className="font-medium mb-3">Add Gallery Photo</p>
                <div className="h-32 bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
                  <span className="text-4xl text-gray-300">+</span>
                </div>
                <label className="btn-primary text-sm cursor-pointer inline-block">
                  Upload Photo
                  <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'photo')} />
                </label>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">Gallery ({photos.length})</h3>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => deletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No gallery photos yet.</p>
            )}
          </div>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">All Bookings ({bookings.length})</h3>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="card p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-lg">{b.customer_name}</p>
                        <p className="text-sm text-gray-500">📞 {b.customer_phone}</p>
                        <p className="text-sm text-gray-600 mt-1">{b.service_name}</p>
                        {b.notes && <p className="text-sm text-gray-400 mt-1">Note: {b.notes}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{b.booking_date} at {b.booking_time}</p>
                        <p className="font-bold text-primary-600">${b.total_price}</p>
                        <p className="text-xs text-gray-400">Commission: ${Number(b.commission).toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">No bookings yet.</p>
            )}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div className="card p-6 md:p-8 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Salon Settings</h3>
            <form onSubmit={updateSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salon Name</label>
                <input className="input-field" value={settingsForm.name} onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={3} value={settingsForm.description} onChange={e => setSettingsForm({ ...settingsForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input className="input-field" value={settingsForm.city} onChange={e => setSettingsForm({ ...settingsForm, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input className="input-field" value={settingsForm.address} onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="input-field" value={settingsForm.phone} onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input className="input-field" value={settingsForm.email} onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
