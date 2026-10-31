'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Cpu, Flame, CheckCircle, ArrowRight, CreditCard, Loader2, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  colorClass: string;
  borderClass: string;
  buttonClass: string;
}

export default function BillingPage() {
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'card_entry' | 'processing' | 'success'>('idle');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('420');
  const [cardName, setCardName] = useState('Swayam Jain');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jack-subscription-tier');
      if (stored) {
        setCurrentTier(stored);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free Tier',
      price: '$0',
      period: 'forever',
      description: 'Standard agent access & local tools.',
      features: [
        'Core Dashboard access',
        'Basic local LLM integration',
        'Workspace analysis',
        'Standard terminal execution',
      ],
      icon: <Cpu className="w-6 h-6 text-slate-400" />,
      colorClass: 'from-slate-500/10 to-slate-600/10',
      borderClass: 'border-slate-200 dark:border-slate-800',
      buttonClass: 'bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--faint)] text-[var(--foreground)]',
    },
    {
      id: 'pro',
      name: 'Pro License',
      price: '$29',
      period: 'month',
      description: 'High-density production engine suite.',
      features: [
        'Unlock Reel Studio & Audio Studio',
        'Unlock Trading Agents & SEO Analyzer',
        'Zero speed throttling on parallel tasks',
        'Long-term Long-context Neural DB sync',
        'Priority agent scheduling',
      ],
      icon: <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />,
      colorClass: 'from-indigo-500/20 to-purple-500/20',
      borderClass: 'border-indigo-500/40 dark:border-indigo-500/30 ring-1 ring-indigo-500/20',
      buttonClass: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md shadow-indigo-500/20',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Grid',
      price: '$149',
      period: 'month',
      description: 'Unlimited swarm compute nodes & custom SLA.',
      features: [
        'Everything in Pro Suite',
        'Unlimited parallel agent deployments',
        'Dedicated containerised execution sandbox',
        'Active neural knowledge sync',
        'Direct developer Slack SLA support',
      ],
      icon: <Flame className="w-6 h-6 text-pink-500" />,
      colorClass: 'from-pink-500/20 to-rose-500/20',
      borderClass: 'border-pink-500/40 dark:border-pink-500/30 ring-1 ring-pink-500/20',
      buttonClass: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/20',
    },
  ];

  const handleSubscribeClick = (plan: Plan) => {
    if (plan.id === 'free') {
      localStorage.setItem('jack-subscription-tier', 'free');
      setCurrentTier('free');
      window.dispatchEvent(new Event('jack-tier-updated'));
      return;
    }
    setSelectedPlan(plan);
    setCheckoutStep('card_entry');
  };

  const handleProcessPayment = () => {
    setCheckoutStep('processing');
    setTimeout(() => {
      setCheckoutStep('success');
      localStorage.setItem('jack-subscription-tier', selectedPlan?.id || 'free');
      setCurrentTier(selectedPlan?.id || 'free');
      window.dispatchEvent(new Event('jack-tier-updated'));
    }, 2500);
  };

  const handleResetCheckout = () => {
    setCheckoutStep('idle');
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Page Header */}
      <div>
        <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] block mb-1">
          SUITE LICENSING & BILLING
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          Manage Jack Engine Access
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-xl mt-1">
          Upgrade to high-performance tiers, get dedicated compute capacity, and enable premium studio and trading agents.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentTier === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between p-6 rounded-xl border bg-gradient-to-b ${plan.colorClass} ${plan.borderClass} backdrop-blur-md transition-all duration-300 hover:scale-[1.01]`}
            >
              {isCurrent && (
                <span className="absolute -top-3 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-bold tracking-widest uppercase py-1 px-3 rounded-full border border-emerald-400/20 shadow-md">
                  Active Tier
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[var(--surface)]/80 border border-[var(--border)] rounded-xl">
                    {plan.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
                      {plan.price}
                    </span>
                    <span className="text-xs text-[var(--muted)] block">/{plan.period}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">{plan.name}</h3>
                <p className="text-xs text-[var(--muted)] mb-6">{plan.description}</p>

                <div className="h-px bg-[var(--border)] my-4" />

                <ul className="space-y-2 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--muted)]">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={isCurrent && plan.id !== 'free'}
                onClick={() => handleSubscribeClick(plan)}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all duration-200 tracking-wider uppercase flex items-center justify-center gap-2 ${plan.buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Downgrade' : 'Select Plan'}
                {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Security Assurance */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-[var(--border)] bg-[var(--surface)]/30 rounded-xl max-w-3xl">
        <Shield className="w-8 h-8 text-indigo-500 flex-shrink-0" />
        <div className="text-xs text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">Secure, Simulated Stripe Transactions:</strong> All mock payments are simulated locally. No actual credit card details are sent over the network, ensuring compliance with sandboxed local testing standards.
        </div>
      </div>

      {/* Stripe Mock Checkout Modal overlay */}
      <AnimatePresence>
        {checkoutStep !== 'idle' && selectedPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-slate-900 dark:text-slate-100"
            >
              {/* Stripe Header */}
              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold tracking-tight text-sm uppercase text-slate-800 dark:text-slate-200">
                    Stripe Checkout
                  </span>
                </div>
                <button
                  onClick={handleResetCheckout}
                  disabled={checkoutStep === 'processing'}
                  className="text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  CANCEL
                </button>
              </div>

              <div className="p-6">
                {checkoutStep === 'card_entry' && (
                  <div className="space-y-4">
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">
                          Subscription to
                        </span>
                        <span className="text-base font-bold">{selectedPlan.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{selectedPlan.price}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">/month</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded pl-10 pr-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition-colors"
                          />
                          <Landmark className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                            CVC
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            maxLength={4}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleProcessPayment}
                      className="w-full mt-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                    >
                      Pay {selectedPlan.price} Securely
                    </button>
                  </div>
                )}

                {checkoutStep === 'processing' && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-bold">Contacting banking gateway...</p>
                      <p className="text-xs text-slate-500 mt-1">Securing token allocation on sandbox stripe node.</p>
                    </div>
                  </div>
                )}

                {checkoutStep === 'success' && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-500">
                      <CheckCircle className="w-10 h-10 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Subscription Activated!</p>
                      <p className="text-xs text-slate-500 mt-1">
                        You have successfully unlocked the {selectedPlan.name}.
                      </p>
                    </div>

                    <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800 my-4 pt-4 text-left px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Invoice Reference:</span>
                        <span className="font-bold">#INV-JACK-{(Math.random() * 100000).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Charged:</span>
                        <span className="font-bold text-emerald-500">{selectedPlan.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">License Status:</span>
                        <span className="text-emerald-500 font-bold">PRO-VERIFIED</span>
                      </div>
                    </div>

                    <button
                      onClick={handleResetCheckout}
                      className="px-6 py-2 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold uppercase transition-colors"
                    >
                      Dismiss Portal
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
