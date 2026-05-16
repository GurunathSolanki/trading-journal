# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                 # Dev server on http://localhost:3000
npm test                  # Interactive watch mode (Jest + RTL)
npm test -- --watchAll=false --runInBand   # CI-friendly single run
npm test -- --coverage                    # Run with coverage report
npm test -- src/lib/tradingUtils.test.js  # Run a single test file
npm run build             # Production build to /build
```

## Architecture

Create React App (React 19) single-page application — a personal trading journal for tracking Options and Mutual Fund trades. Uses shadcn/ui components (Radix primitives + Tailwind CSS), Quarkus Java backend for the REST API, Chart.js for performance charts, and react-toastify for notifications.

### Theme

Custom CSS custom properties in `src/index.css` (not shadcn's default palette):
- Primary: rust/burnt orange (`hsl(15 100% 23%)`)
- Accent: amber/gold (`hsl(45 93% 47%)`)
- Dark mode variant is also defined via a `.dark` selector
- Mobile inputs use `font-size: 16px` to prevent iOS zoom-on-focus

### State & data flow

`App.js` owns all trade state and acts as the single source of truth. It fetches from the `/api/trades` endpoint on mount (via `AppContent.fetchTrades`, gated with `useRef` to prevent double-fetch in Strict Mode). The `form` object and all CRUD handlers live in `App.js` and are passed down as props to page components.

- `AppContent` → `JournalPage` receives `trades`, `form`, `handleChange`, `addTrade`, `startEdit`, `cancelEdit`, `submitting`, `editingId`, `saveError`, `setSaveError`
- `AppContent` → `DashboardPage` receives `trades` (filtered: only complete trades via `getCompleteTrades`)
- `AppContent` → `PerformancePage` receives `trades` (complete only)
- `MarginCalculatorPage` is self-contained (no external data dependency)

### Pages

| Route | Component | Purpose |
|---|---|---|
| `/` | `JournalPage` | Add/edit trade form + sortable/filterable trade history table with Indian number formatting |
| `/dashboard` | `DashboardPage` | KPIs: total P&L, win rate, profit factor, best/worst trade, time-period filter (daily/weekly/monthly/all) |
| `/performance` | `PerformancePage` | Chart.js line chart comparing Options % vs MF % with absolute/percentage toggle |
| `/margin-calculator` | `MarginCalculatorPage` | Standalone calculator: lot distribution and profit based on margin inputs |

### Key calculations (`src/lib/tradingUtils.js`)

- `calculateRequiredProfit(entry, exit, amount)` — `(amount * 16 * days) / (100 * 365)`, rounded to integer (16% annual return model)
- `calculateAnnualizedPercent(profit, entry, exit, amount)` — `(profit * 365 * 100) / (days * amount)`, returns `toFixed(2)` string
- `getCompleteTrades(trades)` — filters to trades where all numeric fields are non-null and non-empty

### Margin Calculator (`src/MarginCalculatorPage.js`)

Exports `calculateMarginResults(marginForOneOrder, totalMarginAvailable, totalPoints)` and constants `LOT_SIZE = 65`, `ORDER_SIZE = 1755` — all three are imported directly in tests.

### UI system

shadcn/ui components live in `src/components/ui/` (button, card, input, label). Tailwind CSS. `src/lib/utils.js` exports `cn()` and `formatIndianNumber()`.

### Tests

| File | Notes |
|---|---|
| `tradingUtils.test.js` | Core calculation logic |
| `PerformanceChart.test.js` | Heavily mocked: chart.js, react-chartjs-2, lucide-react, UI components |
| `MarginCalculatorPage.test.js` | Tests exported `calculateMarginResults` function directly |
| `PerformancePage.test.js` | Mocks PerformanceChart child and UI components |
| `App.test.js` | Mocks all pages and fetch API |

Mock files in `src/__mocks__/`:
- `react-router-dom.js` — stubs BrowserRouter, Routes, Route, NavLink
- All other mocks (react-toastify, chart.js, lucide-react, UI components) use inline `jest.mock()` calls in individual test files
