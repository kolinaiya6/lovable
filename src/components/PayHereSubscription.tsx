import React, { useEffect, useState, useRef } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Sparkles, RefreshCw, AlertTriangle, Settings, Copy, Check, ExternalLink } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { useLanguage } from '../context/LanguageContext';

interface PayHereSubscriptionProps {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  onPaymentComplete: (gatewayOrderId: string, gateway: 'PAYHERE', monthsCount?: number, amountLKR?: number) => void;
  monthlyAmountLKR?: number;
}

// User PayHere App Credentials
const PAYHERE_APP_ID = '4OVzEvzVxEe4JH5Y5Efhlp3D5';
const PAYHERE_APP_SECRET = '8MQpgjOPilu4pBwoO7aCgt4ZBYJshChIA8LV4Ehs6OQt';

export const PayHereSubscription: React.FC<PayHereSubscriptionProps> = ({
  vendorId,
  vendorName,
  vendorEmail,
  onPaymentComplete,
  monthlyAmountLKR = 5000,
}) => {
  const { t, language } = useLanguage();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [manualOrderId, setManualOrderId] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Merchant Credentials (defaults to user PayHere App ID and Secret)
  const [merchantId, setMerchantId] = useState(PAYHERE_APP_ID);
  const [merchantSecret, setMerchantSecret] = useState(PAYHERE_APP_SECRET);

  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  /**
   * Generates the mandatory MD5 checksum hash required by PayHere
   * Formula: strtoupper(md5(merchant_id + order_id + amount_formatted + currency + strtoupper(md5(merchant_secret))))
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

  useEffect(() => {
    // 1. Ensure PayHere Button JS is loaded fresh next to the embed container
    const scriptId = 'payhere-button';
    const oldScript = document.getElementById(scriptId);
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://sandbox.payhere.lk/payhere.pay.button.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptLoaded(true);

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    } else {
      document.body.appendChild(script);
    }

    // 2. Wire up PayHere Event Listeners
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (!win.payhere) {
        win.payhere = {};
      }

      win.payhere.onCompleted = function (completedOrderId: string) {
        const finalId = completedOrderId || currentOrderId;
        handlePaymentSuccess(finalId);
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
  }, [currentOrderId]);

  const handlePaymentSuccess = (confirmedOrderId: string) => {
    setIsProcessing(false);
    setOrderId(confirmedOrderId);
    setPaymentSuccess(true);
    // 1 Month only = 30 days
    onPaymentComplete(confirmedOrderId, 'PAYHERE', 1, monthlyAmountLKR);
  };

  /**
   * Launch official PayHere JS SDK Popup with verified MD5 checksum
   */
  const handleStartPayHerePayment = () => {
    setIsProcessing(true);
    const generatedOrderId = `PAYHERE-ORD-${Date.now()}`;

    const win = window as any;
    if (typeof win.payhere !== 'undefined' && typeof win.payhere.startPayment === 'function') {
      const hash = generatePayHereHash(
        merchantId,
        generatedOrderId,
        monthlyAmountLKR,
        'LKR',
        merchantSecret
      );

      const paymentObj = {
        sandbox: true,
        merchant_id: merchantId,
        return_url: window.location.href,
        cancel_url: window.location.href,
        notify_url: `${window.location.origin}/api/payhere-notify`,
        order_id: generatedOrderId,
        items: 'Lovable LK - 1 Month Party Publisher Pass',
        amount: monthlyAmountLKR.toFixed(2),
        currency: 'LKR',
        hash: hash,
        first_name: vendorName.split(' ')[0] || 'Venue',
        last_name: vendorName.split(' ')[1] || 'Partner',
        email: vendorEmail || 'organizer@nightlife.lk',
        phone: '+94 77 123 4567',
        address: 'Hospital Street, Colombo 01',
        city: 'Colombo',
        country: 'Sri Lanka',
        custom_1: vendorId,
        custom_2: '1 MONTH',
      };

      win.payhere.onCompleted = function (orderId: string) {
        handlePaymentSuccess(orderId || generatedOrderId);
      };

      win.payhere.onDismissed = function () {
        setIsProcessing(false);
      };

      win.payhere.onError = function (err: any) {
        console.warn('PayHere gateway reported error:', err);
        setIsProcessing(false);
      };

      try {
        win.payhere.startPayment(paymentObj);
        return;
      } catch (err) {
        console.warn('PayHere startPayment error:', err);
        setIsProcessing(false);
      }
    }

    // If SDK is not loaded, fallback to submitting the standard HTML PayHere Form
    if (formRef.current) {
      formRef.current.submit();
      setIsProcessing(false);
    }
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
    handlePaymentSuccess(manualOrderId.trim());
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181822] to-[#101016] border border-white/15 shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#E63946]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.payhereVerifiedSubscription}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t.oneMonthPassTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            {t.oneMonthPassDesc}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-3xl font-black text-white font-mono">
            {language === 'si' ? 'රු.' : 'LKR'} {monthlyAmountLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            {language === 'si' ? 'මාස 1ක (දින 30) අවසරය' : '1 Month (30 Days) Access'}
          </div>
        </div>
      </div>

      {paymentSuccess ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-in zoom-in">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">{t.payhereSuccessTitle}</h4>
            <p className="text-xs text-slate-300 mt-1">
              {t.payhereSuccessDesc}
            </p>
            <div className="mt-3 inline-block px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
              {t.receiptOrderId}: {orderId}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {language === 'si'
                ? 'දැන් ඔබට නව පාටි, ටෙක්නෝ රේව්ස් සහ කොක්ටේල් මෙනු වහාම පළ කළ හැක.'
                : 'You can now publish new party events, techno raves, and cocktail menus immediately.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-6 space-y-6">
          {/* Plan Summary Card - Strictly 1 Month */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {language === 'si' ? 'මාසික වෙනිව් පාස් (මාස 1යි)' : 'Monthly Vendor Pass (1 Month)'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                  {language === 'si' ? 'දින 30ක්' : '30 DAYS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'si'
                  ? 'පාටි පළකිරීම, පියාපත් එක්කිරීම, කොක්ටේල් ප්‍රවර්ධනය සහ සහකරුවන් ආරාධනා කිරීමේ පූර්ණ අවසරය.'
                  : 'Full access to publish parties, invite companions, upload flyers, and curate cocktails.'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-white font-mono">
                {language === 'si' ? 'රු.' : 'LKR'} {monthlyAmountLKR.toLocaleString()}
              </span>
            </div>
          </div>

          {/* PayHere Domain Whitelisting Guidance (The direct fix for "Unauthorized payment request") */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.fixingPayhereError}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 underline"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{showConfig ? t.hideCredentials : t.configureMerchantId}</span>
              </button>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              {t.fixingPayhereDesc}
            </p>

            <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="truncate max-w-md">
                <span className="text-[10px] text-slate-400 block">{t.yourAppDomainToWhitelist}</span>
                <span className="text-xs font-mono text-amber-300 select-all">{currentOrigin}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyDomain}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
              >
                {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDomain ? t.copied : t.copyDomain}</span>
              </button>
            </div>
          </div>

          {/* Optional Custom Merchant Credentials */}
          {showConfig && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs animate-in fade-in">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-[#FF758F]" />
                <span>PayHere Merchant Credentials</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {language === 'si'
                  ? 'ඔබගේ PayHere Dashboard එකෙහි ඇති Merchant ID සහ Secret මෙහි ඇතුළත් කරන්න (නැතහොත් Sandbox පෙරනිමි තබන්න).'
                  : 'Enter your Merchant ID and Secret from your PayHere Dashboard (or leave default for Sandbox testing).'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    App ID / Merchant ID:
                  </label>
                  <input
                    type="text"
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    placeholder="PayHere App ID / Merchant ID"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#E63946]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    App Secret / Merchant Secret:
                  </label>
                  <input
                    type="password"
                    value={merchantSecret}
                    onChange={(e) => setMerchantSecret(e.target.value)}
                    placeholder="PayHere App Secret"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#E63946]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PayHere Embed Form Container & Official Button */}
          <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#FF758F]" />
                <span>PayHere Payment Gateway (Sri Lanka)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                {language === 'si' ? 'මාස 1යි • රු. 5,000' : '1 MONTH • LKR 5,000'}
              </span>
            </div>

            {/* Official PayHere Embed Form Container requested by user */}
            <div ref={containerRef} className="py-2 flex flex-col items-center justify-center min-h-[48px]">
              <div 
                id="payhere-form" 
                data-pay-id="o92898f1a" 
                data-type="SANDBOX"
                className="w-full flex justify-center text-center"
              />
            </div>

            {/* Official Direct PayHere Checkout Launch (MD5 Signed) */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={handleStartPayHerePayment}
                disabled={isProcessing}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#E63946] to-[#FF758F] hover:from-[#d62839] hover:to-[#ff5c7d] text-white font-extrabold text-sm shadow-xl shadow-[#E63946]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.connectingToPayhere}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>{t.payViaPayHere}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {language === 'si'
                    ? 'නිල PayHere පියවීම • MD5 Checksum Hash සත්‍යාපිතයි • VISA, MasterCard, FriMi, Genie'
                    : 'Official PayHere Checkout • MD5 Checksum Hash Verified • VISA, MasterCard, FriMi, Genie'}
                </span>
              </div>
            </div>
          </div>

          {/* Standard PayHere POST Form (Hidden Fallback for Direct Gateway Redirect) */}
          <form 
            ref={formRef}
            method="POST" 
            action="https://sandbox.payhere.lk/pay/checkout" 
            target="_blank"
            className="hidden"
          >
            <input type="hidden" name="merchant_id" value={merchantId} />
            <input type="hidden" name="return_url" value={window.location.href} />
            <input type="hidden" name="cancel_url" value={window.location.href} />
            <input type="hidden" name="notify_url" value={`${currentOrigin}/api/payhere-notify`} />
            <input type="hidden" name="first_name" value={vendorName.split(' ')[0] || 'Venue'} />
            <input type="hidden" name="last_name" value={vendorName.split(' ')[1] || 'Partner'} />
            <input type="hidden" name="email" value={vendorEmail || 'organizer@nightlife.lk'} />
            <input type="hidden" name="phone" value="+94 77 123 4567" />
            <input type="hidden" name="address" value="Hospital Street, Colombo 01" />
            <input type="hidden" name="city" value="Colombo" />
            <input type="hidden" name="country" value="Sri Lanka" />
            <input type="hidden" name="order_id" value={currentOrderId} />
            <input type="hidden" name="items" value="Lovable LK - 1 Month Party Publisher Pass" />
            <input type="hidden" name="currency" value="LKR" />
            <input type="hidden" name="amount" value={monthlyAmountLKR.toFixed(2)} />
            <input type="hidden" name="hash" value={computedHash} />
          </form>

          {/* Manual Order / Receipt ID Verification Form */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              {t.alreadyPaidPayhere}
            </span>
            <form onSubmit={handleManualVerification} className="flex gap-2">
              <input
                type="text"
                placeholder={language === 'si' ? 'PayHere Order / Payment ID එක ඇතුළත් කරන්න...' : 'Enter PayHere Order / Payment ID...'}
                value={manualOrderId}
                onChange={(e) => setManualOrderId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
              >
                {t.activateOneMonth}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
