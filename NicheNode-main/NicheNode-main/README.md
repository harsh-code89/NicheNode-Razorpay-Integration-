# NicheNode MVP - Niche Skills Consulting Platform

## 🚀 Project Overview

NicheNode is a revolutionary platform that connects people with experts in highly specialized, niche skills. From legacy programming languages like COBOL to Victorian antique authentication, our platform bridges the gap between rare expertise and those who need it.

### 🌟 Key Features

- **AI-Powered Skill Verification**: Automated verification of consultant expertise using advanced AI analysis
- **Blockchain-Secured Transactions**: Web3 integration with smart contracts for secure, transparent payments
- **Semantic Search**: AI-enhanced search to find the perfect expert for your specific needs
- **Escrow System**: Smart contract-based payment protection for both parties
- **Real-time Matching**: Instant connections between seekers and verified experts

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for development and building
- **Ethers.js** for Web3 integration
- **Lucide React** for icons

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Edge Functions** for serverless API endpoints

### Blockchain
- **Solidity** smart contracts
- **Hardhat** for development and testing
- **MetaMask** integration for wallet connectivity

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Supabase      │    │  Smart Contract │
│                 │    │                 │    │                 │
│ • User Auth     │◄──►│ • Database      │    │ • Escrow        │
│ • AI Search     │    │ • Edge Functions│    │ • Payments      │
│ • Web3 Wallet   │    │ • Real-time     │    │ • Disputes      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              ▲
         └──────────────────────────────────────────────┘
                        Web3 Integration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nichenode-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the migrations in the `supabase/migrations` folder
   - Enable Row Level Security (RLS) policies

5. **Start the blockchain network**
   ```bash
   npm run blockchain:start
   ```

6. **Deploy the smart contract**
   ```bash
   npm run blockchain:compile
   npm run blockchain:deploy
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Configure MetaMask**
   - Add Hardhat local network (Chain ID: 1337, RPC: http://127.0.0.1:8545)
   - Import test accounts from Hardhat

## 🎯 Demo Script

### Personas

**👨‍💻 Alex Chen - COBOL Legacy Systems Expert**
- 15+ years maintaining mainframe systems for banks
- Specializes in COBOL, AS/400, and legacy database migrations
- Charges $150/hour for consultation

**🏛️ Sarah Williams - Victorian Antique Authenticator**
- Art history PhD with focus on 19th-century decorative arts
- Expert in Victorian furniture, jewelry, and collectibles authentication
- Charges $75/hour for appraisal services

**🔍 Mike Rodriguez - Excel Automation Seeker**
- Small business owner needing complex Excel macros
- Looking for VBA expert to automate inventory management
- Budget: $200-500 for project

### Demo Flow

#### Act 1: The Problem (2 minutes)
1. **Show the pain point**: Traditional freelance platforms flooded with generic skills
2. **Highlight the gap**: Where do you find a COBOL expert or Victorian button specialist?
3. **Introduce NicheNode**: The solution for ultra-specialized expertise

#### Act 2: The Solution (5 minutes)

**2.1 Expert Registration & AI Verification**
1. Alex registers as a COBOL consultant
2. Fills detailed profile with technical expertise
3. AI verification analyzes and approves his specialized knowledge
4. Profile goes live with "AI Verified" badge

**2.2 Intelligent Search & Matching**
1. Mike searches for "Excel VBA automation inventory"
2. AI semantic search finds relevant experts (not just keyword matching)
3. Results ranked by relevance and expertise match
4. Clear expert profiles with verification status

**2.3 Blockchain-Secured Consultation**
1. Mike requests consultation with Excel expert
2. Chooses Web3 payment option for security
3. 0.05 ETH escrowed in smart contract
4. Expert accepts, consultation begins

#### Act 3: The Future (1 minute)
1. Show completed consultation with automatic payment release
2. Review system building expert reputation
3. Growing network of verified niche experts
4. Vision: The go-to platform for any specialized skill

### Key Demo Points to Highlight

✅ **AI Verification**: Show the real-time skill analysis and verification process
✅ **Semantic Search**: Demonstrate how AI finds relevant experts beyond keywords  
✅ **Web3 Integration**: Live blockchain transaction with MetaMask
✅ **Security**: Escrow system protecting both parties
✅ **User Experience**: Smooth, professional interface throughout

## 🏆 What We Accomplished

### Core Features Delivered
- ✅ Full-stack web application with modern React frontend
- ✅ AI-powered skill verification system
- ✅ Semantic search for expert discovery
- ✅ Blockchain integration with smart contracts
- ✅ Secure escrow payment system
- ✅ Real-time consultation management
- ✅ User authentication and profiles
- ✅ Responsive, production-ready UI

### Technical Achievements
- ✅ Smart contract deployment and testing
- ✅ Web3 wallet integration (MetaMask)
- ✅ Supabase backend with RLS security
- ✅ Edge functions for AI processing
- ✅ TypeScript throughout for type safety
- ✅ Comprehensive error handling

### Innovation Highlights
- 🧠 **AI Skill Verification**: Automated expert validation using natural language processing
- 🔍 **Semantic Search**: Context-aware expert matching beyond keyword search
- 🔗 **Blockchain Escrow**: Trustless payment system with dispute resolution
- 🎯 **Niche Focus**: Specialized platform for rare, high-value skills

## 🎬 Video Demo

**Duration**: 8 minutes
**Format**: Screen recording with voiceover
**Sections**:
1. Problem introduction (1 min)
2. Platform walkthrough (5 min)
3. Live blockchain transaction (1.5 min)
4. Future vision (0.5 min)

## 📸 Screenshots

### Homepage - Expert Discovery
![Homepage showing expert search and featured consultants]

### AI Skill Verification
![Real-time AI analysis of consultant expertise]

### Web3 Consultation Flow
![MetaMask integration and blockchain transaction]

### Consultation Dashboard
![Management interface for ongoing consultations]

## 🚀 Future Roadmap

### Phase 2 Features
- Video consultation integration
- Advanced dispute resolution
- Multi-token payment support
- Mobile app development
- Expert certification programs

### Scaling Plans
- Integration with professional networks
- Corporate enterprise features
- Global expert verification network
- AI-powered skill matching improvements

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to submit pull requests, report issues, and suggest improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Supabase for the excellent backend platform
- Hardhat for blockchain development tools
- The open-source community for amazing libraries and tools

---

**Built with ❤️ for the future of specialized expertise**