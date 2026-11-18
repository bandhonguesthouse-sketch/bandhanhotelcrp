import React, { useState } from 'react';
import { Users, Bed, Check, Calendar, Eye, Wind, Fan } from 'lucide-react';
import { Lang, RoomItem } from '../types/site';

interface RoomsSectionProps {
  lang: Lang;
  rooms: RoomItem[];
  onOpenBooking: (roomId?: string) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({ lang, rooms, onOpenBooking }) => {
  const [selectedRoomPreview, setSelectedRoomPreview] = useState<RoomItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'ac' | 'non-ac'>('all');

  const filteredRooms =
    filterType === 'all' ? rooms : rooms.filter((r) => r.type === filterType);

  return (
    <section id="rooms" className="py-20 bg-stone-950 text-stone-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Interactive AC/Non-AC Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-2">
              {lang === 'bn' ? 'আবাসন ও রুম ভাড়া' : 'Accommodation & Tariffs'}
            </p>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
              {lang === 'bn' ? 'আরামদায়ক এসি ও নন-এসি রুম' : 'Comfortable AC & Non-AC Rooms'}
            </h2>
            <p className="mt-2 text-stone-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'প্রতিটি রুমে রয়েছে আরামদায়ক অর্থোপেডিক বিছানা, অ্যাটাচড আধুনিক বাথরুম, হাই-স্পিড ওয়াই-ফাই এবং ২৪ ঘণ্টা নিরাপত্তা।'
                : 'Every room features orthopedic bedding, private modern bathrooms, fiber Wi-Fi, and 24-hour backup power.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-xl self-start">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filterType === 'all' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'সব রুম' : 'All Rooms'} ({rooms.length})
            </button>
            <button
              onClick={() => setFilterType('ac')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filterType === 'ac' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'এসি রুম' : 'AC Rooms'}
            </button>
            <button
              onClick={() => setFilterType('non-ac')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filterType === 'non-ac' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'নন-এসি' : 'Non-AC'}
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRooms.map((room) => {
            const displayName = lang === 'bn' ? room.nameBn || room.name : room.name;
            const displayDesc = lang === 'bn' ? room.descriptionBn || room.description : room.description;

            return (
              <div
                key={room.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/40 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                    <img
                      src={room.image}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-stone-200">
                      <span className="font-mono tabular-nums">
                        {room.sizeSqFt} sq. ft. · {room.type === 'ac' ? 'AC' : 'Non-AC'}
                      </span>
                      <button
                        onClick={() => setSelectedRoomPreview(room)}
                        className="inline-flex items-center gap-1 bg-stone-900/90 border border-stone-700 px-2.5 py-1 rounded-md text-stone-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Clean unboxed metadata lead-in (zero-pill rule) */}
                    <div className="flex items-center justify-between gap-2 text-xs text-stone-400 mb-2">
                      <span className="inline-flex items-center gap-1">
                        {room.type === 'ac' ? (
                          <Wind className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Fan className="w-3.5 h-3.5 text-stone-400" />
                        )}
                        <span>{room.type === 'ac' ? 'Air Conditioned' : 'Ventilated Non-AC'}</span>
                      </span>
                      <span
                        className={
                          room.available
                            ? 'text-emerald-400 font-medium'
                            : 'text-rose-400 font-medium'
                        }
                      >
                        {room.available
                          ? lang === 'bn'
                            ? 'বুকিং চালু'
                            : 'Available'
                          : lang === 'bn'
                          ? 'বুকড'
                          : 'Unavailable'}
                      </span>
                    </div>

                    <h3 className="font-serif-luxury text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {displayName}
                    </h3>

                    {/* BDT Tariff */}
                    <div className="mt-3 pb-3 border-b border-stone-800 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                        ৳{room.price.toLocaleString('en-US')}
                      </span>
                      {room.originalPrice > room.price && (
                        <span className="text-xs text-stone-500 line-through font-mono tabular-nums">
                          ৳{room.originalPrice.toLocaleString('en-US')}
                        </span>
                      )}
                      <span className="text-xs text-stone-400">
                        {lang === 'bn' ? '/ রাত' : '/ night'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-xs text-stone-300">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        {room.maxGuests} {lang === 'bn' ? 'জন' : 'Guests'}
                      </span>
                      <span aria-hidden="true" className="text-stone-600">·</span>
                      <span className="inline-flex items-center gap-1 truncate">
                        <Bed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{room.bedType}</span>
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-stone-400 leading-relaxed line-clamp-3">
                      {displayDesc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    disabled={!room.available}
                    onClick={() => onOpenBooking(room.id)}
                    className={`w-full py-2.5 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                      room.available
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer shadow'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {room.available
                        ? lang === 'bn'
                          ? 'রুম বুক করুন'
                          : 'Book Room'
                        : lang === 'bn'
                        ? 'বর্তমানে বন্ধ'
                        : 'Currently Closed'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Room Detail Modal */}
        {selectedRoomPreview && (
          <div
            className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedRoomPreview(null)}
          >
            <div
              className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-5 bg-stone-950">
                <img
                  src={selectedRoomPreview.image}
                  alt={selectedRoomPreview.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-white">
                    {lang === 'bn'
                      ? selectedRoomPreview.nameBn || selectedRoomPreview.name
                      : selectedRoomPreview.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    {selectedRoomPreview.bedType} · {selectedRoomPreview.sizeSqFt} sq. ft. · Inventory: {selectedRoomPreview.totalInventory} rooms
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                    ৳{selectedRoomPreview.price.toLocaleString('en-US')}
                  </span>
                  <span className="block text-xs text-stone-400">per night</span>
                </div>
              </div>

              <p className="text-sm text-stone-300 leading-relaxed mb-5">
                {lang === 'bn'
                  ? selectedRoomPreview.descriptionBn || selectedRoomPreview.description
                  : selectedRoomPreview.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300 mb-6">
                {selectedRoomPreview.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  onClick={() => setSelectedRoomPreview(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white cursor-pointer"
                >
                  {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
                <button
                  disabled={!selectedRoomPreview.available}
                  onClick={() => {
                    const id = selectedRoomPreview.id;
                    setSelectedRoomPreview(null);
                    onOpenBooking(id);
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-xs font-bold rounded-lg cursor-pointer"
                >
                  {lang === 'bn' ? 'বুকিং এগিয়ে নিন' : 'Proceed to Book'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
