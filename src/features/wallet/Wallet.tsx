
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { queueExternalTransfer } from './externalTransferQueue.ts';
import { syncExternalTransfers } from './syncExternalTransfers.ts';
import { useDispatch, useSelector } from 'react-redux';
import {
  fundWallet,
  withdrawToBank,
  transfer,
  payBill,
  fetchTransactions,
  buyAirtime
} from './walletThunks.ts';
import { fetchBalance } from './walletSlice.ts';
import { RootState } from '../../store.ts';

const Wallet: React.FC = () => {
  const dispatch = useDispatch();
  const { balance, loading, error, transactions, txLoading, txError } = useSelector((state: RootState) => state.wallet);
  const [tab, setTab] = useState<'fund' | 'withdraw' | 'transfer' | 'bill' | 'airtime' | 'history'>('fund');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [airtimePhone, setAirtimePhone] = useState('');
  const [airtimeNetwork, setAirtimeNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [transferType, setTransferType] = useState<'internal' | 'external'>('internal');
  const [biller, setBiller] = useState('');
  const [reference, setReference] = useState('');
  const [details, setDetails] = useState('');


   // Sync queued external transfers when online
  React.useEffect(() => {
    const handleOnline = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await syncExternalTransfers(token);
      }
    };
    window.addEventListener('online', handleOnline);
    // Optionally, sync immediately if already online
    if (navigator.onLine) {
      handleOnline();
    }
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    dispatch<any>(fetchBalance());
    dispatch<any>(fetchTransactions());
  }, [dispatch]);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const result = await dispatch<any>(fundWallet({ amount: amt, reference, details }));
    if (fundWallet.fulfilled.match(result)) {
      toast.success('Wallet funded successfully!');
    } else {
      toast.error(result.payload || 'Funding failed');
    }
    setAmount(''); setReference(''); setDetails('');
  };
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const result = await dispatch<any>(withdrawToBank({ amount: amt, reference, details }));
    if (withdrawToBank.fulfilled.match(result)) {
      toast.success('Withdrawal successful!');
    } else {
      toast.error(result.payload || 'Withdraw failed');
    }
    setAmount(''); setReference(''); setDetails('');
  };
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !accountNumber) return;
    if (transferType === 'internal') {
      const result = await dispatch<any>(transfer({ amount: amt, accountNumber, reference, details }));
      if (transfer.fulfilled.match(result)) {
        toast.success('Transfer successful!');
      } else {
        toast.error(result.payload || 'Transfer failed');
      }
    } else {
      // External transfer: queue for offline or send to backend
      try {
        await queueExternalTransfer({
          accountNumber,
          bankCode,
          amount: amt,
          reference,
          details,
        });
        toast.success('External transfer queued and will sync when online.');
      } catch (err) {
        toast.error('Failed to queue external transfer.');
      }
    }
    setAmount(''); setAccountNumber(''); setBankCode(''); setReference(''); setDetails('');
  };
  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !biller) return;
    const result = await dispatch<any>(payBill({ amount: amt, biller, reference, details }));
    if (payBill.fulfilled.match(result)) {
      toast.success('Bill paid successfully!');
    } else {
      toast.error(result.payload || 'Bill payment failed');
    }
    setAmount(''); setBiller(''); setReference(''); setDetails('');
  };

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Wallet</h2>
      <div className="flex flex-col items-center mb-8">
        <span className="text-gray-500">Current Balance</span>
        <span className="text-4xl font-extrabold text-blue-800 mt-2 mb-2">₦{balance.toLocaleString()}</span>
        <span className="text-xs text-gray-400">(Cached for offline use)</span>
      </div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('fund')} className={`flex-1 py-2 rounded-lg font-semibold transition ${tab === 'fund' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-600'}`}>Fund</button>
        <button onClick={() => setTab('withdraw')} className={`flex-1 py-2 rounded-lg font-semibold transition ${tab === 'withdraw' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-600'}`}>Withdraw</button>
        <button onClick={() => setTab('transfer')} className={`flex-1 py-2 rounded-lg font-semibold transition ${tab === 'transfer' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-600'}`}>Transfer</button>
        <button onClick={() => setTab('bill')} className={`flex-1 py-2 rounded-lg font-semibold transition ${tab === 'bill' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-600'}`}>Pay Bill</button>
        <button onClick={() => setTab('airtime')} className={`flex-1 py-2 rounded-lg font-semibold transition ${tab === 'airtime' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-600'}`}>Airtime</button>
        <button onClick={() => setTab('history')} className={`flex-1 py-2 rounded-lg font-semibold transition ${tab === 'history' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-600'}`}>History</button>
      </div>
      {tab === 'airtime' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const amt = parseFloat(airtimeAmount);
            if (!amt || amt <= 0 || !airtimePhone || !airtimeNetwork) {
              toast.error('Please enter amount, phone number, and select network.');
              return;
            }
            // Dispatch buyAirtime thunk (to be implemented)
            try {
              // @ts-ignore
              const result = await dispatch<any>(buyAirtime({ amount: amt, phone: airtimePhone, network: airtimeNetwork }));
              if (buyAirtime.fulfilled.match(result)) {
                toast.success('Airtime purchase successful!');
              } else {
                toast.error(result.payload || 'Airtime purchase failed');
              }
            } catch (err) {
              toast.error('Airtime purchase failed');
            }
            setAirtimeAmount(''); setAirtimePhone(''); setAirtimeNetwork('');
          }}
          className="space-y-4"
        >
          <input type="number" min="1" step="any" placeholder="Amount (₦)" value={airtimeAmount} onChange={e => setAirtimeAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="tel" placeholder="Phone Number" value={airtimePhone} onChange={e => setAirtimePhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <select value={airtimeNetwork} onChange={e => setAirtimeNetwork(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            <option value="">Select Network</option>
            <option value="mtn">MTN</option>
            <option value="airtel">Airtel</option>
            <option value="glo">Glo</option>
            <option value="9mobile">9mobile</option>
          </select>
          <button type="submit" className="w-full py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition disabled:opacity-60">Buy Airtime</button>
        </form>
      )}

      {tab === 'fund' && (
        <form onSubmit={handleFund} className="space-y-4">
          <input type="number" min="1" step="any" placeholder="Amount (₦)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Reference (optional)" value={reference} onChange={e => setReference(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Details (optional)" value={details} onChange={e => setDetails(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition disabled:opacity-60">{loading ? 'Funding...' : 'Fund Wallet'}</button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      )}
      {tab === 'withdraw' && (
        <form onSubmit={handleWithdraw} className="space-y-4">
          <input type="number" min="1" step="any" placeholder="Amount (₦)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Reference (optional)" value={reference} onChange={e => setReference(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Bank/Details (optional)" value={details} onChange={e => setDetails(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition disabled:opacity-60">{loading ? 'Withdrawing...' : 'Withdraw to Bank'}</button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      )}
      {tab === 'transfer' && (
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="flex gap-2 mb-2">
            <label className={`flex-1 cursor-pointer ${transferType === 'internal' ? 'font-bold text-blue-700' : ''}`}>
              <input type="radio" name="transferType" value="internal" checked={transferType === 'internal'} onChange={() => setTransferType('internal')} className="mr-1" />
              To Platform User
            </label>
            <label className={`flex-1 cursor-pointer ${transferType === 'external' ? 'font-bold text-blue-700' : ''}`}>
              <input type="radio" name="transferType" value="external" checked={transferType === 'external'} onChange={() => setTransferType('external')} className="mr-1" />
              To Bank Account
            </label>
          </div>
          <input type="text" placeholder="Recipient Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          {transferType === 'external' && (
            <input type="text" placeholder="Bank Code (e.g. 058 for GTBank)" value={bankCode} onChange={e => setBankCode(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          )}
          <input type="number" min="1" step="any" placeholder="Amount (₦)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Reference (optional)" value={reference} onChange={e => setReference(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Details (optional)" value={details} onChange={e => setDetails(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition disabled:opacity-60">{loading ? 'Transferring...' : 'Transfer'}</button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      )}
      {tab === 'bill' && (
        <form onSubmit={handlePayBill} className="space-y-4">
          <input type="text" placeholder="Biller (e.g. DSTV, PHCN)" value={biller} onChange={e => setBiller(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="number" min="1" step="any" placeholder="Amount (₦)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Reference (optional)" value={reference} onChange={e => setReference(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Details (optional)" value={details} onChange={e => setDetails(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition disabled:opacity-60">{loading ? 'Paying...' : 'Pay Bill'}</button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      )}
      {tab === 'history' && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
          {txLoading ? (
            <div className="text-center text-blue-600">Loading...</div>
          ) : txError ? (
            <div className="text-red-600 text-center">{txError}</div>
          ) : transactions.length === 0 ? (
            <div className="text-gray-500 text-center">No transactions yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {transactions.map(txn => (
                <li key={txn._id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="font-semibold capitalize">{txn.type}</span>
                    <span className="ml-2 text-gray-500 text-sm">{new Date(txn.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="font-mono text-blue-700">₦{txn.amount.toLocaleString()}</div>
                  <div className={`text-xs ml-2 ${txn.status === 'success' ? 'text-green-600' : txn.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>{txn.status}</div>
                  {txn.reference && <div className="text-xs text-gray-400 ml-2">Ref: {txn.reference}</div>}
                  {txn.details && <div className="text-xs text-gray-400 ml-2">{JSON.stringify(txn.details)}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Wallet;
