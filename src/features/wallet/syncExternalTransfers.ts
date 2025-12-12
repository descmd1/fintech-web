// src/features/wallet/syncExternalTransfers.ts
// Utility to sync queued external transfers when online

import { getExternalTransferQueue, removeExternalTransfer, updateExternalTransferStatus, ExternalTransfer } from './externalTransferQueue.ts';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/wallet/external-transfer';

export async function syncExternalTransfers(token: string) {
  const queue: ExternalTransfer[] = await getExternalTransferQueue();
  for (const transfer of queue) {
    if (transfer.status !== 'pending') continue;
    try {
      await updateExternalTransferStatus(transfer.id, 'processing');
      // Send to backend for processing
      await axios.post(API_URL, {
        accountNumber: transfer.accountNumber,
        bankCode: transfer.bankCode,
        amount: transfer.amount,
        reference: transfer.reference,
        details: transfer.details,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await updateExternalTransferStatus(transfer.id, 'success');
      await removeExternalTransfer(transfer.id);
    } catch (err) {
      await updateExternalTransferStatus(transfer.id, 'failed');
    }
  }
}
