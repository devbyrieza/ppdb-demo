# 🏫 PPDB Al-Andalus Ulul Albaab

A modern PPDB (Penerimaan Peserta Didik Baru) registration system built for Pesantren Al-Andalus Ulul Albaab. This project showcases a complete student registration workflow with form validation, OTP verification, and responsive design.

## 🚀 Live Demo

🌐 **[View Live Application](https://ppdb.alandalus-ululalbaab.com)**

## 📋 Project Overview

This is a custom-built PPDB system that streamlines the new student registration process for Islamic boarding schools. The system features a multi-step registration form, document management, and automated verification processes.

### ✨ Key Features

- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 📝 **Multi-step Registration** - Guided registration process with progress tracking
- 🔐 **OTP Verification** - Secure WhatsApp-based verification system
- 💾 **Auto-save Forms** - Data persistence using sessionStorage
- 🎨 **Modern UI/UX** - Beautiful interface with Tailwind CSS
- ⚡ **Performance Optimized** - Built with Next.js 16 and TypeScript
- 📊 **Program Selection** - Dynamic program selection (MTs & I'dad Lughowi)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Deployment**: Vercel
- **Version Control**: Git

## 📱 Screenshots

### Registration Flow
1. **Program Selection** → Choose educational program
2. **PPDB Information** → View requirements and benefits  
3. **Registration Form** → Complete student data
4. **OTP Verification** → WhatsApp verification
5. **Document Upload** → Submit required documents

## 🏗️ Project Structure

```
src/
├── app/
│   ├── daftar/          # Registration page
│   ├── program/         # Program selection
│   ├── ppdb/           # PPDB information
│   └── verifikasi-otp/ # OTP verification
├── components/
│   └── layout/         # Reusable layout components
└── styles/             # Global styles and themes
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/riezaekatomara/alandalus-ululalbaab.git
cd alandalus-ululalbaab

# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 Development Notes

### Key Implementations

- **URL Parameter Flow**: Program → PPDB → Registration with `jenjang` parameter
- **Form Validation**: Client-side validation with real-time error handling
- **Data Persistence**: SessionStorage for form data across page refreshes
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

### Environment Variables

Create a `.env.local` file for local development:

```env
# Add your environment variables here
```

## 🤝 Contributing

This is a client project. For contributions or issues, please contact the development team.

## 📄 License

This project is proprietary software developed for Pesantren Al-Andalus Ulul Albaab.

## 👨‍💻 About Developer

**Developed by: Rieza Eka Tomara**
- 📧 Email: riezaekatomara@gmail.com
- 🌐 GitHub: [riezaekatomara](https://github.com/riezaekatomara)
- 💼 LinkedIn: [Your LinkedIn Profile]

### Services Provided

- 🎨 UI/UX Design & Development
- 💻 Full-stack Web Development
- 📱 Responsive Design Implementation
- ⚡ Performance Optimization
- 🚀 Deployment & DevOps

---

**Note**: This project demonstrates expertise in modern web development, React ecosystem, and building production-ready applications for educational institutions like Pesantren Al-Andalus Ulul Albaab.
