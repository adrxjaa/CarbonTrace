# Blockchain-Based Verification of Sustainable Activities System (BVSAS)

A blockchain-powered sustainability platform that verifies eco-friendly activities and rewards users with carbon credits and incentives. The system combines AI-assisted feature extraction, backend validation, and blockchain technology to create a transparent and tamper-resistant verification pipeline.

---

## Overview

Users upload sustainability evidence such as EV charging receipts, public transport tickets, tree planting images, or recycling proof. The system extracts relevant information using AI models and validates authenticity through backend rule-based verification. Verified activities are recorded on blockchain and reward tokens are issued to users.

---

## Features

- User registration and authentication
- Upload sustainability evidence
- AI-assisted feature extraction
- Object detection using YOLO
- OCR-based text extraction
- Backend rule-based verification
- Duplicate detection using feature hashes
- Fraud and anomaly detection
- Blockchain transaction recording
- Carbon credit and reward token generation
- Dashboard analytics and sustainability tracking
- Provider QR-based verification support

---

## System Architecture

```text
Next.js + TypeScript Frontend
            ↓
      FastAPI Backend
            ↓
 YOLO + OCR Feature Extraction
            ↓
Backend Validation Logic
(Hash checks + Rules + Fraud Detection)
            ↓
Smart Contract
            ↓
Ethereum Blockchain
            ↓
Carbon Credits / Tokens
            ↓
Dashboard Update
```

---

## Verification Flow

1. User uploads sustainability evidence  
2. Backend receives and preprocesses data  
3. YOLO extracts objects from images  
4. OCR extracts text and metadata  
5. Backend validates:
   - image feature hashes
   - timestamps
   - QR authenticity
   - duplicate detection
   - anomaly patterns  

6. Verified activities are sent to blockchain  
7. Smart contract stores records and issues rewards  
8. Dashboard reflects updated status  

---

## Technology Stack

### Frontend
- Next.js
- TypeScript

### Backend
- FastAPI

### AI / Feature Extraction
- YOLO
- Tesseract OCR
- PyTorch

### Blockchain
- Ethereum
- Solidity Smart Contracts
- MetaMask

### Database
- PostgreSQL

### Deployment
- Docker
- Cloudflare Tunnel

---

## Smart Contract Role

The smart contract does not perform image verification.

Verification happens off-chain using backend validation logic. The smart contract is responsible for:

- Recording verified activities
- Storing immutable transaction records
- Issuing reward tokens
- Maintaining ownership and balances

Architecture used:

**Off-chain verification + On-chain recording**

---

## Provider Integration

Trusted providers such as EV charging stations or sustainability partners authenticate using API keys.

Providers can:

- Request QR generation
- Generate trusted sustainability proofs
- Associate activity metadata with users

QR data includes:

- Provider ID
- Activity type
- Timestamp
- Session details
- Secure hash/signature

---

## Wallet Integration

Users connect wallets through MetaMask.

Wallet functionality:

- Receive reward tokens
- Store carbon credits
- Track transactions
- Interact with blockchain records
 

