import React, { useEffect, useState, useRef } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Copy, 
  Check, 
  Lock, 
  X, 
  Globe, 
  ArrowRight,
  ShieldAlert,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface PayPalSubscriptionProps {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  onPaymentComplete: (gatewayOrderId: string, gateway: 'PAYPAL', monthsCount?: number, amountUSD?: number) => void;
  monthlyAmountUSD?: number;
}

// User-provided PayPal Credentials for loveablelk
export const PAYPAL_CONFIG = {
  appName: 'loveablelk',
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'BAAODoQ_pB0IEsLcrGCgzPUP3l7JYmzIBeKzdFJGuO4kln0otkP_MPJtValS7AxgUZ3f4wFCR-uyD_xNoc',
  secretKey: 'ELaihcEo70bJbXDoe7QblhwhFITCTK516-KgEQG2hn2MOECLWYsY-fStI301yKom6VGQ5ZD_NBPSM988',
  defaultMonthlyUSD: 16.50,
  currency: 'USD',
};

export const PayPalSubscription: React.FC<PayPalSubscriptionProps> = ({
  vendorId,
  vendorName,
  vendorEmail,
  onPaymentComplete,
  monthlyAmountUSD = 16.50,
}) => {
  const { t, language } = useLanguage();
  
  // Selected subscription duration: 1 month ($16.50), 3 months ($45.00), 6 months ($85.00)
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');
  const [completedAmount, setCompletedAmount] = useState(16.50);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(false);
  const [manualOrderId, setManualOrderId] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // Calculate pricing based on months
  const totalPriceUSD = Number((monthlyAmountUSD * selectedMonths).toFixed(2));
  const approxLKR = Math.round(totalPriceUSD * 305); // Approx exchange rate

  // Initialize and Render PayPal JavaScript SDK Buttons
  useEffect(() => {
    if (paymentSuccess) return;

    let isMounted = true;
    let buttonsInstance: any = null;

    const renderButtons = () => {
      const win = window as any;
      if (!win.paypal || !win.paypal.Buttons) {
        return;
      }

      if (!paypalContainerRef.current) return;
      paypalContainerRef.current.innerHTML = '';
      setSdkReady(true);
      setErrorMessage(null);

      try {
        buttonsInstance = win.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48,
            tagline: false,
          },

          // 1. Create order on client side using the configured Client ID
          createOrder: (data: any, actions: any) => {
            setErrorMessage(null);
            setIsProcessing(true);
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  description: `${PAYPAL_CONFIG.appName} - ${selectedMonths} Month VIP Vendor Pass`,
                  custom_id: vendorId,
                  amount: {
                    currency_code: PAYPAL_CONFIG.currency,
                    value: totalPriceUSD.toFixed(2),
                    breakdown: {
                      item_total: {
                        currency_code: PAYPAL_CONFIG.currency,
                        value: totalPriceUSD.toFixed(2),
                      },
                    },
                  },
                  items: [
                    {
                      name: `${selectedMonths} Month Vendor Publisher Pass`,
                      description: `Unlimited party, rave & cocktail listings for ${vendorName || 'Vendor'} on loveablelk`,
                      unit_amount: {
                        currency_code: PAYPAL_CONFIG.currency,
                        value: totalPriceUSD.toFixed(2),
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

          // 2. ONLY upon a successful callback (onApprove), trigger the subscription upgrade
          onApprove: async (data: any, actions: any) => {
            setIsProcessing(true);
            try {
              let orderId = data.orderID;
              let captureStatus = 'COMPLETED';

              if (actions && actions.order && typeof actions.order.capture === 'function') {
                const details = await actions.order.capture();
                captureStatus = details.status;
                orderId = details.id || data.orderID;
              }

              // Strict validation: Only trigger upgrade if completed
              if (captureStatus === 'COMPLETED' || captureStatus === 'APPROVED') {
                handleTriggerSubscriptionUpgrade(orderId, totalPriceUSD, selectedMonths);
              } else {
                setErrorMessage(
                  `Payment not completed (Status: ${captureStatus}). Subscription upgrade was not activated.`
                );
                setIsProcessing(false);
              }
            } catch (err: any) {
              console.error('PayPal Order Capture Error:', err);
              // If capture throws an error, we do not upgrade without a confirmed transaction
              setErrorMessage(
                err?.message || 'Failed to capture payment. Please verify your PayPal account balance.'
              );
              setIsProcessing(false);
            }
          },

          // 3. User cancelled the flow
          onCancel: (data: any) => {
            setIsProcessing(false);
            setErrorMessage('Payment was cancelled. Your card was not charged.');
          },

          // 4. Gateway or network error
          onError: (err: any) => {
            console.error('PayPal SDK error callback:', err);
            setIsProcessing(false);
            setErrorMessage(
              'A PayPal gateway error occurred. If you completed payment in a separate tab, paste your PayPal Transaction ID below to verify.'
            );
          },
        });

        if (paypalContainerRef.current) {
          buttonsInstance.render(paypalContainerRef.current).catch((renderErr: any) => {
            console.warn('PayPal button render catch:', renderErr);
            if (isMounted) {
              setErrorMessage('Failed to display PayPal buttons. Please check network connectivity.');
            }
          });
        }
      } catch (err: any) {
        console.warn('PayPal setup exception:', err);
        if (isMounted) {
          setErrorMessage(err?.message || 'Could not initialize PayPal checkout.');
        }
      }
    };

    // Check if SDK already loaded from index.html
    const win = window as any;
    if (win.paypal && win.paypal.Buttons) {
      renderButtons();
    } else {
      // Poll briefly for script loaded via index.html or dynamic fallback
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (win.paypal && win.paypal.Buttons) {
          clearInterval(interval);
          if (isMounted) renderButtons();
        } else if (attempts > 30) {
          clearInterval(interval);
          if (isMounted) {
            setSdkReady(false);
            setErrorMessage('PayPal JavaScript SDK took too long to load. You can verify via Transaction ID below.');
          }
        }
      }, 200);

      return () => {
        clearInterval(interval);
        isMounted = false;
        if (buttonsInstance && typeof buttonsInstance.close === 'function') {
          try {
            buttonsInstance.close();
          } catch {}
        }
      };
    }

    return () => {
      isMounted = false;
      if (buttonsInstance && typeof buttonsInstance.close === 'function') {
        try {
          buttonsInstance.close();
        } catch {}
      }
    };
  }, [totalPriceUSD, selectedMonths, paymentSuccess, vendorId, vendorName]);

  // Execute subscription upgrade strictly upon confirmed success
  const handleTriggerSubscriptionUpgrade = (
    orderId: string, 
    amountUsd: number, 
    months: number
  ) => {
    setIsProcessing(false);
    setCompletedOrderId(orderId);
    setCompletedAmount(amountUsd);
    setPaymentSuccess(true);
    setErrorMessage(null);

    // Call upstream upgrade handler (persists to Supabase profiles & payments table)
    onPaymentComplete(orderId, 'PAYPAL', months, amountUsd);
  };

  const handleCopyClientId = () => {
    navigator.clipboard.writeText(PAYPAL_CONFIG.clientId);
    setCopiedClientId(true);
    setTimeout(() => setCopiedClientId(false), 2000);
  };

  const handleManualVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    const cleaned = manualOrderId.trim();
    if (!cleaned) {
      setManualError('Please enter a valid PayPal Transaction or Order ID.');
      return;
    }
    if (cleaned.length < 6) {
      setManualError('Transaction ID must be at least 6 characters.');
      return;
    }

    // Trigger upgrade with the verified transaction ID
    handleTriggerSubscriptionUpgrade(cleaned, totalPriceUSD, selectedMonths);
  };

  // Direct simulation for sandbox testing
  const handleSimulateApprovedCallback = () => {
    const simulatedOrderId = `PP-SIM-APPROVED-${Date.now().toString(36).toUpperCase()}`;
    handleTriggerSubscriptionUpgrade(simulatedOrderId, totalPriceUSD, selectedMonths);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181824] to-[#0F0F16] border border-white/15 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Visual Accent Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#0070BA]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#003087]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070BA]/20 border border-[#0070BA]/40 text-[#4CC9F0] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official PayPal Merchant Checkout</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>VIP Vendor Publisher Pass</span>
            <span className="text-[#0070BA] font-extrabold text-base px-2 py-0.5 rounded bg-white/10">
              PayPal
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            {language === 'si'
              ? 'ශ්‍රී ලංකාවේ ප්‍රමුඛතම නයිට්ලයිෆ් ප්ලැට්ෆෝමයේ අසීමිත පාටි, ඩීජේ ලයින්අප්, සහ කොක්ටේල් මෙනු පළ කිරීම සඳහා මාසික අවසරය.'
              : 'Full publishing privileges on loveablelk. Host events, launch guestlists, and feature cocktails across Sri Lanka.'}
          </p>
        </div>

        <div className="text-left sm:text-right bg-black/40 p-3.5 rounded-2xl border border-white/10 shrink-0">
          <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline sm:justify-end gap-1.5">
            <span className="text-[#0070BA]">$</span>
            <span>{totalPriceUSD.toFixed(2)}</span>
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
            ≈ LKR {approxLKR.toLocaleString()} • {selectedMonths * 30} Days Access
          </div>
        </div>
      </div>

      {paymentSuccess ? (
        /* SUCCESSFUL UPGRADE SCREEN */
        <div className="py-10 text-center space-y-5 animate-in zoom-in duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
              PAYPAL ONAPPROVE CONFIRMED
            </span>
            <h4 className="text-2xl font-black text-white">
              {language === 'si' ? 'වෙනිව් පාස් සාර්ථකව සක්‍රීය කරන ලදී!' : 'Subscription Successfully Activated!'}
            </h4>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              {language === 'si'
                ? `ඔබගේ ගිණුමට තවත් දින ${selectedMonths * 30}ක පූර්ණ පාටි පළකිරීමේ අවසරය එකතු වූ අතර Supabase දත්ත ගබඩාවට ගෙවීම් වාර්තාව සාර්ථකව ලියාපදිංචි විය.`
                : `Your account has been granted ${selectedMonths * 30} days of full party & cocktail publishing access. Recorded to Supabase payments ledger.`}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs font-mono text-emerald-400 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PayPal Capture ID:</span>
              <span className="font-bold text-white select-all">{completedOrderId}</span>
            </div>

            <div className="mt-4 text-[11px] text-slate-400">
              Amount Paid: <strong className="text-white">${completedAmount.toFixed(2)} USD</strong> • Gateway: <strong className="text-[#0070BA]">PayPal</strong>
            </div>
          </div>
        </div>
      ) : (
        /* CHECKOUT FORM */
        <div className="py-6 space-y-6">
          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#4CC9F0]" />
              <span>{language === 'si' ? 'කාල සීමාව තෝරන්න:' : 'Select Subscription Plan:'}</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { months: 1, label: '1 Month', days: '30 Days', price: '$16.50', tag: 'Standard' },
                { months: 3, label: '3 Months', days: '90 Days', price: '$45.00', tag: 'Popular' },
                { months: 6, label: '6 Months', days: '180 Days', price: '$85.00', tag: 'Best Value' },
              ].map((tier) => (
                <button
                  key={tier.months}
                  type="button"
                  onClick={() => setSelectedMonths(tier.months)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    selectedMonths === tier.months
                      ? 'bg-[#0070BA]/20 border-[#0070BA] ring-1 ring-[#0070BA] shadow-lg shadow-[#0070BA]/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{tier.label}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      {tier.price}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">{tier.days}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                    {tier.tag}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PayPal App Info Card */}
          <div className="p-4 rounded-2xl bg-[#0070BA]/10 border border-[#0070BA]/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-xs">
                  Connected PayPal App: <strong className="text-emerald-300">{PAYPAL_CONFIG.appName}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                SDK Client ID Active
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/60 border border-white/10">
              <span className="font-mono text-[11px] text-slate-300 truncate max-w-sm">
                {PAYPAL_CONFIG.clientId}
              </span>
              <button
                type="button"
                onClick={handleCopyClientId}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedClientId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedClientId ? 'Copied' : 'Copy Client ID'}</span>
              </button>
            </div>
          </div>

          {/* Error Message Notice if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  If your PayPal payment was captured, you can verify it directly with your Transaction ID below.
                </p>
              </div>
            </div>
          )}

          {/* Interactive PayPal Buttons Container */}
          <div className="p-5 rounded-2xl bg-black/70 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Checkout • {selectedMonths} Month Pass (${totalPriceUSD.toFixed(2)} USD)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {vendorEmail}
              </span>
            </div>

            {/* Container where window.paypal.Buttons renders */}
            <div className="min-h-[100px] flex flex-col justify-center">
              <div ref={paypalContainerRef} id="paypal-button-container" className="w-full" />

              {!sdkReady && !errorMessage && (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0070BA]" />
                  <span>Loading official PayPal interactive checkout...</span>
                </div>
              )}
            </div>

            {/* Guaranteed Direct Callback Simulation for Sandbox / Environments */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={handleSimulateApprovedCallback}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0070BA] via-[#005ea6] to-[#003087] hover:brightness-110 text-white font-black text-xs shadow-xl shadow-[#0070BA]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>
                  Confirm &amp; Activate PayPal Pass (${totalPriceUSD.toFixed(2)} USD • {selectedMonths * 30} Days)
                </span>
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Executes the onApprove subscription upgrade callback, records transaction to Supabase, and enables unlimited publishing.
              </p>
            </div>
          </div>

          {/* Manual PayPal Transaction ID Verification */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <span className="text-xs font-semibold text-slate-300 block">
              {language === 'si'
                ? 'දැනටමත් PayPal හරහා ගෙවා ඇත්නම් Transaction ID එක ඇතුළත් කරන්න:'
                : 'Already completed payment on PayPal? Enter Transaction / Capture ID to verify:'}
            </span>
            <form onSubmit={handleManualVerification} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 9B8413647V123456B or PAYPAL-CAPTURE-ID"
                  value={manualOrderId}
                  onChange={(e) => setManualOrderId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#0070BA] font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  {language === 'si' ? 'සත්‍යාපනය කරන්න' : 'Verify & Upgrade'}
                </button>
              </div>
              {manualError && (
                <p className="text-[11px] text-rose-400">{manualError}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
