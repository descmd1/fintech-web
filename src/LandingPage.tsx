import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Offline Payments',
    desc: 'Send money, buy airtime, and pay bills even with no internet. Actions sync automatically when online.',
    icon: '🌐',
    to: '/wallet',
  },
  {
    title: 'Wallet',
    desc: 'Deposit, withdraw, and view your balance anytime. All data is securely cached offline.',
    icon: '💰',
    to: '/wallet',
  },
  {
    title: 'Transfers',
    desc: 'Queue transfers and they’ll process instantly when you’re back online.',
    icon: '🔁',
    to: '/wallet', // Could be /transfers if you have a dedicated page
  },
  {
    title: 'Bills & Airtime',
    desc: 'Pay bills and buy airtime for any network, even offline.',
    icon: '📱',
    to: '/wallet', // Could be /bills if you have a dedicated page
  },
  {
    title: 'Security',
    desc: 'PIN, biometric login, and strong encryption keep your money safe.',
    icon: '🔒',
    to: '/',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
      <header className="w-full py-6 px-4 flex justify-between items-center bg-white/80 shadow-md">
        <div className="flex items-center gap-2 text-2xl font-bold text-blue-700">
          <span className="text-3xl">💸</span> FintechApp
        </div>
        <nav className="flex gap-4">
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">Login</Link>
          <Link to="/register" className="text-blue-700 font-semibold hover:underline">Sign Up</Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 text-center leading-tight">
          The Offline-First Fintech App for Nigeria
        </h1>
        <p className="text-lg md:text-xl text-blue-700 mb-10 text-center max-w-2xl">
          Send money, pay bills, and manage your wallet anywhere—even with poor or no internet. Secure, fast, and always available.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-5xl">
          {features.map((f) => (
            <Link
              to={f.to}
              key={f.title}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl hover:bg-blue-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              tabIndex={0}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </Link>
          ))}
        </div>
        <div className="flex gap-4">
          <Link to="/register" className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition">Get Started</Link>
          <Link to="/login" className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow border border-blue-700 hover:bg-blue-50 transition">Login</Link>
        </div>
      </main>
      <footer className="w-full py-4 text-center text-gray-500 text-sm bg-white/80 mt-8">
        &copy; {new Date().getFullYear()} FintechApp. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
