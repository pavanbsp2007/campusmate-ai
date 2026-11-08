import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: 'plus' | 'pro';
  onSuccess?: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  tier,
  onSuccess
}) => {
  const { user, refreshProfile } = useAuth();
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const upiId = 'pavanb1624@okhdfcbank';
  const payeeName = 'CampusMate';
  const amount = tier === 'pro' ? 399 : 199;
  const tierTitle = tier === 'pro' ? 'Student Pro' : 'Student Plus';
  const dailyQueries = tier === 'pro' ? 500 : 50;

  // Standard UPI URI format
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`CampusMate ${tierTitle} Plan`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');
    if (cleanUtr.length < 6) {
      setErrorMsg('Please enter a valid 12-digit UPI Reference (UTR) Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/subscriptions/upi-submit', {
        targetTier: tier,
        utrNumber: cleanUtr
      });

      if (res.success) {
        setIsSuccess(true);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        await refreshProfile();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Payment submission failed. Please check UTR number.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm mb-2">
            <Sparkles size={13} className="text-amber-300" />
            <span>Zero-Fee Direct UPI Payment</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Upgrade to {tierTitle}</h2>
          <p className="text-indigo-100 text-xs mt-0.5">
            Pay <strong>₹{amount}</strong> directly via Google Pay, PhonePe, or Paytm.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Payment Received!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                Welcome to <strong>{tierTitle}</strong>! Your account has been upgraded with <strong>{dailyQueries} daily AI queries</strong>.
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400">
                UTR: {utrNumber.trim()} • Plan Active for 30 Days
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition"
              >
                Start Learning Now &rarr;
              </button>
            </div>
          ) : (
            <>
              {/* QR Code Container */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center text-center">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <img
                    src={qrCodeUrl}
                    alt="CampusMate UPI QR Code"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Scan with any UPI App
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 font-semibold border border-slate-200 dark:border-slate-600">GPay</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 font-semibold border border-slate-200 dark:border-slate-600">PhonePe</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 font-semibold border border-slate-200 dark:border-slate-600">Paytm</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 font-semibold border border-slate-200 dark:border-slate-600">BHIM</span>
                </div>
              </div>

              {/* UPI ID & Amount Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Payee UPI ID
                    </span>
                    <span className="text-xs sm:text-sm font-black text-indigo-700 dark:text-indigo-300 font-mono">
                      {upiId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 hover:bg-indigo-50 transition"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                  <span>Payee Name: <strong>{payeeName}</strong></span>
                  <span className="font-bold text-slate-900 dark:text-white">Amount: <strong className="text-indigo-600 dark:text-indigo-400 text-sm">₹{amount}</strong></span>
                </div>
              </div>

              {/* Mobile Deep Link */}
              <a
                href={upiUri}
                className="w-full sm:hidden py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center gap-2 transition"
              >
                <Smartphone size={15} />
                <span>Tap to Pay in GPay / PhonePe App</span>
              </a>

              {/* Step 2: Verification Input */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enter 12-Digit UPI Ref / UTR Number *
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1.5">
                    Found in your GPay/PhonePe payment receipt (e.g., 431289123456).
                  </p>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 431289123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !utrNumber.trim()}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify &amp; Activate {tierTitle}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Instant 0-Second Credit • 0% Third-Party Gateway Cut</span>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
