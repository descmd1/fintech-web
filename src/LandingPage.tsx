import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store.ts';

const features = [
  {
    title: 'Offline Payments',
    desc: 'Send money, buy airtime, and pay bills even with no internet. Actions sync automatically when online.',
    icon: '🌐',
  },
  {
    title: 'Smart Wallet',
    desc: 'Deposit, withdraw, and view your balance anytime. All data is securely cached offline.',
    icon: '💰',
  },
  {
    title: 'Instant Transfers',
    desc: 'Queue transfers when offline — they process the moment you reconnect.',
    icon: '🔁',
  },
  {
    title: 'Bills & Airtime',
    desc: 'Pay bills and buy airtime for any network, even without an internet connection.',
    icon: '📱',
  },
  {
    title: 'Bank Transfers',
    desc: 'Send money directly to any Nigerian bank account securely via Paystack.',
    icon: '🏦',
  },
  {
    title: 'Top Security',
    desc: 'PIN protection and strong encryption keep your money safe at all times.',
    icon: '🔒',
  },
];

const stats = [
  { label: 'Transactions Processed', value: '50,000+' },
  { label: 'Active Users', value: '10,000+' },
  { label: 'Uptime', value: '99.9%' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);

  const handleGetStarted = () => {
    navigate(token ? '/wallet' : '/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 flex flex-col text-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 w-full py-4 px-6 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="text-2xl">💸</span>
          <span className="text-white">Fintech<span className="text-blue-400">App</span></span>
        </div>
        <nav className="flex items-center gap-3">
          {token ? (
            <button
              onClick={() => navigate('/wallet')}
              className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition text-sm"
            >
              Go to Wallet
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-white/80 font-medium hover:text-white transition text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center px-4">
        <section className="flex flex-col items-center text-center py-20 max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 mb-6 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-widest">
            Offline-First &bull; Nigeria
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
            Your Money Works,<br />Even Offline
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl">
            Send money, pay bills, and manage your wallet anywhere — even with poor or no internet. Secure, fast, and always available.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:bg-blue-400 active:scale-95 transition text-base"
            >
              {token ? 'Open Wallet' : "Get Started — It's Free"}
            </button>
            {!token && (
              <Link
                to="/login"
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition text-base"
              >
                Sign In
              </Link>
            )}
          </div>
        </section>

        {/* Stats bar */}
        <section className="w-full max-w-3xl mx-auto grid grid-cols-3 gap-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl py-5 px-3">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-300">{s.value}</span>
              <span className="text-xs text-white/50 mt-1 text-center">{s.label}</span>
            </div>
          ))}
        </section>

        {/* Features grid */}
        <section className="w-full max-w-5xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-white/90">
            Everything you need in one app
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-start hover:bg-white/10 hover:border-blue-500/40 transition"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="w-full max-w-2xl mx-auto mb-20 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-10 flex flex-col items-center text-center shadow-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-white/80 mb-6 text-sm md:text-base">
            Join thousands of Nigerians managing money smarter with FintechApp.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 active:scale-95 transition shadow"
          >
            {token ? 'Go to My Wallet' : 'Create Free Account'}
          </button>
        </section>
      </main>

      <footer className="w-full py-6 px-6 flex flex-col md:flex-row items-center justify-between gap-2 bg-slate-900/60 border-t border-white/10 text-sm text-white/40">
        <span>&copy; {new Date().getFullYear()} FintechApp. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="/login" className="hover:text-white/70 transition">Login</Link>
          <Link to="/register" className="hover:text-white/70 transition">Register</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;