export interface Landmark {
  name: string;
  nameBn: string;
  category: 'transit' | 'shopping' | 'attraction' | 'business';
  distance: string;
  timeByCar: string;
  description: string;
  descriptionBn: string;
}

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  tripType: string;
  comment: string;
}

export const LANDMARKS_DATA: Landmark[] = [
  {
    name: 'Hazrat Shahjalal International Airport (DAC)',
    nameBn: 'হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর',
    category: 'transit',
    distance: '3.4 km',
    timeByCar: '10 mins',
    description: 'Smooth access via Airport Road & Jasimuddin Avenue. Airport pickup assistance available on request.',
    descriptionBn: 'এয়ারপোর্ট রোড ও জসিমউদ্দিন এভিনিউ দিয়ে মাত্র ১০ মিনিটের সহজ যাতায়াত।',
  },
  {
    name: 'Uttara North / Centre Metro Rail Station (MRT-6)',
    nameBn: 'উত্তরা সেন্টার মেট্রোরেল স্টেশন',
    category: 'transit',
    distance: '1.8 km',
    timeByCar: '6 mins',
    description: 'Direct rapid transit connection to Farmgate, Karwan Bazar, Shahbagh, and Motijheel.',
    descriptionBn: 'মেট্রোরেল লাইন-৬ এর মাধ্যমে ফার্মগেট, শাহবাগ ও মতিঝিলের সাথে সরাসরি সংযোগ।',
  },
  {
    name: 'Airport Railway Station',
    nameBn: 'বিমানবন্দর রেলওয়ে স্টেশন',
    category: 'transit',
    distance: '3.1 km',
    timeByCar: '9 mins',
    description: 'Major intercity railway hub connecting Dhaka with Chattogram, Sylhet, Rajshahi, and Khulna.',
    descriptionBn: 'চট্টগ্রাম, সিলেট, রাজশাহী ও খুলনাগামী আন্তঃনগর ট্রেনের প্রধান স্টেশন।',
  },
  {
    name: 'Rajlakshmi & Mascot Plaza Shopping Hub',
    nameBn: 'রাজলক্ষ্মী ও মাসকট প্লাজা শপিং মল',
    category: 'shopping',
    distance: '1.1 km',
    timeByCar: '4 mins',
    description: 'Popular commercial plaza with branded boutiques, pharmacies, ATMs, and family restaurants.',
    descriptionBn: 'ব্র্যান্ডেড শপিং, ফার্মেসি, এটিএম বুথ ও ফ্যামিলি রেস্টুরেন্ট সমৃদ্ধ বাণিজ্যিক এলাকা।',
  },
  {
    name: 'Diabari Lake & Uttara Sector 15 Park',
    nameBn: 'দিয়াবাড়ি লেক ও উদ্যান',
    category: 'attraction',
    distance: '3.8 km',
    timeByCar: '12 mins',
    description: 'Scenic lakeside promenade perfect for relaxing evening strolls and family photography.',
    descriptionBn: 'বিকেলের অবসর সময় কাটানো ও হাঁটাহাঁটির জন্য মনোরম প্রাকৃতিক পরিবেশ।',
  },
  {
    name: 'Uttara Sector 4 & 7 Commercial Corporate Zone',
    nameBn: 'উত্তরা কর্পোরেট ও অফিস জোন',
    category: 'business',
    distance: '0.8 km',
    timeByCar: '3 mins',
    description: 'Walking distance to major corporate offices, banks, clinics, and diagnostic centers.',
    descriptionBn: 'ব্যাংক, কর্পোরেট অফিস ও আধুনিক ডায়াগনস্টিক সেন্টারের খুব কাছে অবস্থিত।',
  },
  {
    name: 'Bangladesh Kuwait Maitree & Women\'s Medical',
    nameBn: 'মেডিকেল ও হসপিটাল জোন',
    category: 'business',
    distance: '1.5 km',
    timeByCar: '5 mins',
    description: 'Quick access to specialized hospitals and clinics for medical visitors and families.',
    descriptionBn: 'চিকিৎসা সংক্রান্ত ভ্রমণের জন্য প্রধান হাসপাতালগুলোর অতি সন্নিকটে।',
  },
  {
    name: 'Jamuna Future Park / Bashundhara',
    nameBn: 'যমুনা ফিউচার পার্ক / বসুন্ধরা',
    category: 'shopping',
    distance: '9.5 km',
    timeByCar: '22 mins',
    description: 'South Asia\'s flagship entertainment mall, multiplex cinema, and dining hub via 300ft / Progoti Sarani.',
    descriptionBn: 'সিনেপ্লেক্স, ফুড কোর্ট ও শপিংয়ের জন্য ২২ মিনিটের ড্রাইভে সহজ যাতায়াত।',
  },
];

export const AMENITIES_LIST = [
  {
    title: '100 Mbps Fiber Wi-Fi',
    titleBn: 'হাই-স্পিড ফাইবার ওয়াই-ফাই',
    desc: 'Uninterrupted high-speed wireless internet across all rooms, lobby, and rooftop garden.',
    descBn: 'সব রুম, লবি এবং রুফটপ গার্ডেনে নিরবচ্ছিন্ন ১০০ এমবিপিএস ওয়াই-ফাই সুবিধা।',
    icon: 'Wifi',
  },
  {
    title: '24/7 Generator & IPS Backup',
    titleBn: '২৪/৭ জেনারেটর ও আইপিএস ব্যাকআপ',
    desc: 'Heavy-duty silent generator ensures continuous AC, lighting, and device charging without interruption.',
    descBn: 'লোডশেডিং মুক্ত নিরবচ্ছিন্ন বিদ্যুৎ, এসি ও লাইটিংয়ের সম্পূর্ণ নিশ্চয়তা।',
    icon: 'Zap',
  },
  {
    title: 'Homestyle Kitchen & Dining',
    titleBn: 'ঘরোয়া খাবার ও ডাইনিং সার্ভিস',
    desc: 'Freshly cooked Bangladeshi homestyle meals made to order with pure spices and clean ingredients.',
    descBn: 'অর্ডার অনুযায়ী স্বাস্থ্যসম্মত উপায়ে রান্না করা টাটকা ঘরোয়া খাবার।',
    icon: 'Utensils',
  },
  {
    title: '24-Hour Front Desk & Security',
    titleBn: '২৪ ঘণ্টা ফ্রন্ট ডেস্ক ও নিরাপত্তা',
    desc: 'Friendly bilingual reception staff on duty round-the-clock with full CCTV surveillance.',
    descBn: 'সার্বক্ষণিক সিসিটিভি নজরদারি ও অতিথি সেবায় নিবেদিত রিসেপশন টিম।',
    icon: 'Clock',
  },
  {
    title: 'Daily Sanitized Housekeeping',
    titleBn: 'দৈনিক পরিচ্ছন্নতা ও হাউসকিপিং',
    desc: 'Freshly laundered cotton linens, sanitized washrooms, and spotless rooms prepared daily.',
    descBn: 'প্রতিদিন পরিষ্কার চাদর, স্যানিটাইজড বাথরুম এবং ঝকঝকে পরিচ্ছন্ন রুম।',
    icon: 'Sparkles',
  },
  {
    title: 'Private Gated Parking',
    titleBn: 'নিরাপদ প্রাইভেট পার্কিং',
    desc: 'Complimentary on-premise car and motorcycle parking within our secure gated compound.',
    descBn: 'গেস্ট হাউসের নিজস্ব প্রাঙ্গণে সম্পূর্ণ নিরাপদ ও ফ্রি গাড়ি পার্কিং।',
    icon: 'Car',
  },
  {
    title: 'Airport Transfer & Cab Desk',
    titleBn: 'এয়ারপোর্ট পিকআপ ও ক্যাব সেবা',
    desc: 'On-demand airport shuttle arrangement and reliable city transport assistance.',
    descBn: 'অনুরোধের ভিত্তিতে বিমানবন্দর পিকআপ-ড্রপ ও শহরের যাতায়াত সহায়তা।',
    icon: 'Compass',
  },
  {
    title: 'Pure RO Drinking Water',
    titleBn: 'বিশুদ্ধ আরও (RO) খাবার পানি',
    desc: 'Multi-stage purified drinking water dispensers and sealed complimentary bottles in every room.',
    descBn: 'প্রতিটি রুমে ফ্রি মিনারেল ও ফিল্টার করা বিশুদ্ধ পানীয় জলের ব্যবস্থা।',
    icon: 'Droplets',
  },
];

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    name: 'Engr. Mahmudul Hasan',
    location: 'Chattogram',
    rating: 5,
    date: 'October 2026',
    tripType: 'Business Stay',
    comment: 'Cleanest boutique guest house near the Airport. Silent AC, reliable 100 Mbps Wi-Fi for my Zoom calls, and the homestyle dinner felt truly comforting after a long day.',
  },
  {
    id: 'rev-2',
    name: 'Farhana Rahman & Family',
    location: 'Sylhet',
    rating: 5,
    date: 'September 2026',
    tripType: 'Family Vacation',
    comment: 'Booked the Family Quad AC Suite for 3 nights. Spacious beds, very respectful staff, safe car parking inside the gate, and super quick check-in at midnight.',
  },
  {
    id: 'rev-3',
    name: 'Dr. Ashraful Karim',
    location: 'Rajshahi',
    rating: 5,
    date: 'August 2026',
    tripType: 'Transit & Medical',
    comment: 'Love the transparent BDT packages and instant booking tracking ID. Rooftop garden terrace is so peaceful in the evening. Easily my go-to place in Dhaka.',
  },
];

export const FAQS = [
  {
    q: 'What are the standard check-in and check-out times?',
    qBn: 'চেক-ইন এবং চেক-আউট সময় কখন?',
    a: 'Standard check-in starts at 12:00 PM and check-out is at 11:00 AM. Early check-in or 6-hour Day-Use transit packages are available based on room readiness.',
    aBn: 'চেক-ইন দুপুর ১২:০০ টা এবং চেক-আউট সকাল ১১:০০ টা। রুম খালি থাকা সাপেক্ষে আর্লি চেক-ইন বা ৬ ঘণ্টার ডে-ইউজ প্যাকেজ নেওয়া যায়।',
  },
  {
    q: 'How can I track my reservation after booking?',
    qBn: 'বুকিং করার পর আমার বুকিং স্ট্যাটাস কীভাবে দেখব?',
    a: 'Immediately after submitting a booking, you receive a unique Booking ID (e.g., BGH-904218). Enter that code in the "Track Booking" section on this page to check live confirmation status.',
    aBn: 'বুকিং সাবমিট করার সাথে সাথে আপনি একটি বুকিং আইডি (যেমন BGH-904218) পাবেন। পেজের "Track Booking" সেকশনে আইডিটি দিয়ে লাইভ স্ট্যাটাস দেখতে পারবেন।',
  },
  {
    q: 'What documents are required during check-in?',
    qBn: 'চেক-ইনের সময় কী কী কাগজপত্র প্রয়োজন?',
    a: 'All adult guests must present a valid National ID (NID) card or Passport at the reception desk as part of standard hospitality security compliance.',
    aBn: 'সকল প্রাপ্তবয়স্ক অতিথির জন্য জাতীয় পরিচয়পত্র (NID) অথবা পাসপোর্ট সঙ্গে রাখা বাধ্যতামূলক।',
  },
  {
    q: 'Is homestyle food and room service available?',
    qBn: 'গেস্ট হাউসে খাবারের ব্যবস্থা আছে কি?',
    a: 'Yes! You can choose a Bed & Breakfast or Full Board package while booking, or order freshly cooked Bengali & North Indian meals directly to your room.',
    aBn: 'হ্যাঁ, আমাদের নিজস্ব রান্নাঘরে তৈরি সকালের নাশতা, দুপুর ও রাতের ঘরোয়া খাবার রুম সার্ভিসের মাধ্যমে পাওয়া যায়।',
  },
];
