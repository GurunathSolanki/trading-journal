import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JournalPage from "./JournalPage";
import PerformancePage from "./PerformancePage";
import DashboardPage from "./DashboardPage";
import MarginCalculatorPage from "./MarginCalculatorPage";
import SettingsPage from "./SettingsPage";
import { ToastContainer, toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import { Sun, Moon, LineChart, LayoutDashboard, BookOpen, BarChart3, Calculator, Settings } from "lucide-react";
import { getCompleteTrades } from "./lib/tradingUtils";
import "./App.css";

// API Base URL
const API_BASE_URL = "/api";

function AppContent() {
  const fetchOnceRef = useRef(false);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  const initialForm = {
    entryDate: "",
    exitDate: "",
    optionsTradingAmount: "",
    requiredProfit: "",
    interest: "",
    actualProfit: "",
    totalProfit: "",
    percent: "",
    mfTradingAmount: "",
    pnl: "",
    mfProfit: ""
  };

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const getCompleteTradesFiltered = (tradesArray) => {
    return getCompleteTrades(tradesArray).sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate));
  };

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;
    fetchTrades();
  }, []);

  async function fetchTrades() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/trades`);
      if (!response.ok) throw new Error("Failed to fetch trades");
      const data = await response.json();
      setTrades(data);
      toast.success("Trades loaded successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load trades.");
    } finally {
      setLoading(false);
    }
  }

  async function addTrade(e) {
    e.preventDefault();
    setSaveError("");
    setSubmitting(true);

    const payload = {
      ...form,
      optionsTradingAmount: form.optionsTradingAmount === "" ? 0 : Number(form.optionsTradingAmount),
      requiredProfit: form.requiredProfit === "" ? 0 : Number(form.requiredProfit),
      interest: form.interest === "" ? 0 : Number(form.interest),
      actualProfit: form.actualProfit === "" ? 0 : Number(form.actualProfit),
      totalProfit: form.totalProfit === "" ? 0 : Number(form.totalProfit),
      percent: form.percent === "" ? 0 : Number(form.percent),
      mfTradingAmount: form.mfTradingAmount === "" ? 0 : Number(form.mfTradingAmount),
      pnl: form.pnl === "" ? 0 : Number(form.pnl),
      mfProfit: form.mfProfit === "" ? 0 : Number(form.mfProfit),
      entryDate: form.entryDate || null,
      exitDate: form.exitDate || null
    };

    const url = editingId ? `${API_BASE_URL}/trades/${editingId}` : `${API_BASE_URL}/trades`;
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingId ? "update" : "save"} trade`);
      }

      setSaveError("");
      setForm(initialForm);
      toast.success(editingId ? "Trade updated successfully." : "Trade added successfully.");
      setEditingId(null);
      fetchTrades();
    } catch (error) {
      console.error("Trade save failed", error);
      setSaveError(error.message);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(trade) {
    setEditingId(trade.id);
    setForm({
      entryDate: trade.entryDate || "",
      exitDate: trade.exitDate || "",
      optionsTradingAmount: trade.optionsTradingAmount || "",
      requiredProfit: trade.requiredProfit || "",
      interest: trade.interest || "",
      actualProfit: trade.actualProfit || "",
      totalProfit: trade.totalProfit || "",
      percent: trade.percent || "",
      mfTradingAmount: trade.mfTradingAmount || "",
      pnl: trade.pnl || "",
      mfProfit: trade.mfProfit || ""
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
  }

  function handleChange(field, value) {
    const updatedForm = { ...form, [field]: value };

    if (updatedForm.entryDate && updatedForm.exitDate && updatedForm.optionsTradingAmount) {
      updatedForm.requiredProfit = calculateRequiredProfit(
        updatedForm.entryDate,
        updatedForm.exitDate,
        Number(updatedForm.optionsTradingAmount)
      );
    }

    const interestVal = Number(updatedForm.interest) || 0;
    const actualProfitVal = Number(updatedForm.actualProfit) || 0;
    updatedForm.totalProfit = interestVal + actualProfitVal;

    if (updatedForm.entryDate && updatedForm.exitDate && updatedForm.optionsTradingAmount) {
      const start = new Date(updatedForm.entryDate);
      const end = new Date(updatedForm.exitDate);
      const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0 && updatedForm.optionsTradingAmount > 0) {
        updatedForm.percent = (
          (updatedForm.totalProfit * 365 * 100) /
          (diffDays * Number(updatedForm.optionsTradingAmount))
        ).toFixed(2);
      } else {
        updatedForm.percent = "0.00";
      }
    }

    if (updatedForm.entryDate && updatedForm.exitDate && updatedForm.mfTradingAmount && updatedForm.pnl) {
      const start = new Date(updatedForm.entryDate);
      const end = new Date(updatedForm.exitDate);
      const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0 && updatedForm.mfTradingAmount > 0) {
        updatedForm.mfProfit = (
          (updatedForm.pnl * 365 * 100) /
          (diffDays * Number(updatedForm.mfTradingAmount))
        ).toFixed(2);
      } else {
        updatedForm.mfProfit = "0.00";
      }
    }

    setForm(updatedForm);
  }

  function calculateRequiredProfit(entryDate, exitDate, optionsTradingAmount) {
    if (!entryDate || !exitDate || !optionsTradingAmount) return "";
    const start = new Date(entryDate);
    const end = new Date(exitDate);
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const result = (optionsTradingAmount * 16 * diffDays) / (100 * 365);
    return Math.round(result);
  }

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/", label: "Journal", icon: BookOpen },
    { to: "/performance", label: "Performance", icon: BarChart3 },
    { to: "/margin-calculator", label: "Calculator", icon: Calculator },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background font-sans gradient-mesh">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center gap-2.5 text-xl font-bold text-primary">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                    <LineChart className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <span className="inline tracking-tight">Trading Journal</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center sm:gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                    }`
                  }
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-16 gap-4 animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary/20 border-t-primary"></div>
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading trades...</p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-28 sm:pb-10">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage trades={getCompleteTradesFiltered(trades)} />} />
          <Route path="/" element={
            <JournalPage
              trades={trades}
              form={form}
              handleChange={handleChange}
              addTrade={addTrade}
              startEdit={startEdit}
              cancelEdit={cancelEdit}
              submitting={submitting}
              editingId={editingId}
              saveError={saveError}
              setSaveError={setSaveError}
            />
          } />
          <Route path="/performance" element={<PerformancePage trades={getCompleteTradesFiltered(trades)} />} />
          <Route path="/margin-calculator" element={<MarginCalculatorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      {/* Bottom Tab Bar - Mobile Only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/60 safe-area-pb">
        <div className="flex justify-around items-center h-16">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[48px] px-2 text-xs font-medium transition-all duration-200 ${
                  isActive ? 'text-primary scale-105' : 'text-muted-foreground'
                }`
              }
            >
              <link.icon className="h-[22px] w-[22px] mb-0.5" strokeWidth={2} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        toastClassName="rounded-xl border border-border shadow-lg"
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
