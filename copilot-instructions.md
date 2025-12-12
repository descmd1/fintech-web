# Copilot Instructions

- This project is an offline-first fintech PWA for Nigeria.
- Use Redux Toolkit for state management and IndexedDB (via idb) for offline storage.
- Organize features in `src/features/` (wallet, transfers, airtime, bills, transactions, auth).
- Use React Router for navigation.
- Use JWT, bcryptjs, and crypto-js for authentication and encryption.
- All user actions should be queued offline and synced when online.
- Store only non-sensitive data offline and encrypt where necessary.
- Always confirm actions before executing queued transactions.

---

Update this file as the project evolves.
