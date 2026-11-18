import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  CheckCircle,
  Printer,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Lang, OrderItem, PackageItem, PublicSettings, RoomItem } from '../types/site';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  rooms: RoomItem[];
  packages: PackageItem[];
  settings: PublicSettings;
  preselectedRoomId?: string;
  initialData?: {
    checkIn: string;
    checkOut: string;
    guests: number;
    packageId?: string;
  };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  lang,
  rooms,
  packages,
  settings,
  preselectedRoomId,
  initialData,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [roomId, setRoomId] = useState(preselectedRoomId || rooms[0]?.id || 'deluxe-ac');
  const [packageId, setPackageId] = useState(initialData?.packageId || packages[0]?.id || '');
  const [checkIn, setCheckIn] = useState(initialData?.checkIn || tomorrow);
  const [checkOut, setCheckOut] = useState(initialData?.checkOut || dayAfter);
  const [guests, setGuests] = useState(initialData?.guests || 2);

  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmed, setConfirmed] = useState<{
    booking: OrderItem;
    whatsappUrl: string;
  } | null>(null);

  useEffect(() => {
    if (preselectedRoomId && rooms.some((r) => r.id === preselectedRoomId)) {
      setRoomId(preselectedRoomId);
    }
  }, [preselectedRoomId, rooms]);

  useEffect(() => {
    if (initialData) {
      if (initialData.checkIn) setCheckIn(initialData.checkIn);
      if (initialData.checkOut) setCheckOut(initialData.checkOut);
      if (initialData.guests) setGuests(initialData.guests);
      if (initialData.packageId !== undefined) setPackageId(initialData.packageId);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const currentRoom = rooms.find((r) => r.id === roomId) || rooms[0];
  const currentPkg = packages.find((p) => p.id === packageId) || null;

  const d1 = new Date(checkIn + 'T00:00:00Z').getTime();
  const d2 = new Date(checkOut + 'T00:00:00Z').getTime();
  const nights =
    Number.isFinite(d1) && Number.isFinite(d2) && d2 > d1
      ? Math.max(1, Math.ceil((d2 - d1) / 86400000))
      : 1;

  const unitRate = currentRoom
    ? currentPkg
      ? currentRoom.type === 'ac'
        ? currentPkg.acPrice
        : currentPkg.nonAcPrice
      : currentRoom.price
    : 0;

  const estimatedTotal = unitRate * nights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          phone,
          roomId: currentRoom?.id,
          packageId: currentPkg?.id || '',
          checkIn,
          checkOut,
          guests,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'বুকিং সম্পন্ন করা যায়নি। অনুগ্রহ করে তথ্য যাচাই করুন।');
      } else {
        setConfirmed({
          booking: data.booking,
          whatsappUrl: data.whatsappUrl || '',
        });
      }
    } catch {
      setErrorMsg('সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setConfirmed(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={resetAndClose}
    >
      <div
        className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full shadow-2xl relative my-6 overflow-hidden text-stone-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-serif-luxury text-xl font-bold text-white">
              {confirmed
                ? lang === 'bn'
                  ? 'বুকিং কনফার্মেশন ভাউচার'
                  : 'Booking Confirmation Voucher'
                : lang === 'bn'
                ? 'অনলাইন রুম বুকিং'
                : 'Reserve Your Stay'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {lang === 'bn' ? settings.businessNameBn : settings.businessName}
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {confirmed ? (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    {lang === 'bn'
                      ? 'আপনার বুকিং রিকোয়েস্ট সফলভাবে সংরক্ষিত হয়েছে!'
                      : 'Reservation Submitted Successfully!'}
                  </h4>
                  <p className="text-xs text-stone-300 mt-1">
                    {lang === 'bn'
                      ? 'বুকিং আইডিটি সংরক্ষণ করুন। পেজের ট্র্যাকিং সেকশন থেকে লাইভ স্ট্যাটাস দেখতে পারবেন।'
                      : 'Save your Booking ID below to check live status anytime in the Track Booking section.'}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-stone-950 border border-stone-800 rounded-xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div>
                    <span className="font-serif-luxury text-base font-bold text-white block">
                      {settings.businessName}
                    </span>
                    <span className="text-stone-400 text-[11px]">{settings.address}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold block text-base">
                      {confirmed.booking.id}
                    </span>
                    <span className="text-stone-500 text-[10px]">Booking ID</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-stone-300">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Guest</span>
                    <span className="font-semibold text-white">{confirmed.booking.guestName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Mobile</span>
                    <span className="font-semibold text-white">{confirmed.booking.phone}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Status</span>
                    <span className="font-semibold text-amber-400">{confirmed.booking.status}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Room</span>
                    <span>{confirmed.booking.roomName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Package</span>
                    <span>{confirmed.booking.packageName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Dates ({confirmed.booking.nights} night)</span>
                    <span>
                      {confirmed.booking.checkIn || '-'} → {confirmed.booking.checkOut || '-'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                  <span className="text-stone-400">Total Payable (BDT):</span>
                  <span className="text-lg font-bold text-amber-400 tabular-nums">
                    ৳{confirmed.booking.total.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'প্রিন্ট ভাউচার' : 'Print Voucher'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {confirmed.whatsappUrl && (
                    <a
                      href={confirmed.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান' : 'Send via WhatsApp'}</span>
                    </a>
                  )}
                  <button
                    onClick={resetAndClose}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    {lang === 'bn' ? 'সম্পন্ন' : 'Done'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Room Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">
                  {lang === 'bn' ? '১. রুম নির্বাচন করুন' : '1. Select Room Category'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rooms.map((room) => (
                    <button
                      type="button"
                      key={room.id}
                      disabled={!room.available}
                      onClick={() => setRoomId(room.id)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        !room.available
                          ? 'opacity-50 bg-stone-950 border-stone-800 cursor-not-allowed'
                          : roomId === room.id
                          ? 'bg-amber-950/35 border-amber-500 cursor-pointer'
                          : 'bg-stone-950 border-stone-800 hover:border-stone-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{lang === 'bn' ? room.nameBn : room.name}</span>
                        <span className="font-mono text-amber-400">৳{room.price}</span>
                      </div>
                      <span className="text-[11px] text-stone-400 block mt-0.5">
                        {room.type === 'ac' ? 'AC' : 'Non-AC'} · Max {room.maxGuests} Guests
                        {!room.available ? ' · Closed' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  {lang === 'bn' ? '২. স্টে প্যাকেজ (ঐচ্ছিক)' : '2. Stay Package'}
                </label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 text-stone-100 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="">
                    {lang === 'bn'
                      ? `স্ট্যান্ডার্ড রুম রেট (৳${currentRoom?.price || 0}/রাত)`
                      : `Standard Room Rate (৳${currentRoom?.price || 0}/night)`}
                  </option>
                  {packages.map((pkg) => {
                    const rate = currentRoom?.type === 'ac' ? pkg.acPrice : pkg.nonAcPrice;
                    return (
                      <option key={pkg.id} value={pkg.id}>
                        {lang === 'bn' ? pkg.nameBn : pkg.name} — ৳{rate} ({pkg.duration})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dates & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    {lang === 'bn' ? 'চেক-ইন' : 'Check-In'}
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    {lang === 'bn' ? 'চেক-আউট' : 'Check-Out'}
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    {lang === 'bn' ? 'অতিথি সংখ্যা' : 'Guests'}
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {lang === 'bn' ? 'জন' : n > 1 ? 'Guests' : 'Guest'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    {lang === 'bn' ? 'অতিথির নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    placeholder={lang === 'bn' ? 'আপনার নাম লিখুন' : 'e.g. Tanvir Ahmed'}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর (BD) *' : 'Mobile Number (BD) *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1">
                  {lang === 'bn' ? 'বিশেষ অনুরোধ (যদি থাকে)' : 'Special Notes (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: আর্লি চেক-ইন, নিচতলার রুম, এয়ারপোর্ট পিকআপ'
                      : 'e.g. Early check-in, airport pickup, lower floor preference'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 text-stone-100 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Rate Summary */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>
                    {currentRoom?.name} ({currentPkg ? currentPkg.name : 'Standard Rate'})
                  </span>
                  <span className="font-mono tabular-nums text-stone-200">
                    ৳{unitRate.toLocaleString('en-US')} × {nights} night(s)
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between text-sm font-bold text-white">
                  <span>{lang === 'bn' ? 'মোট ভাড়া' : 'Total Estimated Rate'}</span>
                  <span className="font-mono tabular-nums text-amber-400 text-base">
                    ৳{estimatedTotal.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !currentRoom?.available}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {submitting
                    ? lang === 'bn'
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Confirming...'
                    : lang === 'bn'
                    ? 'বুকিং কনফার্ম করুন'
                    : 'Confirm Reservation'}
                </span>
              </button>

              <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.advancePaymentPolicy}</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
