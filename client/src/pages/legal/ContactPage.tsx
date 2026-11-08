import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Clock, MapPin, Send, CheckCircle2, Headphones, HelpCircle } from 'lucide-react';
import { Footer } from '../../components/layout/Footer';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Subscription / Billing Query');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to CampusMate</span>
          </Link>
          <div className="flex items-center gap-2">
            <Headphones size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-sm">Contact &amp; Support</span>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Official Merchant Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                Customer Support
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-white">
                Get in Touch
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Have questions regarding your Student Plus/Pro subscription, attendance tools, or technical issues? We are here to help.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Official Support Desk
                  </h4>
                  <a
                    href="mailto:support@campusmate.ai"
                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    support@campusmate.ai
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">Average response time: &lt; 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Support Operating Hours
                  </h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Monday to Saturday
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">9:00 AM – 6:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Operating Registered Office
                  </h4>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    CampusMate AI EdTech<br />
                    Technology Innovation Hub<br />
                    Bengaluru, Karnataka, 560001, India
                  </p>
                </div>
              </div>

            </div>

            {/* Grievance Officer Box (Mandatory under RBI / Indian IT Rules) */}
            <div className="bg-slate-100/80 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/60 text-xs space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[11px]">
                Appointed Grievance Officer
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                In accordance with Indian Information Technology Act 2000 and Rules made thereunder:
              </p>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                Officer: <strong>Grievance Redressal Team</strong><br />
                Email: <code className="text-indigo-600 dark:text-indigo-400">grievance@campusmate.ai</code>
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Support Ticket Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Send Us a Direct Message
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Fill in the form below and our support engineers will review your request.
              </p>

              {isSubmitted ? (
                <div className="p-8 text-center space-y-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Ticket Received!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    Thank you, {name}. A support specialist will respond to <strong>{email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2 inline-block"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Registered Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@college.edu"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Subscription / Billing Query">Subscription / Billing Query</option>
                      <option value="Refund & Cancellation Claim">Refund &amp; Cancellation Claim</option>
                      <option value="Attendance / CGPA Calculator Bug">Attendance / CGPA Calculator Bug</option>
                      <option value="AI Tutor & PDF Summarizer Question">AI Tutor &amp; PDF Summarizer Question</option>
                      <option value="College Partnership / Bulk Access">College Partnership / Bulk Access</option>
                      <option value="Other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Message Details *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue or provide your Razorpay Payment ID if requesting a billing review..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send size={16} />
                    <span>Send Message to Support</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
