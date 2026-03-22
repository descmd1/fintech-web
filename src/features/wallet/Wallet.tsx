
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { queueExternalTransfer } from './externalTransferQueue.ts';
import { syncExternalTransfers } from './syncExternalTransfers.ts';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fundWallet,
  withdrawToBank,
  transfer,
  payBill,
  fetchTransactions,
  buyAirtime,
  fetchBanks,
  Bank,
} from './walletThunks.ts';
import { fetchBalance, clearWalletError } from './walletSlice.ts';
import { logout } from '../auth/authSlice.ts';
import { RootState } from '../../store.ts';

type Tab = 'fund' | 'withdraw' | 'transfer' | 'bill' | 'airtime' | 'history';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'fund', label: 'Fund', icon: '⬇' },
  { id: 'withdraw', label: 'Withdraw', icon: '⬆' },
  { id: 'transfer', label: 'Transfer', icon: '↔' },
  { id: 'bill', label: 'Bills', icon: '📄' },
  { id: 'airtime', label: 'Airtime', icon: '📱' },
  { id: 'history', label: 'History', icon: '📋' },
];

const txTypeColors: Record<string, string> = {
  fund: 'bg-green-100 text-green-700',
  withdraw: 'bg-red-100 text-red-700',
  transfer: 'bg-blue-100 text-blue-700',
  bill: 'bg-purple-100 text-purple-700',
  airtime: 'bg-yellow-100 text-yellow-700',
  'external-transfer': 'bg-orange-100 text-orange-700',
};

const txTypeLabels: Record<string, string> = {
  fund: 'Wallet Funded',
  withdraw: 'Withdrawal',
  transfer: 'Transfer',
  bill: 'Bill Payment',
  airtime: 'Airtime',
  'external-transfer': 'Bank Transfer',
};

const InputGroup: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 transition text-gray-800 placeholder-gray-400';

const Wallet: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { balance, loading, error, transactions, txLoading, txError } = useSelector(
    (state: RootState) => state.wallet
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const [tab, setTab] = useState<Tab>('fund');

  // Shared state — reset when tab changes
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [details, setDetails] = useState('');

  // Transfer-specific
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankQuery, setBankQuery] = useState('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [banksLoadAttempted, setBanksLoadAttempted] = useState(false);
  const [transferType, setTransferType] = useState<'internal' | 'external'>('internal');

  // Bill-specific
  const [biller, setBiller] = useState('');

  // Airtime-specific
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [airtimePhone, setAirtimePhone] = useState('');
  const [airtimeNetwork, setAirtimeNetwork] = useState('');

  // Sync offline external transfers when back online
  useEffect(() => {
    const handleOnline = async () => {
      const token = localStorage.getItem('token');
      if (token) await syncExternalTransfers(token);
    };
    window.addEventListener('online', handleOnline);
    if (navigator.onLine) handleOnline();
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  useEffect(() => {
    dispatch<any>(fetchBalance());
    dispatch<any>(fetchTransactions());
  }, [dispatch]);

  const loadBanks = useCallback(async () => {
    setBanksLoadAttempted(true);
    setBanksLoading(true);
    setBanksError(null);
    const result = await dispatch<any>(fetchBanks());
    if (fetchBanks.fulfilled.match(result)) {
      setBanks(result.payload || []);
    } else {
      setBanksError(result.payload || 'Unable to fetch banks');
    }
    setBanksLoading(false);
  }, [dispatch]);

  useEffect(() => {
    if (
      tab === 'transfer' &&
      transferType === 'external' &&
      banks.length === 0 &&
      !banksLoading &&
      !banksLoadAttempted
    ) {
      loadBanks();
    }
  }, [tab, transferType, banks.length, banksLoading, banksLoadAttempted, loadBanks]);

  const filteredBanks = useMemo(() => {
    const query = bankQuery.trim().toLowerCase();
    if (!query) return banks;
    return banks.filter((bank) => {
      return bank.name.toLowerCase().includes(query) || bank.code.includes(query);
    });
  }, [banks, bankQuery]);

  const selectedBank = useMemo(
    () => banks.find((bank) => bank.code === bankCode) || null,
    [banks, bankCode]
  );

  // Clear errors and reset shared form state on tab change
  const switchTab = useCallback(
    (t: Tab) => {
      setTab(t);
      dispatch<any>(clearWalletError());
      setAmount('');
      setReference('');
      setDetails('');
      setBankQuery('');
      if (t !== 'transfer') {
        setBanksLoadAttempted(false);
      }
    },
    [dispatch]
  );

  const handleLogout = () => {
    dispatch<any>(logout());
    navigate('/login');
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    const result = await dispatch<any>(fundWallet({ amount: amt, reference, details }));
    if (fundWallet.fulfilled.match(result)) {
      toast.success('Wallet funded successfully!');
      dispatch<any>(fetchTransactions());
      setAmount(''); setReference(''); setDetails('');
    } else {
      toast.error(result.payload || 'Funding failed');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    const result = await dispatch<any>(withdrawToBank({ amount: amt, reference, details }));
    if (withdrawToBank.fulfilled.match(result)) {
      toast.success('Withdrawal successful!');
      dispatch<any>(fetchTransactions());
      setAmount(''); setReference(''); setDetails('');
    } else {
      toast.error(result.payload || 'Withdrawal failed');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !accountNumber) return toast.error('Fill in all required fields');
    if (transferType === 'internal') {
      const result = await dispatch<any>(transfer({ amount: amt, accountNumber, reference, details }));
      if (transfer.fulfilled.match(result)) {
        toast.success('Transfer successful!');
        dispatch<any>(fetchTransactions());
        setAmount(''); setAccountNumber(''); setReference(''); setDetails('');
      } else {
        toast.error(result.payload || 'Transfer failed');
      }
    } else {
      if (!bankCode && !selectedBank?.name) {
        return toast.error('Select recipient bank or enter bank code');
      }
      try {
        await queueExternalTransfer({
          accountNumber,
          bankCode: bankCode || undefined,
          bankName: selectedBank?.name,
          amount: amt,
          reference,
          details,
        });
        toast.success('Transfer queued — will process when online.');
        setAmount(''); setAccountNumber(''); setBankCode(''); setBankQuery(''); setReference(''); setDetails('');
      } catch {
        toast.error('Failed to queue external transfer');
      }
    }
  };

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !biller) return toast.error('Fill in all required fields');
    const result = await dispatch<any>(payBill({ amount: amt, biller, reference, details }));
    if (payBill.fulfilled.match(result)) {
      toast.success('Bill paid successfully!');
      dispatch<any>(fetchTransactions());
      setAmount(''); setBiller(''); setReference(''); setDetails('');
    } else {
      toast.error(result.payload || 'Bill payment failed');
    }
  };

  const handleBuyAirtime = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(airtimeAmount);
    if (!amt || amt <= 0 || !airtimePhone || !airtimeNetwork) {
      return toast.error('Please fill in all fields');
    }
    const result = await dispatch<any>(buyAirtime({ amount: amt, phone: airtimePhone, network: airtimeNetwork }));
    if (buyAirtime.fulfilled.match(result)) {
      toast.success('Airtime purchased successfully!');
      dispatch<any>(fetchTransactions());
      setAirtimeAmount(''); setAirtimePhone(''); setAirtimeNetwork('');
    } else {
      toast.error(result.payload || 'Airtime purchase failed');
    }
  };

  const SubmitButton: React.FC<{ label: string; loadingLabel?: string }> = ({
    label,
    loadingLabel,
  }) => (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {loadingLabel || 'Processing...'}
        </>
      ) : (
        label
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💸</span>
          <span className="font-bold text-blue-700 text-lg">FintechApp</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-600 hidden sm:block">
              Hi, <span className="font-semibold">{user.name}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-300 transition"
          >
            <span>⎋</span> Logout
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <p className="text-blue-200 text-sm font-medium mb-1">Wallet Balance</p>
          <p className="text-4xl font-extrabold tracking-tight">
            ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
          {user?.accountNumber && (
            <p className="text-blue-200 text-xs mt-2 font-mono">
              Acc: {user.accountNumber}
            </p>
          )}
          <p className="text-blue-300 text-xs mt-1">
            {navigator.onLine ? '● Online' : '○ Offline — cached balance'}
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl text-sm font-semibold transition min-w-[72px] ${
                tab === t.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <span className="text-base mb-0.5">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* ─── Fund ─────────────────────────────────── */}
          {tab === 'fund' && (
            <form onSubmit={handleFund} className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Fund Wallet</h3>
              <InputGroup label="Amount (₦) *">
                <input type="number" min="1" step="any" placeholder="e.g. 5000" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} required />
              </InputGroup>
              <InputGroup label="Reference (optional)">
                <input type="text" placeholder="Payment reference" value={reference} onChange={e => setReference(e.target.value)} className={inputCls} />
              </InputGroup>
              <InputGroup label="Details (optional)">
                <input type="text" placeholder="Additional details" value={details} onChange={e => setDetails(e.target.value)} className={inputCls} />
              </InputGroup>
              <SubmitButton label="Fund Wallet" loadingLabel="Funding..." />
            </form>
          )}

          {/* ─── Withdraw ─────────────────────────────── */}
          {tab === 'withdraw' && (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Withdraw to Bank</h3>
              <InputGroup label="Amount (₦) *">
                <input type="number" min="1" step="any" placeholder="e.g. 2000" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} required />
              </InputGroup>
              <InputGroup label="Reference (optional)">
                <input type="text" placeholder="Payment reference" value={reference} onChange={e => setReference(e.target.value)} className={inputCls} />
              </InputGroup>
              <InputGroup label="Bank / Details (optional)">
                <input type="text" placeholder="Bank name or notes" value={details} onChange={e => setDetails(e.target.value)} className={inputCls} />
              </InputGroup>
              <SubmitButton label="Withdraw" loadingLabel="Withdrawing..." />
            </form>
          )}

          {/* ─── Transfer ─────────────────────────────── */}
          {tab === 'transfer' && (
            <form onSubmit={handleTransfer} className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Transfer Money</h3>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                {(['internal', 'external'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTransferType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                      transferType === t ? 'bg-white text-blue-700 shadow' : 'text-gray-500'
                    }`}
                  >
                    {t === 'internal' ? '👤 Platform User' : '🏦 Bank Account'}
                  </button>
                ))}
              </div>
              <InputGroup label="Recipient Account Number *">
                <input type="text" placeholder="10-digit account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className={inputCls} required />
              </InputGroup>
              {transferType === 'external' && (
                <>
                  <InputGroup label="Select Bank *">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search bank name"
                        value={bankQuery}
                        onChange={e => setBankQuery(e.target.value)}
                        className={inputCls}
                      />
                      <select
                        value={bankCode}
                        onChange={e => setBankCode(e.target.value)}
                        className={inputCls}
                        required
                      >
                        <option value="">{banksLoading ? 'Loading banks...' : 'Select bank'}</option>
                        {filteredBanks.map((bank) => (
                          <option key={bank.code} value={bank.code}>
                            {bank.name} ({bank.code})
                          </option>
                        ))}
                      </select>
                      {banksError && <p className="text-xs text-red-600">{banksError}</p>}
                      {banksError && (
                        <button
                          type="button"
                          onClick={() => loadBanks()}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Retry bank list
                        </button>
                      )}
                    </div>
                  </InputGroup>
                  <InputGroup label="Bank Code (optional)">
                    <input
                      type="text"
                      placeholder="Optional: enter code if bank is not listed"
                      value={bankCode}
                      onChange={e => setBankCode(e.target.value)}
                      className={inputCls}
                    />
                  </InputGroup>
                </>
              )}
              {transferType === 'external' && selectedBank && (
                <p className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                  Selected bank: <span className="font-semibold">{selectedBank.name}</span>
                </p>
              )}
              <InputGroup label="Amount (₦) *">
                <input type="number" min="1" step="any" placeholder="e.g. 1000" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} required />
              </InputGroup>
              <InputGroup label="Reference (optional)">
                <input type="text" placeholder="Transfer note" value={reference} onChange={e => setReference(e.target.value)} className={inputCls} />
              </InputGroup>
              <SubmitButton
                label={transferType === 'external' ? (navigator.onLine ? 'Send to Bank' : 'Queue Transfer') : 'Transfer'}
                loadingLabel="Transferring..."
              />
            </form>
          )}

          {/* ─── Bill ─────────────────────────────────── */}
          {tab === 'bill' && (
            <form onSubmit={handlePayBill} className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Pay a Bill</h3>
              <InputGroup label="Biller *">
                <select value={biller} onChange={e => setBiller(e.target.value)} className={inputCls} required>
                  <option value="">Select biller</option>
                  <option value="DSTV">DSTV</option>
                  <option value="GOtv">GOtv</option>
                  <option value="PHCN">PHCN / Electricity</option>
                  <option value="LAWMA">LAWMA / Waste</option>
                  <option value="NITEL">NITEL</option>
                  <option value="Other">Other</option>
                </select>
              </InputGroup>
              <InputGroup label="Amount (₦) *">
                <input type="number" min="1" step="any" placeholder="e.g. 3000" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} required />
              </InputGroup>
              <InputGroup label="Reference / Smart Card No. (optional)">
                <input type="text" placeholder="Smart card or meter number" value={reference} onChange={e => setReference(e.target.value)} className={inputCls} />
              </InputGroup>
              <SubmitButton label="Pay Bill" loadingLabel="Paying..." />
            </form>
          )}

          {/* ─── Airtime ──────────────────────────────── */}
          {tab === 'airtime' && (
            <form onSubmit={handleBuyAirtime} className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Buy Airtime</h3>
              <InputGroup label="Network *">
                <div className="grid grid-cols-4 gap-2">
                  {(['mtn', 'airtel', 'glo', '9mobile'] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAirtimeNetwork(n)}
                      className={`py-2 rounded-xl text-sm font-bold capitalize border transition ${
                        airtimeNetwork === n
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {n === '9mobile' ? '9mob' : n.toUpperCase()}
                    </button>
                  ))}
                </div>
              </InputGroup>
              <InputGroup label="Phone Number *">
                <input type="tel" placeholder="e.g. 08031234567" value={airtimePhone} onChange={e => setAirtimePhone(e.target.value)} className={inputCls} required />
              </InputGroup>
              <InputGroup label="Amount (₦) *">
                <div className="flex flex-wrap gap-2 mb-2">
                  {[50, 100, 200, 500, 1000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAirtimeAmount(String(v))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                        airtimeAmount === String(v)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      ₦{v}
                    </button>
                  ))}
                </div>
                <input type="number" min="1" step="any" placeholder="Or enter custom amount" value={airtimeAmount} onChange={e => setAirtimeAmount(e.target.value)} className={inputCls} required />
              </InputGroup>
              <SubmitButton label="Buy Airtime" loadingLabel="Processing..." />
            </form>
          )}

          {/* ─── History ──────────────────────────────── */}
          {tab === 'history' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Transaction History</h3>
                <button
                  onClick={() => dispatch<any>(fetchTransactions())}
                  className="text-xs text-blue-600 hover:underline"
                  disabled={txLoading}
                >
                  {txLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              {txLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : txError ? (
                <div className="text-red-600 text-center py-6">{txError}</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">📂</p>
                  <p className="font-medium">No transactions yet</p>
                  <p className="text-sm mt-1">Your activity will appear here</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {transactions.map((txn) => (
                    <li
                      key={txn._id}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${
                            txTypeColors[txn.type] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {txTypeLabels[txn.type] || txn.type}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 truncate">
                            {new Date(txn.createdAt).toLocaleString('en-NG', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                          {txn.reference && (
                            <p className="text-xs text-gray-400 truncate">Ref: {txn.reference}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <p className="font-bold text-gray-800">
                          ₦{txn.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </p>
                        <span
                          className={`text-xs font-medium ${
                            txn.status === 'success'
                              ? 'text-green-600'
                              : txn.status === 'pending'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Error display for non-history tabs */}
          {error && tab !== 'history' && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Wallet;