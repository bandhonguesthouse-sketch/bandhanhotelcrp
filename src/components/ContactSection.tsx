import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { FAQS } from '../data/guesthouseData';
import { Lang, PublicSettings } from '../types/site';

interface ContactSectionProps {
  lang: Lang;
  settings: PublicSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang, settings }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryContact, setInquiryContact] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const cleanWa = settings.whatsappNumber.replace(/[^\d]/g, '');

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryContact) return;
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquiryName('');
      setInquiryContact('');
      setInquiryMsg('');
    }, 4000);
  };

  return (
    <section
      id="contact"
      className="py-20 bg-stone-900 text-stone-100 scroll-mt-20 border-t border-stone-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-semibold text-amber-400 mb-2">
            {lang === 'bn' ? '২৪/৭ যোগাযোগ ও নীতিমালা' : '24/7 Assistance & Policies'}
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {lang === 'bn' ? 'যোগাযোগ ও অতিথি নির্দেশিকা' : 'Contact & House Policies'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Call / WhatsApp + Inquiry */}
          <div className="lg:col-span-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${settings.footerContactNumber}`}
                className="p-5 bg-stone-950 border border-stone-800 rounded-2xl hover:border-amber-500/50 transition-colors"
              >
                <Phone className="w-5 h-5 text-amber-400 mb-3" />
                <span className="text-xs text-stone-400 block">
                  {lang === 'bn' ? 'ফ্রন্ট ডেস্ক (২৪ ঘণ্টা)' : 'Front Desk 24/7'}
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {settings.footerContactNumber}
                </span>
              </a>

              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                  `Hello ${settings.businessName}, I would like to inquire about rooms.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-stone-950 border border-stone-800 rounded-2xl hover:border-emerald-500/50 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-emerald-400 mb-3" />
                <span className="text-xs text-stone-400 block">WhatsApp Desk</span>
                <span className="text-sm font-bold text-white font-mono">
                  {settings.whatsappNumber}
                </span>
              </a>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-serif-luxury text-xl font-bold text-white mb-1">
                {lang === 'bn' ? 'সরাসরি বার্তা পাঠান' : 'Send a Message to Reception'}
              </h3>
              <p className="text-xs text-stone-400 mb-5">
                {lang === 'bn'
                  ? 'গ্রুপ বুকিং বা বিশেষ অনুরোধের জন্য আমাদের মেসেজ করুন।'
                  : 'For corporate stays, group bookings, or airport pickup requests.'}
              </p>

              {inquirySent ? (
                <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Thank you! Your message has been noted by our reception desk.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 text-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Mobile Number (e.g. 017XXXXXXXX) *"
                    value={inquiryContact}
                    onChange={(e) => setInquiryContact(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 text-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <textarea
                    rows={3}
                    placeholder="Your message or room inquiry..."
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 text-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'বার্তা পাঠান' : 'Send Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Live House Policies + FAQs */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-3 text-xs">
              <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? 'গেস্ট হাউস নীতিমালা' : 'Guest House Policies'}</span>
              </h3>
              <div className="space-y-2 text-stone-300 leading-relaxed">
                <p>
                  <strong className="text-amber-400">Check-In:</strong> {settings.checkInPolicy}
                </p>
                <p>
                  <strong className="text-amber-400">Check-Out:</strong> {settings.checkOutPolicy}
                </p>
                <p>
                  <strong className="text-amber-400">Payment:</strong> {settings.advancePaymentPolicy}
                </p>
                <p>
                  <strong className="text-amber-400">Security & ID:</strong> {settings.securityPolicy}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-stone-950 border border-stone-800 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-stone-200 hover:text-white cursor-pointer"
                    >
                      <span>{lang === 'bn' ? faq.qBn : faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-stone-400 leading-relaxed border-t border-stone-800/60">
                        {lang === 'bn' ? faq.aBn : faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
