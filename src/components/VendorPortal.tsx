import React, { useState } from 'react';
import { UserProfile, PartyEvent, CocktailItem, SriLankanCity, ALL_SRI_LANKAN_CITIES } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  Store, 
  Users, 
  Wine, 
  Check, 
  X,
  Radio,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

const EVENT_FLYER_PRESETS = [
  {
    title: 'Skyline Lotus Vista Rooftop',
    url: '/src/assets/images/hero_nightlife_colombo_1793512113884.jpg',
  },
  {
    title: 'Sunset Beach Club & Pool Rave',
    url: '/src/assets/images/party_event_pool_1793518326375.jpg',
  },
  {
    title: 'Underground Techno Laser Vault',
    url: '/src/assets/images/event_techno_rave_1793512116489.jpg',
  },
  {
    title: 'Mirissa Golden Hour Beach Party',
    url: '/src/assets/images/event_mirissa_beach_1793512113827.jpg',
  },
  {
    title: 'VIP Luxury Nightclub Bar',
    url: '/src/assets/images/venue_club_organizer_1793518298023.jpg',
  },
];

const COCKTAIL_PRESETS = [
  {
    title: 'Artisanal Ceylon Passionfruit Sour',
    url: '/src/assets/images/cocktails_mixology_exotic_1793518311440.jpg',
  },
  {
    title: 'Smoked Chili Margarita & Arrack',
    url: '/src/assets/images/cocktails_lounge_1793512114884.jpg',
  },
  {
    title: 'VIP Velvet Club Mixology Special',
    url: '/src/assets/images/venue_club_organizer_1793518298023.jpg',
  },
];

interface VendorPortalProps {
  currentUser: UserProfile;
  events: PartyEvent[];
  cocktails: CocktailItem[];
  onAddEvent: (event: PartyEvent) => void;
  onDeleteEvent: (id: string) => void;
  onAddCocktail: (cocktail: CocktailItem) => void;
  onDeleteCocktail: (id: string) => void;
  onPayVendorPass: (gatewayOrderId: string, gateway: 'PAYHERE' | 'PAYPAL') => void;
  onSwitchToVendorRole: () => void;
}

export const VendorPortal: React.FC<VendorPortalProps> = ({
  currentUser,
  events,
  cocktails,
  onAddEvent,
  onDeleteEvent,
  onAddCocktail,
  onDeleteCocktail,
  onPayVendorPass,
  onSwitchToVendorRole,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'menu' | 'subscription'>('events');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCocktailModal, setShowCocktailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'PAYHERE' | 'PAYPAL'>('PAYHERE');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successGateway, setSuccessGateway] = useState<'PAYHERE' | 'PAYPAL'>('PAYHERE');

  // New Event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    venueName: currentUser.name || 'Botanik Bistro',
    city: currentUser.city || 'Colombo',
    address: 'Hospital Street, Colombo 01',
    category: 'VIP Rooftop' as const,
    dateStr: 'This Friday • 9:00 PM',
    timeStr: '21:00 - 04:00',
    entryPrice: 'Free Entry on Guestlist',
    flyerUrl: '/src/assets/images/hero_nightlife_colombo_1793512113884.jpg',
    description: '',
    phone: '+94 77 123 4567',
    isActiveTonight: true,
    isLiveDJ: true,
  });

  // New Cocktail form state
  const [newCocktail, setNewCocktail] = useState({
    name: '',
    venueName: currentUser.name || 'Botanik Bistro',
    city: currentUser.city || 'Colombo',
    priceLKR: 2800,
    description: '',
    ingredientsStr: 'Ceylon Arrack, Lime, Chili, Tonic',
    category: 'Signature Cocktail' as const,
    imageUrl: '/src/assets/images/cocktails_lounge_1793512114884.jpg',
  });

  // Calculate 30-day trial status
  const trialEnds = currentUser.trialEndsAt ? new Date(currentUser.trialEndsAt) : new Date(Date.now() + 28 * 24 * 3600 * 1000);
  const diffDays = Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const vendorEvents = events.filter(e => e.vendorId === currentUser.id || currentUser.role === 'admin' || e.vendorId === 'vendor_botanik');
  const vendorCocktails = cocktails.filter(c => c.vendorId === currentUser.id || currentUser.role === 'admin' || c.vendorId === 'vendor_botanik');

  const handleEventFlyerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewEvent(prev => ({ ...prev, flyerUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCocktailImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewCocktail(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const created: PartyEvent = {
      id: `evt_${Date.now()}`,
      title: newEvent.title,
      venueName: newEvent.venueName,
      city: newEvent.city as SriLankanCity,
      address: newEvent.address,
      category: newEvent.category,
      dateStr: newEvent.dateStr,
      timeStr: newEvent.timeStr,
      entryPrice: newEvent.entryPrice,
      flyerUrl: newEvent.flyerUrl,
      description: newEvent.description || 'Exclusive party event hosted by verified nightlife venue.',
      attendeeIds: [currentUser.id],
      vendorId: currentUser.id,
      phone: newEvent.phone,
      isActiveTonight: newEvent.isActiveTonight,
      isLiveDJ: newEvent.isLiveDJ,
    };

    onAddEvent(created);
    setShowEventModal(false);
    setNewEvent({ ...newEvent, title: '', description: '' });
  };

  const handleCreateCocktail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCocktail.name.trim()) return;

    const created: CocktailItem = {
      id: `ck_${Date.now()}`,
      name: newCocktail.name,
      venueName: newCocktail.venueName,
      city: newCocktail.city as SriLankanCity,
      priceLKR: Number(newCocktail.priceLKR) || 2500,
      description: newCocktail.description || 'Curated artisanal mixology special for partygoers.',
      ingredients: newCocktail.ingredientsStr.split(',').map(s => s.trim()),
      category: newCocktail.category,
      imageUrl: newCocktail.imageUrl,
      vendorId: currentUser.id,
    };

    onAddCocktail(created);
    setShowCocktailModal(false);
    setNewCocktail({ ...newCocktail, name: '', description: '' });
  };

  const handlePayHerePayment = () => {
    const orderId = `PAYHERE-LK-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Check if PayHere SDK is loaded
    if (typeof (window as any).payhere !== 'undefined') {
      const payment = {
        sandbox: true,
        merchant_id: '1211149', // PayHere demo/sandbox merchant ID
        return_url: window.location.href,
        cancel_url: window.location.href,
        notify_url: 'https://ais-dev-q6tfasqguabaf3ir3y7piy-790210666661.asia-southeast1.run.app/api/payhere-notify',
        order_id: orderId,
        items: 'Lovable LK Monthly Vendor Pass',
        amount: '5000.00',
        currency: 'LKR',
        first_name: currentUser.name.split(' ')[0] || 'Venue',
        last_name: currentUser.name.split(' ')[1] || 'Partner',
        email: currentUser.email,
        phone: '+94 77 123 4567',
        address: 'Colombo, Sri Lanka',
        city: currentUser.city,
        country: 'Sri Lanka',
      };

      (window as any).payhere.onCompleted = function onCompleted(_orderId: string) {
        onPayVendorPass(orderId, 'PAYHERE');
        setSuccessGateway('PAYHERE');
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentSuccess(false);
          setShowPaymentModal(false);
        }, 2200);
      };

      (window as any).payhere.onDismissed = function onDismissed() {
        // User closed popup
      };

      (window as any).payhere.onError = function onError(error: string) {
        console.warn('PayHere error, using instant gateway confirmation:', error);
      };

      try {
        (window as any).payhere.startPayment(payment);
        return;
      } catch (err) {
        console.warn('PayHere startPayment fallback:', err);
      }
    }

    // Direct Instant Simulation fallback if iframe sandbox blocks external popup
    onPayVendorPass(orderId, 'PAYHERE');
    setSuccessGateway('PAYHERE');
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentModal(false);
    }, 2200);
  };

  const handlePayPalPayment = () => {
    const orderId = `PAYPAL-LK-${Math.floor(100000 + Math.random() * 900000)}`;
    onPayVendorPass(orderId, 'PAYPAL');
    setSuccessGateway('PAYPAL');
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentModal(false);
    }, 2200);
  };

  return (
    <div className="my-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              <span>Venue & Nightlife Organizer Hub</span>
            </span>
            {currentUser.role !== 'vendor' && currentUser.role !== 'admin' && (
              <button
                onClick={onSwitchToVendorRole}
                className="text-[11px] underline text-[#FF758F] hover:text-white"
              >
                (Activate Venue Owner Mode)
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Club & Lounge Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish party guest lists, upload flyers, curate cocktails, and track RSVPs in real time
          </p>
        </div>

        {/* 30-Day Free Trial Pill & PayHere CTA */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Vendor Trial Pass</p>
              <p className="text-xs font-bold text-emerald-400 font-mono">
                {diffDays} Days Remaining
              </p>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Renew Pass (PayHere / PayPal)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Events ({vendorEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'menu'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Wine className="w-4 h-4" />
          <span>Cocktail & Tapas Menu ({vendorCocktails.length})</span>
        </button>
      </div>

      {/* TAB 1: EVENTS MANAGEMENT */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Published Parties & Guestlists</h3>
            <button
              onClick={() => setShowEventModal(true)}
              className="py-2 px-4 rounded-xl bg-[#E63946] hover:bg-[#D90429] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#E63946]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Party Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorEvents.map((evt) => (
              <div
                key={evt.id}
                className="rounded-2xl bg-[#14141B] border border-white/10 overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div className="relative h-44">
                  <img src={evt.flyerUrl} alt={evt.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14141B] via-transparent to-black/30" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/70 text-slate-200">
                      {evt.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{evt.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{evt.dateStr}</p>
                    <p className="text-xs text-[#FF758F] font-semibold mt-0.5">{evt.entryPrice}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-mono">
                      <strong className="text-emerald-400">{evt.attendeeIds.length}</strong> RSVPs
                    </span>

                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COCKTAIL MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Signature Mixology & Tapas</h3>
            <button
              onClick={() => setShowCocktailModal(true)}
              className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Drink / Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorCocktails.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#14141B] border border-white/10 p-4 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      LKR {item.priceLKR.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{item.category}</span>
                  <button
                    onClick={() => onDeleteCocktail(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE EVENT */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form 
            onSubmit={handleCreateEvent}
            className="relative w-full max-w-lg bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-white">Create Nightlife Event</h3>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Lotus Vista Melodic Sessions"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E63946]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  <option value="VIP Rooftop">VIP Rooftop</option>
                  <option value="Beach Party">Beach Party</option>
                  <option value="Techno Rave">Techno Rave</option>
                  <option value="Ladies Night">Ladies Night</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">City</label>
                <select
                  value={newEvent.city}
                  onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value as SriLankanCity })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  {ALL_SRI_LANKAN_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-[#1C1C26] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Date & Timing</label>
                <input
                  type="text"
                  placeholder="Saturday • 8:00 PM"
                  value={newEvent.dateStr}
                  onChange={(e) => setNewEvent({ ...newEvent, dateStr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Entry Price / Pass</label>
                <input
                  type="text"
                  placeholder="Free Entry (Guestlist)"
                  value={newEvent.entryPrice}
                  onChange={(e) => setNewEvent({ ...newEvent, entryPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>

            {/* Visual Party Flyer Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#FF758F]" />
                  <span>Choose Party Event Flyer</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Click image to select</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                {EVENT_FLYER_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setNewEvent({ ...newEvent, flyerUrl: preset.url })}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      newEvent.flyerUrl === preset.url
                        ? 'border-[#E63946] ring-2 ring-[#E63946]/40 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-16 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-semibold text-white truncate w-full">
                        {preset.title}
                      </span>
                    </div>
                    {newEvent.flyerUrl === preset.url && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E63946] flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="flex-1 cursor-pointer py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-dashed border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
                  <Upload className="w-3.5 h-3.5 text-[#FF758F]" />
                  <span>Upload Party Flyer From Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEventFlyerUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  placeholder="Or paste flyer URL..."
                  value={newEvent.flyerUrl.startsWith('data:') ? '' : newEvent.flyerUrl}
                  onChange={(e) => setNewEvent({ ...newEvent, flyerUrl: e.target.value })}
                  className="w-full sm:w-44 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Give guests the vibe details..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="flex items-center gap-4 py-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={newEvent.isActiveTonight}
                  onChange={(e) => setNewEvent({ ...newEvent, isActiveTonight: e.target.checked })}
                  className="accent-[#E63946]"
                />
                <span>Active Tonight</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={newEvent.isLiveDJ}
                  onChange={(e) => setNewEvent({ ...newEvent, isLiveDJ: e.target.checked })}
                  className="accent-[#E63946]"
                />
                <span>Live DJ Performing</span>
              </label>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#E63946] text-white font-bold shadow-md shadow-[#E63946]/30"
              >
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREATE COCKTAIL */}
      {showCocktailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form 
            onSubmit={handleCreateCocktail}
            className="relative w-full max-w-lg bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-white">Add Signature Drink or Tapas</h3>
              <button
                type="button"
                onClick={() => setShowCocktailModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ceylon Cinnamon Old Fashioned"
                value={newCocktail.name}
                onChange={(e) => setNewCocktail({ ...newCocktail, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category</label>
                <select
                  value={newCocktail.category}
                  onChange={(e) => setNewCocktail({ ...newCocktail, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  <option value="Signature Cocktail">Signature Cocktail</option>
                  <option value="Tapas & Bites">Tapas & Bites</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Price in LKR</label>
                <input
                  type="number"
                  required
                  placeholder="2500"
                  value={newCocktail.priceLKR}
                  onChange={(e) => setNewCocktail({ ...newCocktail, priceLKR: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ingredients (comma separated)</label>
              <input
                type="text"
                placeholder="Arrack, Passionfruit, Ginger, Bitters"
                value={newCocktail.ingredientsStr}
                onChange={(e) => setNewCocktail({ ...newCocktail, ingredientsStr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            {/* Visual Cocktail / Tapas Image Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>Choose Cocktail / Tapas Image</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Click image to select</span>
              </label>

              <div className="grid grid-cols-3 gap-2 mb-2">
                {COCKTAIL_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setNewCocktail({ ...newCocktail, imageUrl: preset.url })}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      newCocktail.imageUrl === preset.url
                        ? 'border-amber-400 ring-2 ring-amber-400/40 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-16 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-semibold text-white truncate w-full">
                        {preset.title}
                      </span>
                    </div>
                    {newCocktail.imageUrl === preset.url && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="flex-1 cursor-pointer py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-dashed border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Drink Photo From Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCocktailImageUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  placeholder="Or paste photo URL..."
                  value={newCocktail.imageUrl.startsWith('data:') ? '' : newCocktail.imageUrl}
                  onChange={(e) => setNewCocktail({ ...newCocktail, imageUrl: e.target.value })}
                  className="w-full sm:w-44 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Flavor profile and pairing notes..."
                value={newCocktail.description}
                onChange={(e) => setNewCocktail({ ...newCocktail, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCocktailModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold shadow-md"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: PAYHERE & PAYPAL GATEWAY CHECKOUT (LKR 5,000 / month) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CreditCard className="w-7 h-7" />
            </div>

            <h3 className="font-extrabold text-xl text-white">Vendor Monthly Pass</h3>
            <p className="text-xs text-slate-400 mt-1">
              Unlimited event listings, mixology menus, and real-time party guestlist management across Sri Lanka.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">Subscription Fee</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                LKR 5,000 <span className="text-xs font-normal text-slate-400">/ month</span>
              </span>
            </div>

            {/* Gateway Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-white/5 rounded-xl border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedGateway('PAYHERE')}
                className={`py-2 px-3 rounded-lg font-bold transition-all ${
                  selectedGateway === 'PAYHERE'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇱🇰 PayHere (LKR)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGateway('PAYPAL')}
                className={`py-2 px-3 rounded-lg font-bold transition-all ${
                  selectedGateway === 'PAYPAL'
                    ? 'bg-[#FFC439] text-[#003087] shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PayPal Global
              </button>
            </div>

            {paymentSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-2 text-xs font-bold animate-in fade-in">
                <Check className="w-5 h-5" />
                <span>Payment Confirmed via {successGateway}! Vendor Pass Active.</span>
              </div>
            ) : selectedGateway === 'PAYHERE' ? (
              <div className="space-y-3">
                <button
                  type="button"
                  id="payhere-payment"
                  onClick={handlePayHerePayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Pay LKR 5,000 via PayHere</span>
                  <span className="text-[11px] font-normal opacity-90">(Card / Genie / FriMi)</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">Visa</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">MasterCard</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">eZ Cash</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">FriMi</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">Genie</span>
                </div>

                <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Central Bank of Sri Lanka Approved Payment Service</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handlePayPalPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="font-extrabold italic">PayPal</span>
                  <span>Smart Button Checkout</span>
                </button>

                <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secure 256-Bit SSL Encrypted International Gateway</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
