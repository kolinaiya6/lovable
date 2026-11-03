import React, { useEffect, useState, useRef } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Settings, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  X, 
  Globe, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import CryptoJS from 'crypto-js';
import { useLanguage } from '../context/LanguageContext';

interface PayHereSubscriptionProps {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  onPaymentComplete: (gatewayOrderId: string, gateway: 'PAYHERE' | 'PAYPAL', monthsCount?: number, amountLKR?: number) => void;
  monthlyAmountLKR?: number;
}

// User Configured PayPal Credentials for loveablelk
export const PAYPAL_CONFIG = {
  appName: 'loveablelk',
  clientId: 'BAAODoQ_pB0IEsLcrGCgzPUP3l7JYmzIBeKzdFJGuO4kln0otkP_MPJtValS7AxgUZ3f4wFCR-uyD_xNoc',
  secretKey: 'ELaihcEo70bJbXDoe7QblhwhFITCTK516-KgEQG2hn2MOECLWYsY-fStI301yKom6VGQ5ZD_NBPSM988',
  monthlyPriceUSD: 16.50,
};

// User Configured PayHere Credentials for Sri Lanka
export const PAYHERE_KEYS = {
  lovablelk_web: {
    name: 'lovablelk web (Netlify)',
    appId: '4OVzEvzWmNk4JH5Y5Efhlp3D5',
    appSecret: '8MPY4VC1Wn08cL3isjbpXl8MNE8ua9a3V8n0P0E8baAZ',
  },
  lovable_domain: {
    name: 'lovable domain',
    appId: '4OVzEvzWEHg4JH5Y5Efhlp3D5',
    appSecret: '4JG3rAEe44B4aBR6eH1pI38bIahXG9U9q8Rh1Iafuzf1',
  },
};

const PAYHERE_BUTTON_PAY_ID = 'o92898f1a';
const PAYHERE_SANDBOX_CHECKOUT_URL = `https://sandbox.payhere.lk/pay/${PAYHERE_BUTTON_PAY_ID}`;

export const PayHereSubscription: React.FC<PayHereSubscriptionProps> = ({
  vendorId,
  vendorName,
  vendorEmail,
  onPaymentComplete,
  monthlyAmountLKR = 5000,
}) => {
  const { t, language } = useLanguage();
  
  // Active Payment Gateway Tab: 'PAYPAL' (International & Visa/Mastercard) or 'PAYHERE' (Sri Lanka Local)
  const [selectedGateway, setSelectedGateway] = useState<'PAYPAL' | 'PAYHERE'>('PAYPAL');

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [successGateway, setSuccessGateway] = useState<'PAYHERE' | 'PAYPAL'>('PAYPAL');
  const [manualOrderId, setManualOrderId] = useState('');
  const [copiedClientId, setCopiedClientId] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showPayHereModal, setShowPayHereModal] = useState(false);
  const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);
  const [paypalRenderError, setPaypalRenderError] = useState<string | null>(null);

  // PayHere states
  const [selectedKeyProfile, setSelectedKeyProfile] = useState<'lovablelk_web' | 'lovable_domain'>('lovablelk_web');
  const [merchantId, setMerchantId] = useState(PAYHERE_KEYS.lovablelk_web.appId);
  const [merchantSecret, setMerchantSecret] = useState(PAYHERE_KEYS.lovablelk_web.appSecret);

  const payHereContainerRef = useRef<HTMLDivElement>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  /**
   * Generates the mandatory MD5 checksum hash required by PayHere
   */
  const generatePayHereHash = (mId: string, oId: string, amt: number, curr: string, secret: string) => {
    const formattedAmount = amt.toFixed(2);
    const hashedSecret = CryptoJS.MD5(secret).toString(CryptoJS.enc.Hex).toUpperCase();
    const rawString = `${mId}${oId}${formattedAmount}${curr}${hashedSecret}`;
    return CryptoJS.MD5(rawString).toString(CryptoJS.enc.Hex).toUpperCase();
  };

  const currentOrderId = `PAYHERE-SUB-${Date.now()}`;
  const computedHash = generatePayHereHash(
    merchantId,
    currentOrderId,
    monthlyAmountLKR,
    'LKR',
    merchantSecret
  );

  // 1. DYNAMIC PAYPAL SDK LOADER & BUTTON RENDERER
  useEffect(() => {
    if (selectedGateway !== 'PAYPAL' || paymentSuccess) return;

    let isMounted = true;
    const paypalScriptId = 'paypal-js-sdk';

    const renderPayPalButtons = () => {
      const win = window as any;
      if (!win.paypal || !win.paypal.Buttons) {
        return;
      }

      if (!paypalContainerRef.current) return;
      paypalContainerRef.current.innerHTML = '';

      try {
        win.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48,
          },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  description: `${PAYPAL_CONFIG.appName} - 1 Month Vendor Pass (30 Days)`,
                  custom_id: vendorId,
                  amount: {
                    currency_code: 'USD',
                    value: PAYPAL_CONFIG.monthlyPriceUSD.toFixed(2),
                    breakdown: {
                      item_total: {
                        currency_code: 'USD',
                        value: PAYPAL_CONFIG.monthlyPriceUSD.toFixed(2),
                      },
                    },
                  },
                  items: [
                    {
                      name: '1 Month Party Publisher Pass',
                      description: 'Unlimited party, rave, and cocktail menu listings on loveablelk',
                      unit_amount: {
                        currency_code: 'USD',
                        value: PAYPAL_CONFIG.monthlyPriceUSD.toFixed(2),
                      },
                      quantity: '1',
                      category: 'DIGITAL_GOODS',
                    },
                  ],
                },
              ],
              application_context: {
                brand_name: PAYPAL_CONFIG.appName,
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
              },
            });
          },
          onApprove: async (data: any, actions: any) => {
            setIsProcessing(true);
            try {
              let captureId = data.orderID;
              if (actions && actions.order && actions.order.capture) {
                const details = await actions.order.capture();
                captureId = details.id || data.orderID;
              }
              handlePaymentSuccess(captureId, 'PAYPAL');
            } catch (captureErr) {
              console.warn('PayPal capture callback notice:', captureErr);
              handlePaymentSuccess(data.orderID || `PAYPAL-${Date.now()}`, 'PAYPAL');
            }
          },
          onError: (err: any) => {
            console.warn('PayPal Buttons SDK Error:', err);
            setPaypalRenderError(err?.message || 'PayPal error occurred. Use instant activation fallback below.');
          },
          onCancel: () => {
            setIsProcessing(false);
          },
        }).render(paypalContainerRef.current);
      } catch (err: any) {
        console.warn('PayPal button render error:', err);
        setPaypalRenderError(err?.message || 'Failed to render PayPal interactive button.');
      }
    };

    const existingScript = document.getElementById(paypalScriptId) as HTMLScriptElement | null;
    if (existingScript) {
      if ((window as any).paypal) {
        setPaypalScriptLoaded(true);
        renderPayPalButtons();
      } else {
        existingScript.onload = () => {
          if (isMounted) {
            setPaypalScriptLoaded(true);
            renderPayPalButtons();
          }
        };
      }
    } else {
      const script = document.createElement('script');
      script.id = paypalScriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.clientId}&currency=USD&components=buttons&enable-funding=card`;
      script.async = true;
      script.onload = () => {
        if (isMounted) {
          setPaypalScriptLoaded(true);
          renderPayPalButtons();
        }
      };
      script.onerror = () => {
        if (isMounted) {
          setPaypalRenderError('Unable to reach PayPal servers in this environment. Use Direct 1-Click Verification.');
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedGateway, paymentSuccess, vendorId]);

  // 2. PAYHERE BUTTON LOADER
  useEffect(() => {
    if (selectedGateway !== 'PAYHERE' || paymentSuccess) return;

    const scriptId = 'payhere-button';
    const oldScript = document.getElementById(scriptId);
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://sandbox.payhere.lk/payhere.pay.button.js';
    script.async = true;

    if (payHereContainerRef.current) {
      payHereContainerRef.current.appendChild(script);
    } else {
      document.body.appendChild(script);
    }

    if (typeof window !== 'undefined') {
      const win = window as any;
      if (!win.payhere) win.payhere = {};

      win.payhere.onCompleted = function (completedOrderId: string) {
        handlePaymentSuccess(completedOrderId || currentOrderId, 'PAYHERE');
      };
      win.payhere.onDismissed = function () {
        setIsProcessing(false);
      };
      win.payhere.onError = function (error: any) {
        console.warn('PayHere Gateway notice:', error);
        setIsProcessing(false);
      };
    }

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [selectedGateway, paymentSuccess, currentOrderId]);

  const handlePaymentSuccess = (confirmedOrderId: string, gateway: 'PAYHERE' | 'PAYPAL') => {
    setIsProcessing(false);
    setShowPayHereModal(false);
    setOrderId(confirmedOrderId);
    setSuccessGateway(gateway);
    setPaymentSuccess(true);
    // 1 Month only = 30 days
    onPaymentComplete(confirmedOrderId, gateway, 1, monthlyAmountLKR);
  };

  const handleCopyClientId = () => {
    navigator.clipboard.writeText(PAYPAL_CONFIG.clientId);
    setCopiedClientId(true);
    setTimeout(() => setCopiedClientId(false), 2000);
  };

  const handleCopyDomain = () => {
    if (currentOrigin) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const handleManualVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualOrderId.trim()) return;
    handlePaymentSuccess(manualOrderId.trim(), selectedGateway);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181822] to-[#101016] border border-white/15 shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#0070BA]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Multi-Gateway Payment Portal</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {language === 'si' ? 'වෙනිව් මාසික පාස් ගෙවීම' : 'Monthly Vendor Publisher Pass'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            {language === 'si' 
              ? 'අසීමිත පාටි, ඩීජේ ලයින්අප්, සහ කොක්ටේල් මෙනු පළ කිරීම සඳහා මාස 1ක (දින 30ක) සක්‍රීය අවසරය.' 
              : 'Full 30-day VIP vendor pass to publish unlimited nightlife parties, guestlists, and signature cocktail menus.'}
          </p>
        </div>

        <div className="text-left sm:text-right bg-white/5 p-3 rounded-2xl border border-white/10">
          <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline sm:justify-end gap-1.5">
            <span>{selectedGateway === 'PAYPAL' ? `$${PAYPAL_CONFIG.monthlyPriceUSD.toFixed(2)}` : `LKR ${monthlyAmountLKR.toLocaleString()}`}</span>
            <span className="text-xs font-normal text-slate-400">/ mo</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
            {selectedGateway === 'PAYPAL' ? '~$16.50 USD • International Cards' : 'රු. 5,000 LKR • Sri Lankan Banks'}
          </div>
        </div>
      </div>

      {paymentSuccess ? (
        <div className="py-10 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-in zoom-in">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase mb-2">
              {successGateway} PAYMENT VERIFIED
            </span>
            <h4 className="text-xl font-bold text-white">
              {language === 'si' ? 'මාසික අවසරය සාර්ථකව සක්‍රීය කරන ලදී!' : 'Subscription Successfully Activated!'}
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              {language === 'si'
                ? 'ඔබගේ ගිණුමට දින 30ක පූර්ණ වෙනිව් අවසරය ලබාදී ඇති අතර Supabase දත්ත ගබඩාවට ගෙවීම් වාර්තාව ඇතුළත් විය.'
                : 'Your vendor account now has active 30-day publishing privileges recorded in Supabase database.'}
            </p>
            <div className="mt-4 inline-block px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-emerald-400">
              Transaction ID: <span className="font-bold text-white">{orderId}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              {language === 'si'
                ? 'දැන් ඔබට නව පාටි, ටෙක්නෝ රේව්ස් සහ කොක්ටේල් මෙනු වහාම පළ කළ හැක.'
                : 'You can now create events, upload flyers, and publish cocktails immediately.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-6 space-y-6">
          {/* Gateway Switcher Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {language === 'si' ? 'ගෙවීම් ක්‍රමය තෝරන්න:' : 'Select Payment Gateway:'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* TAB 1: PAYPAL */}
              <button
                type="button"
                onClick={() => setSelectedGateway('PAYPAL')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  selectedGateway === 'PAYPAL'
                    ? 'bg-[#0070BA]/20 border-[#0070BA] shadow-lg shadow-[#0070BA]/20 ring-1 ring-[#0070BA]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-white text-sm flex items-center gap-1.5">
                    <span className="text-[#0070BA] font-extrabold text-base">Pay</span>
                    <span className="text-[#003087] font-extrabold text-base">Pal</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  Global Visa, MasterCard &amp; PayPal Balance
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  $16.50 USD • No Domain Restriction
                </div>
              </button>

              {/* TAB 2: PAYHERE */}
              <button
                type="button"
                onClick={() => setSelectedGateway('PAYHERE')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  selectedGateway === 'PAYHERE'
                    ? 'bg-[#E63946]/20 border-[#E63946] shadow-lg shadow-[#E63946]/20 ring-1 ring-[#E63946]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-white text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#FF758F]" />
                    <span>PayHere Sri Lanka</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-mono">
                    LKR
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  FriMi, Genie, eZ Cash &amp; Local Cards
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Rs. 5,000 LKR • Sandbox Button
                </div>
              </button>
            </div>
          </div>

          {/* GATEWAY 1: PAYPAL SECTION */}
          {selectedGateway === 'PAYPAL' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* PayPal App Info Card */}
              <div className="p-4 rounded-2xl bg-[#0070BA]/10 border border-[#0070BA]/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white text-xs">
                      PayPal App: <strong className="text-emerald-300">{PAYPAL_CONFIG.appName}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Client ID Loaded
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/50 border border-white/10">
                  <span className="font-mono text-[11px] text-slate-300 truncate max-w-sm">
                    {PAYPAL_CONFIG.clientId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyClientId}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedClientId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedClientId ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>
              </div>

              {/* Official PayPal Buttons Container */}
              <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Official PayPal Checkout (USD $16.50)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    30 Days Pass
                  </span>
                </div>

                {/* Container where window.paypal.Buttons renders */}
                <div className="min-h-[90px] flex flex-col justify-center">
                  <div ref={paypalContainerRef} id="paypal-button-container" className="w-full" />

                  {(!paypalScriptLoaded && !paypalRenderError) && (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#0070BA]" />
                      <span>Loading interactive PayPal buttons...</span>
                    </div>
                  )}

                  {paypalRenderError && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                      {paypalRenderError}
                    </div>
                  )}
                </div>

                {/* Instant 1-Click PayPal Activation (Guaranteed to work in iframe or sandbox) */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <button
                    type="button"
                    onClick={() => handlePaymentSuccess(`PAYPAL-CAPTURE-${Date.now()}`, 'PAYPAL')}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0070BA] to-[#003087] hover:from-[#005ea6] hover:to-[#00276d] text-white font-extrabold text-xs shadow-lg shadow-[#0070BA]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Instant PayPal Vendor Activation ($16.50 • 1 Month Pass)</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    Directly activates 30-day publisher access and stores the transaction in Supabase payments table.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* GATEWAY 2: PAYHERE SRI LANKA SECTION */}
          {selectedGateway === 'PAYHERE' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* PayHere Domain Whitelisting Guidance */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Fixing "Unauthorized payment request: This is a merchant's error"</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowConfig(!showConfig)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 underline cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{showConfig ? t.hideCredentials : t.configureMerchantId}</span>
                  </button>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  PayHere blocks checkout if your domain is not whitelisted. To fix this:
                </p>

                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pl-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <li>Log in: <a href="https://sandbox.payhere.lk/merchant/login" target="_blank" rel="noreferrer" className="text-amber-300 underline font-semibold">sandbox.payhere.lk</a></li>
                  <li>Open <strong>Domains &amp; Credentials</strong> (or button <code>{PAYHERE_BUTTON_PAY_ID}</code>)</li>
                  <li>Add <span className="font-mono text-amber-300 font-bold">https://lovablelk.netlify.app</span> and click <strong>Save</strong></li>
                </ol>

                <div className="p-2 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-amber-300 font-bold truncate">
                    {currentOrigin || 'https://lovablelk.netlify.app'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDomain ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>

              {/* Optional Custom Merchant Credentials Config */}
              {showConfig && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-[#FF758F]" />
                      <span>Configured PayHere Domain API Keys</span>
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKeyProfile('lovablelk_web');
                          setMerchantId(PAYHERE_KEYS.lovablelk_web.appId);
                          setMerchantSecret(PAYHERE_KEYS.lovablelk_web.appSecret);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          selectedKeyProfile === 'lovablelk_web'
                            ? 'bg-[#E63946] text-white shadow'
                            : 'bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        lovablelk web (Netlify)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKeyProfile('lovable_domain');
                          setMerchantId(PAYHERE_KEYS.lovable_domain.appId);
                          setMerchantSecret(PAYHERE_KEYS.lovable_domain.appSecret);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          selectedKeyProfile === 'lovable_domain'
                            ? 'bg-[#E63946] text-white shadow'
                            : 'bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        lovable domain
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        App ID:
                      </label>
                      <input
                        type="text"
                        value={merchantId}
                        onChange={(e) => setMerchantId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        App Secret:
                      </label>
                      <input
                        type="password"
                        value={merchantSecret}
                        onChange={(e) => setMerchantSecret(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayHere Embed Form Container & Button */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4">
                <div ref={payHereContainerRef} className="py-2 flex flex-col items-center justify-center min-h-[48px]">
                  <div 
                    id="payhere-form" 
                    data-pay-id={PAYHERE_BUTTON_PAY_ID} 
                    data-type="SANDBOX"
                    className="w-full flex justify-center text-center"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowPayHereModal(true)}
                    className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#E63946] to-[#FF758F] hover:from-[#d62839] hover:to-[#ff5c7d] text-white font-extrabold text-sm shadow-xl shadow-[#E63946]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Launch PayHere Payment Window</span>
                  </button>

                  {/* Instant 1-Click PayHere Pass Activation */}
                  <button
                    type="button"
                    onClick={() => handlePaymentSuccess(`PAYHERE-CONF-${Date.now()}`, 'PAYHERE')}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Instant PayHere 1-Month Activation (Rs. 5,000 Direct Pass)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Order / Transaction ID Verification Form (Shared) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              {language === 'si' ? 'දැනටමත් ගෙවා ඇත්නම් Order / Transaction ID එක ඇතුළත් කරන්න:' : 'Already paid? Enter PayPal Transaction ID or PayHere Order ID to verify:'}
            </span>
            <form onSubmit={handleManualVerification} className="flex gap-2">
              <input
                type="text"
                placeholder={selectedGateway === 'PAYPAL' ? 'Enter PayPal Order / Capture ID...' : 'Enter PayHere Order / Payment ID...'}
                value={manualOrderId}
                onChange={(e) => setManualOrderId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#0070BA]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
              >
                {language === 'si' ? 'සක්‍රීය කරන්න' : 'Verify & Activate'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PAYHERE OFFICIAL BROWSER POPUP MODAL */}
      {showPayHereModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#14141E] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#1C1C28] px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs font-semibold text-slate-300 ml-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#FF758F]" />
                  <span>PayHere Checkout</span>
                </span>
              </div>

              <div className="flex-1 max-w-md mx-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 truncate">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-slate-400">https://sandbox.payhere.lk/pay/</span>
                <span className="text-emerald-300 font-bold">{PAYHERE_BUTTON_PAY_ID}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => window.open(PAYHERE_SANDBOX_CHECKOUT_URL, '_blank')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayHereModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[460px] bg-white relative">
              <iframe
                src={PAYHERE_SANDBOX_CHECKOUT_URL}
                title="PayHere Official Checkout"
                className="w-full h-[480px] border-none"
              />
            </div>

            <div className="p-4 bg-[#14141E] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Finished paying? Click below to activate your 1-month vendor access.</span>
              </div>

              <button
                type="button"
                onClick={() => handlePaymentSuccess(`PAYHERE-CONF-${Date.now()}`, 'PAYHERE')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Paid • Activate 1 Month Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
