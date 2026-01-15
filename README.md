# Haraj Pro: Enterprise Listing Updater 🚀

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Prisma-6.1-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Residential_Proxy-Enabled-orange?style=for-the-badge" alt="Proxy" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

**Haraj Pro** is a high-performance automation suite for Haraj.com.sa. It allows users to schedule automatic updates for their listings using residential proxy rotation to ensure high deliverability and bypass rate limits.

## ✨ Technical Highlights

* 🏠 **Residential Proxy Rotation**: Integrated with **360Proxy** via `https-proxy-agent` for secure, localized Saudi Arabian IPs.
* ⚡ **Next.js 16 + React Server Components**: Modern full-stack architecture using Server Actions for secure GQL mutations.
* 🔄 **Automation Worker**: Standalone `worker.ts` process (via `tsx`) that handles background updates on a 5-minute heartbeat.
* 🔐 **End-to-End Security**: User credentials are encrypted using AES-256-CBC before database persistence.

## 🏗️ Project Structure

Based on the repository architecture:
* `app/api/image/route.ts`: Secure image proxy for Haraj CDN.
* `app/actions.ts`: Server-side login and post-fetching logic.
* `lib/harajClient.ts`: Axios factory with residential proxy rotation.
* `worker.ts`: The main automation execution loop.
* `prisma/schema.prisma`: Database models for user scheduling.

## 🚀 Setup Guide

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a .env file in the root directory and populate it with your credentials (do not commit this file to GitHub):
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Security
ENCRYPTION_KEY="your-32-char-secure-key"

# Residential Proxy (360Proxy)
HARAJ_PROXY_HOST="aus.360s5.com"
HARAJ_PROXY_PORT="3600"
HARAJ_PROXY_USER="your-user-id"
HARAJ_PROXY_PASS="your-proxy-pass"
```
### 3. Database Initialization
```bash
npx prisma db push
npx prisma generate
```
### 4. Running the Application
```bash
# Terminal 1: Web Dashboard
npm run dev

# Terminal 2: Automation Worker
npm run worker
```
## ⚖️ Legal Disclaimer
For Educational Purposes Only. This software is provided "as is" without warranty of any kind. The author is not responsible for any misuse, account bans, or legal consequences resulting from the use of this tool. Use of this automation tool is at your own risk and may violate the Terms of Service of the platform.

## 📄 License
This project is licensed under the MIT License. See the LICENSE file for details.



