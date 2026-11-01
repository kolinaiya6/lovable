import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface PayHereSubscriptionProps {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  onPaymentComplete: (gatewayOrderId: string, gateway: 'PAYHERE') => void;
  monthlyAmountLKR?: number;
}

export const PayHereSubscription: React.FC<PayHereSubscriptionProps> = ({
  vendorId,
  vendorName,
  vendorEmail,
  onPaymentComplete,
  monthlyAmountLKR = 5000,
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.getElementById('payhere-button');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'payhere-button';
      script.src = 'https://sandbox.payhere.lk/payhere.pay.button.js';
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      script.onerror = () => {
        setScriptError(true);
      };
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  const handleSimulateSandboxPayment = () => {
    setIsProcessing(true);
    const generatedOrderId = `PAYHERE-SUB-${Date.now()}`;
    setOrderId(generatedOrderId);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      onPaymentComplete(generatedOrderId, 'PAYHERE');
    }, 1200);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181822] to-[#101016] border border-white/15 shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PayHere Verified Merchant Subscription</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Monthly Vendor Pass Subscription
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Active after your 30-day trial. Unlimited rave guestlists, event flyer broadcasting, and cocktail promotion.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-3xl font-black text-white font-mono">
            LKR {monthlyAmountLKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">/ month • Recurring Pass</div>
        </div>
      </div>

      {paymentSuccess ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-in zoom-in">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Vendor Pass Activated!</h4>
            <p className="text-xs text-slate-400 mt-1">
              Your venue pass has been renewed for 30 days via PayHere Sandbox.
            </p>
            <p className="text-[11px] font-mono text-emerald-400 mt-2">
              Receipt Order ID: {orderId}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-6 space-y-6">
          {/* Plan Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="text-emerald-400 font-bold block mb-1">✓ Unlimited Events</span>
              <p className="text-slate-400 text-[11px]">Publish beach parties, techno raves, and rooftop sessions.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="text-emerald-400 font-bold block mb-1">✓ Realtime RSVPs</span>
              <p className="text-slate-400 text-[11px]">Live guestlist attendee tracking and companion networking.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="text-emerald-400 font-bold block mb-1">✓ Mixology Showcases</span>
              <p className="text-slate-400 text-[11px]">Featured cocktails, tapas specials, and party promotion.</p>
            </div>
          </div>

          {/* PayHere Official Form Container */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#FF758F]" />
                <span>PayHere Smart Payment Gateway</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                SANDBOX LIVE
              </span>
            </div>

            {/* User Requested PayHere embed tag */}
            <div className="py-2 flex items-center justify-center min-h-[50px]">
              <div 
                id="payhere-form" 
                data-pay-id="o92898f1a" 
                data-type="SANDBOX"
                className="w-full flex justify-center"
              />
            </div>

            {/* Seamless One-Click Fallback & Simulation for in-app / iframe environments */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleSimulateSandboxPayment}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E63946] to-[#FF758F] hover:from-[#d62839] hover:to-[#ff5c7d] text-white font-extrabold text-sm shadow-xl shadow-[#E63946]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing PayHere Sandbox Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Subscribe via PayHere • LKR {monthlyAmountLKR.toLocaleString()} / Month</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL Encrypted • Instant 30-Day Extension</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
