import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, Calendar, Users, Bed } from 'lucide-react';
import { Lang, OrderItem } from '../types/site';

interface TrackBookingSectionProps {
  lang: Lang;
}

export const TrackBookingSection: React.FC<TrackBookingSectionProps> = ({ lang }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<Partial<OrderItem> | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return;
    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const res = await fetch(`/api/bookings/track?code=${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Booking not found');
      } else {
        setBooking(data.booking);
      }
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusTone = (status?: string) => {
    switch (status) {
      case 'Confirmed':
        return 'text-emerald-400 border-emerald-700/60 bg-emerald-950/50';
      case 'Checked-in':
        return 'text-sky-400 border-sky-700/60 bg-sky-950/50';
      case 'Completed':
        return 'text-stone-300 border-stone-700 bg-stone-800/60';
      case 'Cancelled':
        return 'text-rose-400 border-rose-700/60 bg-rose-950/50';
      default:
        return 'text-amber-400 border-amber-700/60 bg-amber-950/50';
    }
  };

  return (
    <section
      id="track"
      className="py-16 bg-stone-950 text-stone-100 scroll-mt-20 border-t border-stone-800"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-6">
            <p className="text-xs font-semibold text-amber-400 mb-1.5">
              {lang === 'bn' ? 'লাইভ বুকিং স্ট্যাটাস' : 'Reservation Lookup'}
            </p>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
              {lang === 'bn' ? 'আপনার বুকিং আইডি ট্র্যাক করুন' : 'Track Your Booking Status'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-400">
              {lang === 'bn'
                ? 'বুকিং করার পর প্রাপ্ত আইডি (যেমন BGH-904218) লিখে আপনার বর্তমান অবস্থা দেখুন।'
                : 'Enter your booking reference code (e.g., BGH-904218) to check real-time confirmation status.'}
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. BGH-904218"
              className="flex-1 bg-stone-950 border border-stone-700 text-white font-mono uppercase rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Checking...' : lang === 'bn' ? 'খুঁজুন' : 'Track Status'}</span>
            </button>
          </form>

          {error && (
            <div className="mt-5 max-w-lg mx-auto p-3.5 bg-rose-950/50 border border-rose-800/70 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {booking && (
            <div className="mt-6 p-5 bg-stone-950 border border-stone-800 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
                <div>
                  <span className="text-[11px] text-stone-400 block">Booking Reference</span>
                  <span className="font-mono text-base font-bold text-amber-400">
                    {booking.id}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border ${statusTone(
                    booking.status
                  )}`}
                >
                  {booking.status === 'Confirmed' || booking.status === 'Completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  <span>{booking.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 block mb-0.5">Guest Name</span>
                  <span className="font-semibold text-white">{booking.guestName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block mb-0.5">Room & Package</span>
                  <span className="font-semibold text-white inline-flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-amber-400" />
                    {booking.roomName}
                  </span>
                  <span className="block text-[11px] text-stone-400">{booking.packageName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block mb-0.5">Stay Dates</span>
                  <span className="text-stone-200 inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {booking.checkIn || '-'} → {booking.checkOut || '-'}
                  </span>
                  <span className="block text-[11px] text-stone-400">
                    {booking.nights} Night(s) · <Users className="w-3 h-3 inline" /> {booking.guests}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-stone-500 block mb-0.5">Total Amount</span>
                  <span className="font-mono tabular-nums text-base font-bold text-amber-400">
                    ৳{Number(booking.total || 0).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
