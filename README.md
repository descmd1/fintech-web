
# Fintech Offline-First Web App

This project is a Progressive Web App (PWA) for offline-first fintech operations in Nigeria. It supports wallet management, transfers, airtime/bill payments, transaction history, and secure authentication, all with offline capabilities.

## Features
- Wallet: Deposit, withdraw, and view balance (cached offline)
- Transfers: Queue and sync when online
- Airtime/Bills: Queue and sync when online
- Transaction History: Cached offline
- Authentication: PIN or biometric (local)

## Tech Stack
- React + TypeScript (PWA)
- Redux Toolkit (state management)
- IndexedDB (offline storage)
- React Router (navigation)
- JWT, bcryptjs, crypto-js (auth & encryption)

## Getting Started
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm start
   ```

## Project Structure
- `src/features/wallet` - Wallet logic
- `src/features/transfers` - Transfers logic
- `src/features/airtime` - Airtime logic
- `src/features/bills` - Bills logic
- `src/features/transactions` - Transaction history
- `src/features/auth` - Authentication

## Offline-First
All user actions are stored locally and synced when online. Sensitive data is encrypted and only non-sensitive data is stored offline.

---

For more details, see `copilot-instructions.md`.

# fintech-web
 a95ee8d2612976ac6bd987f5a0d1afbcd0aaa776
