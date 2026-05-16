import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JournalPage from "./JournalPage";
import PerformancePage from "./PerformancePage";
import DashboardPage from "./DashboardPage";
import MarginCalculatorPage from "./MarginCalculatorPage";
import SettingsPage from "./SettingsPage";
import { ToastContainer, toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import { Sun, Moon, LineChart } from "lucide-react";
import { getCompleteTrades } from "./lib/tradingUtils";
import "./App.css";

// API Base URL
const API_BASE_URL = "http://localhost:8080/api";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    // Map backend snake_case or camelCase correctly if needed
    // The backend uses camelCase for the entity fields (entryDate, etc.)
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

    // Auto-calc requiredProfit if possible
    if (updatedForm.entryDate && updatedForm.exitDate && updatedForm.optionsTradingAmount) {
      updatedForm.requiredProfit = calculateRequiredProfit(
        updatedForm.entryDate,
        updatedForm.exitDate,
        Number(updatedForm.optionsTradingAmount)
      );
    }

    // Auto-calc totalProfit (interest + actualProfit)
    const interestVal = Number(updatedForm.interest) || 0;
    const actualProfitVal = Number(updatedForm.actualProfit) || 0;
    updatedForm.totalProfit = interestVal + actualProfitVal;

    // Auto-calc percent (to 2 decimals)
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

    // Auto-calc mfProfit (to 2 decimals)
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

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  <LineChart className="h-8 w-8" />
                  <span>Trading Journal</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink to="/dashboard" className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>Dashboard</NavLink>
              <NavLink to="/" className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>Journal</NavLink>
              <NavLink to="/performance" className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>Performance</NavLink>
              <NavLink to="/margin-calculator" className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>Margin Calculator</NavLink>
              <NavLink to="/settings" className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>Settings</NavLink>
            </div>
            <div className="flex items-center space-x-2">
              <button type="button" onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="sm:hidden">
                <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-b border-border shadow-sm">
          <NavLink to="/dashboard" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
          <NavLink to="/" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} onClick={() => setMobileMenuOpen(false)}>Journal</NavLink>
          <NavLink to="/performance" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} onClick={() => setMobileMenuOpen(false)}>Performance</NavLink>
          <NavLink to="/margin-calculator" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} onClick={() => setMobileMenuOpen(false)}>Margin Calculator</NavLink>
          <NavLink to="/settings" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} onClick={() => setMobileMenuOpen(false)}>Settings</NavLink>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

      <ToastContainer position="top-right" autoClose={3000} />
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
