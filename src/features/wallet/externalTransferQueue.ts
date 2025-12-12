// src/features/wallet/externalTransferQueue.ts
// Utility for queuing and syncing external bank transfers offline

import { set, get, del, update } from 'idb-keyval';

const QUEUE_KEY = 'external_transfer_queue';

export interface ExternalTransfer {
  id: string; // unique id
  accountNumber: string;
  bankCode: string;
  amount: number;
  reference?: string;
  details?: string;
  createdAt: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
}

export async function queueExternalTransfer(transfer: Omit<ExternalTransfer, 'id' | 'createdAt' | 'status'>) {
  const queue: ExternalTransfer[] = (await get(QUEUE_KEY)) || [];
  const newTransfer: ExternalTransfer = {
    ...transfer,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
    status: 'pending',
  };
  queue.push(newTransfer);
  await set(QUEUE_KEY, queue);
  return newTransfer;
}

export async function getExternalTransferQueue(): Promise<ExternalTransfer[]> {
  return (await get(QUEUE_KEY)) || [];
}

export async function removeExternalTransfer(id: string) {
  const queue: ExternalTransfer[] = (await get(QUEUE_KEY)) || [];
  const filtered = queue.filter(t => t.id !== id);
  await set(QUEUE_KEY, filtered);
}

export async function updateExternalTransferStatus(id: string, status: ExternalTransfer['status']) {
  const queue: ExternalTransfer[] = (await get(QUEUE_KEY)) || [];
  const updated = queue.map(t => t.id === id ? { ...t, status } : t);
  await set(QUEUE_KEY, updated);
}
