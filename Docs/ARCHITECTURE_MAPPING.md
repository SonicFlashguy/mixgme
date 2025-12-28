# CryptoCash 2.0 - Detailed Directory Architecture & Mapping

## Table of Contents

1. [Project Structure Overview](#project-structure-overview)
2. [Root Level Files](#root-level-files)
3. [Source Code Architecture](#source-code-architecture)
4. [Component Hierarchy](#component-hierarchy)
5. [Configuration Files](#configuration-files)
6. [Development Tools](#development-tools)
7. [Future Blockchain Integration Structure](#future-blockchain-integration-structure)
8. [Asset Organization](#asset-organization)

## Project Structure Overview

```
CryptoCrashGame/
├── src/                          # Main source code directory
│   ├── components/               # React components organized by feature
│   ├── context/                  # React Context providers
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries and helpers
│   ├── types/                    # TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   ├── index.css                 # Global styles
│   └── vite-env.d.ts            # Vite environment types
├── public/                       # Static assets
├── backups/                      # Development backup files
├── package.json                  # Project dependencies and scripts
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── biome.json                   # Code formatting configuration
└── README.md                    # Project documentation
```

## Root Level Files

### Core Configuration Files

| File | Purpose | Critical for Blockchain |
|------|---------|------------------------|
| `package.json` | Dependencies, scripts, metadata | ✅ Will need blockchain deps |
| `tsconfig.json` | TypeScript compiler settings | ✅ Type safety for contracts |
| `vite.config.ts` | Build tool configuration | ⚠️ May need blockchain bundling |
| `tailwind.config.js` | UI styling framework | ❌ UI only |
| `biome.json` | Code formatting rules | ❌ Development only |
| `components.json` | UI component configuration | ❌ UI only |
| `postcss.config.js` | CSS processing | ❌ UI only |

### Documentation & Metadata

| File | Purpose | Blockchain Relevance |
|------|---------|---------------------|
| `README.md` | Project overview and setup | ⚠️ Will need blockchain setup |
| `MIGRATION.md` | Deployment instructions | ⚠️ Will need contract deployment |
| `CHART_IMPLEMENTATION.md` | Chart technical details | ❌ UI only |
| `netlify.toml` | Deployment configuration | ⚠️ May need RPC endpoints |

### Development Files

| File | Purpose | Status |
|------|---------|--------|
| `test-*.js` | Testing utilities | 🔧 Development |
| `console-test.js` | Browser console tests | 🔧 Development |
| `*-debug.js` | Debugging utilities | 🔧 Development |
| `backup.sh` | Backup automation | 🔧 Development |

## Source Code Architecture

### `/src` Directory Structure

```
src/
├── components/                   # Component library
│   ├── Chart/                   # Chart rendering components
│   ├── Chat/                    # Chat/social components
│   ├── Debug/                   # Development debugging tools
│   ├── ErrorBoundary/           # Error handling components
│   ├── Layout/                  # Page layout components
│   ├── Leaderboard/             # Ranking and statistics
│   └── Trading/                 # Betting and trading UI
├── context/                     # React Context providers
│   └── BettingContext.tsx       # Global betting state
├── hooks/                       # Custom React hooks
│   └── useScrollVisibility.ts   # UI utility hook
├── lib/                         # Utility libraries
│   ├── canvas-utils.ts          # Canvas optimization
│   ├── easing.ts               # Animation easing functions
│   └── performance.ts          # Performance monitoring
├── types/                       # TypeScript definitions
│   └── chart.ts                # Chart-specific types
├── App.tsx                      # Root application component
├── main.tsx                     # React application bootstrap
├── index.css                    # Global CSS styles
└── vite-env.d.ts               # Vite environment types
```

## Component Hierarchy

### Chart Components (`/src/components/Chart/`)

```
Chart/
├── CandlestickChart.tsx         # Main chart component ⭐ CORE
│   ├── State Management         # Game state, chart data
│   ├── Canvas Rendering         # High-performance chart rendering
│   ├── Price Generation         # Realistic market simulation
│   ├── Crash Detection          # Game mechanics
│   └── Animation System         # 60fps smooth animations
├── MainChart.tsx                # Alternative chart implementations
├── MainChart.complex.tsx        # Complex chart variant
├── MainChart.safe.tsx           # Stable chart variant
├── MainChart.simple.tsx         # Simplified chart variant
├── MiniCharts.tsx              # Secondary chart displays
└── Multipliers.tsx             # Multiplier visualization
```

**CandlestickChart.tsx Analysis**:
- **Lines of Code**: ~1,200+ (large, complex component)
- **Dependencies**: Canvas API, React hooks, BettingContext
- **Key Functions**:
  - `generateCrashPoint()`: Statistical crash point generation
  - `generatePriceMovement()`: Realistic market simulation
  - `startSmoothInterpolation()`: 60fps animation system
  - `drawCandle()`: Professional OHLC rendering
  - `startNewGame()`: Game cycle management

**Blockchain Integration Points**:
```typescript
// Current: Local state
const startNewGame = () => {
  setGameState({ isActive: true, crashPoint: generateCrashPoint() });
}

// Future: Blockchain state
const startNewGame = async () => {
  const gameId = await contractService.initializeGame();
  const crashPoint = await contractService.getGameCrashPoint(gameId);
  setGameState({ isActive: true, crashPoint, gameId });
}
```

### Trading Components (`/src/components/Trading/`)

```
Trading/
└── TradingControls.tsx          # Main trading interface ⭐ CORE
    ├── Bet Amount Input         # User bet input with validation
    ├── Sell Percentage Input    # Partial cashout controls
    ├── Token Selection          # SOL/FREE mode toggle
    ├── Balance Display          # Real-time balance tracking
    ├── PnL Tracking            # Profit/loss calculation
    └── Paper Trading Mode       # Risk-free testing mode
```

**TradingControls.tsx Analysis**:
- **Integration Level**: High - Direct betting interface
- **Blockchain Dependencies**: Wallet balance, transaction signing
- **State Dependencies**: BettingContext for all trading operations

**Future Wallet Integration**:
```typescript
// Current: Context state
const { balance, placeBet, cashOut } = useBetting();

// Future: Wallet integration
const { walletBalance, signTransaction } = useWallet();
const { placeBet: contractPlaceBet } = useContract();

const placeBet = async () => {
  const tx = await contractPlaceBet(amount);
  const signed = await signTransaction(tx);
  await broadcastTransaction(signed);
}
```

### Layout Components (`/src/components/Layout/`)

```
Layout/
├── MainLayout.tsx               # Primary application layout
│   ├── Header Integration       # Navigation and branding
│   ├── Grid System             # 3-column responsive layout
│   ├── Component Orchestration  # Chart + Trading + Sidebar
│   └── Scroll Management        # Custom scroll behavior
└── Header.tsx                   # Navigation header
    ├── Logo/Branding           # Project identification
    ├── Navigation Menu         # Route management
    └── Wallet Connect Button   # 🚧 Future wallet integration
```

**Header.tsx Blockchain Integration**:
```typescript
// Current: Static navigation
const Header = () => (
  <nav>
    <Logo />
    <Navigation />
    {/* Future: Wallet connection */}
  </nav>
);

// Future: Wallet integration
const Header = () => {
  const { connected, address, connect, disconnect } = useWallet();
  return (
    <nav>
      <Logo />
      <Navigation />
      <WalletButton 
        connected={connected} 
        address={address}
        onConnect={connect}
        onDisconnect={disconnect}
      />
    </nav>
  );
};
```

### Chat & Social Components (`/src/components/Chat/`)

```
Chat/
└── Sidebar.tsx                  # Chat interface
    ├── Message Display          # Real-time chat messages
    ├── User Authentication      # 🚧 "Please connect wallet to chat"
    ├── Leaderboard Integration  # Social gaming features
    └── Social Features          # Community interaction
```

**Blockchain Integration Needed**:
- Wallet-based authentication
- On-chain message verification
- Token-gated chat features
- Reputation system

### Leaderboard Components (`/src/components/Leaderboard/`)

```
Leaderboard/
└── Leaderboard.tsx             # Rankings and statistics
    ├── RecentWinners           # Latest game winners
    ├── Top Players             # Cumulative rankings
    ├── Statistics Display      # Win/loss ratios
    └── Mock Data              # 🚧 Placeholder implementation
```

**Future Blockchain Data**:
```typescript
// Current: Mock data
const mockWinners = [
  { username: 'Player1', amount: '1.234', multiplier: '2.45x' }
];

// Future: On-chain data
const useLeaderboard = () => {
  const [winners, setWinners] = useState([]);
  
  useEffect(() => {
    const fetchWinners = async () => {
      const recentWins = await contractService.getRecentWinners();
      setWinners(recentWins);
    };
    fetchWinners();
  }, []);
  
  return { winners };
};
```

## Context & State Management

### Betting Context (`/src/context/BettingContext.tsx`)

**Critical Blockchain Integration Point** ⭐

```typescript
// Current implementation structure
interface BettingContextType {
  // User state
  balance: number;                 // 🔗 Future: Wallet balance
  isPaperMode: boolean;           // Local testing mode
  
  // Game state
  multiplier: number;             // 🔗 Future: Contract state
  isGameActive: boolean;          // 🔗 Future: Contract state
  crashPoint: number;             // 🔗 Future: Contract state
  
  // Betting functions
  placeBet: () => void;           // 🔗 Future: Contract transaction
  cashOut: () => void;            // 🔗 Future: Contract transaction
  
  // Analytics
  getCurrentPnL: () => number;    // 🔗 Future: On-chain calculation
  getCumulativePnL: () => number; // 🔗 Future: Historical data
}
```

**Blockchain Migration Plan**:

1. **Phase 1**: Wrapper Integration
```typescript
const BettingProvider = ({ children }) => {
  const wallet = useWallet();
  const contract = useContract();
  
  // Hybrid mode: Local + Blockchain
  const placeBet = async () => {
    if (isPaperMode) {
      // Current local logic
      setBalance(prev => prev - amount);
    } else {
      // New blockchain logic
      const tx = await contract.placeBet(amount);
      await wallet.signTransaction(tx);
    }
  };
};
```

2. **Phase 2**: Full Blockchain Integration
```typescript
const BettingProvider = ({ children }) => {
  const { gameState, placeBet, cashOut } = useGameContract();
  const { balance } = useWallet();
  
  // Pure blockchain implementation
  return (
    <BettingContext.Provider value={{
      balance,
      gameState,
      placeBet,
      cashOut,
      // All data from blockchain
    }}>
      {children}
    </BettingContext.Provider>
  );
};
```

## Utility Libraries (`/src/lib/`)

### Canvas Optimization (`/src/lib/canvas-utils.ts`)
```typescript
// Performance-critical rendering utilities
export class DirtyRectManager          // Optimized redraw regions
export class CanvasOptimizer           // Rendering performance
export function drawOptimizedCandlestick  // High-performance chart drawing
```

### Animation System (`/src/lib/easing.ts`)
```typescript
// Smooth animation utilities
export type EasingFunction = (t: number) => number;
export const easeOutCubic: EasingFunction;
export const easeOutExpo: EasingFunction;
export function selectEasing;           // Adaptive easing selection
export function subpixelInterpolate;   // High-precision animation
```

### Performance Monitoring (`/src/lib/performance.ts`)
```typescript
// Performance tracking and optimization
export class AdaptiveQualityManager    // Dynamic quality scaling
export class PerformanceProfiler       // Performance metrics
export class AnimationFrameManager     // Optimized frame handling
```

## Type Definitions (`/src/types/`)

### Chart Types (`/src/types/chart.ts`)

**Comprehensive Type System**:
```typescript
// Core data structures
interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Animation system
interface SmoothCandleData extends CandleData {
  targetOpen: number;
  targetHigh: number;
  targetLow: number;
  targetClose: number;
  isAnimating: boolean;
  easingFunction: EasingFunction;
}

// Performance monitoring
interface PerformanceState {
  currentFPS: number;
  qualityLevel: number;
  memoryUsage: number;
  subpixelRenderingEnabled: boolean;
}
```

**Future Blockchain Types**:
```typescript
// Planned blockchain type extensions
interface BlockchainCandleData extends CandleData {
  blockHeight: number;
  transactionHash: string;
  gameId: string;
  verified: boolean;
}

interface OnChainGameState {
  gameId: string;
  startTime: number;
  crashPoint: number;
  totalBets: number;
  totalVolume: number;
  status: 'active' | 'crashed' | 'settling';
}
```

## Future Blockchain Integration Structure

### Planned Directory Additions

```
src/
├── services/                    # 🚧 Future blockchain services
│   ├── wallet/                 # Wallet integration
│   │   ├── WalletService.ts    # Abstract wallet interface
│   │   ├── PhantomAdapter.ts   # Phantom wallet implementation
│   │   ├── SolflareAdapter.ts  # Solflare wallet implementation
│   │   └── WalletProvider.tsx  # React wallet context
│   ├── contracts/              # Smart contract integration
│   │   ├── CrashGameContract.ts # Main game contract
│   │   ├── TokenContract.ts    # Token/betting contract
│   │   └── ContractProvider.tsx # Contract context
│   ├── blockchain/             # Blockchain utilities
│   │   ├── SolanaService.ts    # Solana blockchain interface
│   │   ├── TransactionBuilder.ts # Transaction construction
│   │   └── EventListener.ts    # Contract event handling
│   └── api/                    # External API services
│       ├── PriceOracle.ts      # Real price data
│       ├── GameHistory.ts      # Historical game data
│       └── LeaderboardAPI.ts   # Ranking services
├── contracts/                   # 🚧 Smart contract ABIs and interfaces
│   ├── abis/                   # Contract ABI definitions
│   │   ├── CrashGame.json      # Main game contract ABI
│   │   └── BettingToken.json   # Token contract ABI
│   ├── types/                  # Generated contract types
│   │   ├── CrashGame.ts        # TypeScript contract interface
│   │   └── BettingToken.ts     # Token contract types
│   └── addresses/              # Contract deployment addresses
│       ├── mainnet.ts          # Production contract addresses
│       ├── testnet.ts          # Testing contract addresses
│       └── localhost.ts        # Local development addresses
└── utils/                      # 🚧 Blockchain utilities
    ├── formatters.ts           # Data formatting utilities
    ├── validators.ts           # Input validation
    ├── encryption.ts           # Security utilities
    └── constants.ts            # Blockchain constants
```

### Integration Architecture

```typescript
// Future application architecture
App.tsx
├── WalletProvider              # Wallet connection management
│   ├── ContractProvider        # Smart contract interfaces
│   │   ├── BettingProvider     # Game state management
│   │   │   └── UI Components   # Current component tree
│   │   └── PriceProvider       # Real-time price feeds
│   └── ErrorBoundary          # Blockchain error handling
```

## Asset Organization (`/public/`)

### Static Assets Structure

```
public/
├── _redirects                  # Netlify routing configuration
├── rugsfun_logo.png           # Application branding
├── icons/                     # UI icons and symbols
│   └── solana.png            # Solana token icon
└── fonts/                     # Custom typography
    └── [font files]           # Monospace trading fonts
```

**Future Blockchain Assets**:
```
public/
├── wallets/                   # 🚧 Wallet provider icons
│   ├── phantom.svg           # Phantom wallet icon
│   ├── solflare.svg          # Solflare wallet icon
│   └── metamask.svg          # MetaMask wallet icon
├── tokens/                    # 🚧 Token icons
│   ├── sol.svg               # Solana token
│   ├── usdc.svg              # USDC stablecoin
│   └── custom-token.svg      # Project token
└── chains/                    # 🚧 Blockchain network icons
    ├── solana.svg            # Solana network
    ├── ethereum.svg          # Ethereum network
    └── polygon.svg           # Polygon network
```

## Configuration File Analysis

### Build Configuration (`vite.config.ts`)

**Current Configuration**:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    host: '0.0.0.0'
  }
});
```

**Future Blockchain Extensions**:
```typescript
export default defineConfig({
  plugins: [
    react(),
    // Future: Blockchain development plugins
  ],
  define: {
    // Environment variables for contract addresses
    'process.env.SOLANA_RPC_URL': JSON.stringify(process.env.SOLANA_RPC_URL),
    'process.env.CONTRACT_ADDRESS': JSON.stringify(process.env.CONTRACT_ADDRESS),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Future: Blockchain library optimizations
      external: ['@solana/web3.js'], // Prevent bundling large libs
    }
  }
});
```

### TypeScript Configuration (`tsconfig.json`)

**Blockchain-Ready Configuration**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/contracts/*": ["./src/contracts/*"],
      "@/services/*": ["./src/services/*"]
    }
  }
}
```

## Development Tools & Utilities

### Testing Infrastructure

**Current Testing Files**:
```
├── test-candle-aggregation.js   # Chart performance testing
├── test-crash-closes-trade.js   # Game mechanics testing
├── test-paper-trading.js        # Trading system testing
├── test-pnl-tracker.js         # PnL calculation testing
├── test-state-sync.js          # State synchronization testing
└── console-test.js             # Browser console debugging
```

**Future Blockchain Testing**:
```
tests/
├── unit/                       # 🚧 Unit tests
│   ├── wallet.test.ts          # Wallet connection tests
│   ├── contracts.test.ts       # Contract interaction tests
│   └── transactions.test.ts    # Transaction building tests
├── integration/                # 🚧 Integration tests
│   ├── end-to-end.test.ts     # Full game flow tests
│   ├── blockchain-sync.test.ts # State synchronization tests
│   └── error-handling.test.ts  # Error recovery tests
└── fixtures/                   # 🚧 Test data
    ├── mock-wallets.ts         # Mock wallet implementations
    ├── test-contracts.ts       # Test contract deployments
    └── sample-games.ts         # Sample game data
```

### Backup System

**Current Backup Structure**:
```
backups/
├── backup.log                  # Backup operation logs
├── *.backup-TIMESTAMP-DESC     # Timestamped file backups
├── 20250531_*/                # Date-organized backups
├── Chart/                      # Component-specific backups
├── last-100-removal/          # Feature-specific backups
├── live-tracker-positioning/   # UI adjustment backups
└── paper-trading-implementation/ # Feature implementation backups
```

## Critical Integration Points Summary

### High Priority Blockchain Integration

1. **BettingContext.tsx** (🔥 Critical)
   - Core state management
   - All betting operations
   - Balance management
   - Game state synchronization

2. **CandlestickChart.tsx** (🔥 Critical)
   - Game state display
   - Real-time multiplier updates
   - Crash detection visualization
   - Price feed integration

3. **TradingControls.tsx** (🔥 Critical)
   - User betting interface
   - Wallet balance display
   - Transaction initiation
   - Input validation

4. **Header.tsx** (⚠️ Important)
   - Wallet connection UI
   - Network selection
   - User account display

### Medium Priority Blockchain Integration

5. **Leaderboard.tsx** (⚠️ Important)
   - On-chain statistics
   - Historical game data
   - Player rankings

6. **Sidebar.tsx** (💡 Enhancement)
   - Wallet-gated chat
   - Social features
   - Community integration

### Low Priority Blockchain Integration

7. **Chart Performance Libraries** (💡 Optional)
   - May benefit from WebGL for larger scales
   - Real-time price oracle integration

## Architecture Conclusion

The current CryptoCash 2.0 architecture demonstrates excellent separation of concerns and modularity, making blockchain integration straightforward. The key integration points are clearly identified, and the codebase structure supports gradual migration from local state to blockchain state without major refactoring.

**Strengths for Blockchain Integration**:
- ✅ Modular component architecture
- ✅ Centralized state management (BettingContext)
- ✅ TypeScript type safety throughout
- ✅ Clear separation of UI and business logic
- ✅ Performance-optimized rendering system
- ✅ Comprehensive error handling

**Integration Readiness Score**: 9/10

The project is exceptionally well-architected for blockchain integration, requiring primarily additive changes rather than structural refactoring.