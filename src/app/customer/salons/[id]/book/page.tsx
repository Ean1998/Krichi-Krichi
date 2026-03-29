'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Service { id: string; name: string; price: number; duration: number; }

function BookingForm() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const router = useRouter();
  const { data: session } = useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState(serviceId || '');
  const [salonName, setSalonName] = useState('');
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    date: '',
    time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/salons/${id}`)
      .then(r => r.json())
      .then(data => {
        setSalonName(data.salon?.name || '');
        setServices(data.services || []);
      });
  }, [id]);

  useEffect(() => {
    if (session?.user) {
      setForm(f => ({ ...f, name: session.user?.name || f.name, email: session.user?.email || f.email }));
    }
  }, [session]);

  const service = services.find(s => s.id === selectedService);
  const commissionRate = 0.15;
  const today = new Date().toISOString().split('T')[0];

  const timeSlots = [];
  for (let h = 9; h <= 19; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) { setError('Please select a service'); return; }
    setLoading(true);
    setError('');

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salon_id: id,
        service_id: selectedService,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        booking_date: form.date,
        booking_time: form.time,
        notes: form.notes,
        total_price: service?.price || 0,
      }),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || 'Booking failed');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar variant="customer" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="card p-10">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-2">Your appointment at <strong>{salonName}</strong> has been booked.</p>
            <p className="text-gray-600 mb-1"><strong>Service:</strong> {service?.name}</p>
            <p className="text-gray-600 mb-1"><strong>Date:</strong> {form.date}</p>
            <p className="text-gray-600 mb-4"><strong>Time:</strong> {form.time}</p>
            <p className="text-sm text-gray-500 mb-6">You will receive a confirmation. The salon will reach out if needed.</p>
            <Link href="/customer" className="btn-primary inline-block">Browse More Salons</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="customer" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/customer/salons/${id}`} className="text-primary-600 hover:text-primary-700 text-sm mb-4 inline-block">&larr; Back to salon</Link>
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Book an Appointment</h2>
          <p className="text-gray-600 mb-6">{salonName}</p>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
              <select className="input-field" value={selectedService} onChange={e => setSelectedService(e.target.value)} required>
                <option value="">Choose a service...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - ${s.price} ({s.duration} min)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="+1 234 567 8900" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" className="input-field" min={today} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select className="input-field" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required>
                  <option value="">Select time...</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any special requests..." />
            </div>

            {service && (
              <div className="bg-primary-50 p-4 rounded-xl">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary-700">${service.price.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full text-lg" disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
