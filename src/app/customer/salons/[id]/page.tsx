'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';

interface Service { id: string; name: string; description: string; price: number; duration: number; category: string; }
interface Review { id: string; customer_name: string; rating: number; comment: string; created_at: string; }
interface Photo { id: string; url: string; caption: string; }
interface Salon { id: string; name: string; description: string; address: string; city: string; phone: string; email: string; cover_image: string; logo: string; rating: number; review_count: number; opening_hours: string; }

export default function SalonProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tab, setTab] = useState<'services' | 'photos' | 'reviews'>('services');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    fetch(`/api/salons/${id}`)
      .then(r => r.json())
      .then(data => {
        setSalon(data.salon);
        setServices(data.services || []);
        setReviews(data.reviews || []);
        setPhotos(data.photos || []);
      });
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salon_id: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        customer_name: session?.user?.name || reviewForm.name,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setReviews([data.review, ...reviews]);
      setReviewForm({ rating: 5, comment: '', name: '' });
      setReviewMsg('Review submitted!');
      // Update salon rating display
      if (salon) {
        const newCount = salon.review_count + 1;
        const newRating = ((salon.rating * salon.review_count) + reviewForm.rating) / newCount;
        setSalon({ ...salon, rating: newRating, review_count: newCount });
      }
    }
    setSubmitting(false);
  };

  const categories = Array.from(new Set(services.map(s => s.category || 'General')));

  if (!salon) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="customer" />
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="customer" />

      {/* Cover */}
      <div className="h-48 md:h-72 bg-gradient-to-br from-primary-400 to-primary-600 relative">
        {salon.cover_image && <img src={salon.cover_image} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Salon Info */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <div className="card p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary-100 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 -mt-16 md:-mt-20">
              {salon.logo ? (
                <img src={salon.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">💇</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{salon.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                {salon.city && <span>📍 {salon.city}{salon.address ? `, ${salon.address}` : ''}</span>}
                {salon.phone && <span>📞 {salon.phone}</span>}
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  {salon.rating > 0 ? `${salon.rating.toFixed(1)} (${salon.review_count} reviews)` : 'No reviews yet'}
                </span>
              </div>
              {salon.description && <p className="mt-3 text-gray-600">{salon.description}</p>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 bg-white rounded-xl p-1 shadow-sm">
          {(['services', 'photos', 'reviews'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all capitalize
                ${tab === t ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:text-primary-600'}`}>
              {t} {t === 'services' ? `(${services.length})` : t === 'reviews' ? `(${reviews.length})` : `(${photos.length})`}
            </button>
          ))}
        </div>

        {/* Services Tab */}
        {tab === 'services' && (
          <div className="mt-6 space-y-6 pb-10">
            {categories.map(cat => (
              <div key={cat}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{cat}</h3>
                <div className="space-y-3">
                  {services.filter(s => (s.category || 'General') === cat).map(service => (
                    <div key={service.id} className="card p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">{service.duration} min</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-primary-600">${service.price}</p>
                        <Link href={`/customer/salons/${id}/book?service=${service.id}`}
                          className="btn-primary text-xs !py-2 !px-4 mt-2 inline-block">
                          Book
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="text-center py-10 text-gray-500">No services listed yet.</div>
            )}
          </div>
        )}

        {/* Photos Tab */}
        {tab === 'photos' && (
          <div className="mt-6 pb-10">
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="rounded-xl overflow-hidden aspect-square">
                    <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">No photos yet.</div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {tab === 'reviews' && (
          <div className="mt-6 space-y-4 pb-10">
            {/* Review Form */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Leave a Review</h3>
              {reviewMsg && <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-sm">{reviewMsg}</div>}
              <form onSubmit={submitReview} className="space-y-3">
                {!session && (
                  <input className="input-field" placeholder="Your name" value={reviewForm.name}
                    onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} required />
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                        className={`text-2xl transition-transform hover:scale-110 ${n <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea className="input-field" rows={3} placeholder="Write your review..."
                  value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                <button type="submit" className="btn-primary text-sm" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Review List */}
            {reviews.map(review => (
              <div key={review.id} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-900">{review.customer_name}</span>
                    <span className="ml-2 text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-center text-gray-500 py-6">No reviews yet. Be the first!</p>}
          </div>
        )}
      </div>
    </div>
  );
}
