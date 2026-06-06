import React from "react";
import { useState, useEffect, useRef } from "react";
import { Edit, ArrowUpDown, Download, ChevronUp, ChevronDown, PlusCircle, RefreshCw, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { formatIndianNumber } from "./lib/utils";

export default function JournalPage({ trades = [], form = {}, handleChange, addTrade, startEdit, cancelEdit, submitting = false, editingId, saveError = "", setSaveError }) {
    const [sortField, setSortField] = useState('entryDate');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filter, setFilter] = useState('all');
    const [expandedCards, setExpandedCards] = useState({});

    const [displayValues, setDisplayValues] = useState({
        optionsTradingAmount: '',
        interest: '',
        actualProfit: '',
        mfTradingAmount: '',
        pnl: ''
    });

    const firstFieldRef = useRef(null);

    useEffect(() => {
        if (editingId && firstFieldRef.current) {
            const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (!isMobile) {
                firstFieldRef.current.focus();
            }
            firstFieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [editingId]);

    const handleInputChange = (field, value) => {
        const rawValue = value.replace(/,/g, '');
        if (rawValue === '' || rawValue === '-' || /^-?\d*\.?\d*$/.test(rawValue)) {
            const numValue = (rawValue === '' || rawValue === '-' || rawValue === '.' || rawValue === '-.') ? '' : parseFloat(rawValue);
            handleChange(field, numValue);

            const formatted = (rawValue === '' || rawValue === '-' || rawValue.endsWith('.'))
                ? rawValue
                : formatIndianNumber(parseFloat(rawValue));

            setDisplayValues(prev => ({
                ...prev,
                [field]: formatted
            }));
        }
    };

    useEffect(() => {
        const fieldsToFormat = ['optionsTradingAmount', 'interest', 'actualProfit', 'mfTradingAmount', 'pnl'];
        setDisplayValues(prev => {
            const newDisplayValues = {};
            fieldsToFormat.forEach(field => {
                // Don't overwrite while the user is mid-typing a negative number
                const currentDisplay = prev[field];
                if (currentDisplay === '-' || currentDisplay === '-.') {
                    newDisplayValues[field] = currentDisplay;
                    return;
                }
                const value = form[field];
                newDisplayValues[field] = value !== undefined && value !== null && value !== ''
                    ? formatIndianNumber(value)
                    : '';
            });
            return newDisplayValues;
        });
    }, [form]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`;
    };

    const sortedTrades = [...trades].sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
    }).filter(t => {
        if (filter === 'winning') return parseFloat(t.totalProfit) > 0;
        if (filter === 'losing') return parseFloat(t.totalProfit) <= 0;
        return true;
    });

    const toggleCard = (id) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isFormValid = form.entryDate;

    const exportToCSV = () => {
        if (trades.length === 0) return;
        const headers = ["Entry Date", "Exit Date", "Options Amount", "Required Profit", "Interest", "Actual Profit", "Total Profit", "Percent", "MF Amount", "PnL", "MF Profit"];
        const csvContent = [
            headers.join(","),
            ...trades.map(t => [t.entryDate, t.exitDate, t.optionsTradingAmount, t.requiredProfit, t.interest, t.actualProfit, t.totalProfit, t.percent, t.mfTradingAmount, t.pnl, t.mfProfit].join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `trading_journal_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyErrorToClipboard = () => {
        if (!saveError || !navigator.clipboard) return;
        navigator.clipboard.writeText(saveError).catch(() => {});
    };

    const ProfitBadge = ({ value, className = "" }) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            parseFloat(value) >= 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        } ${className}`}>
            {parseFloat(value) >= 0
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />
            }
            {formatIndianNumber(Math.abs(value))}
        </span>
    );

    return (
        <div className="space-y-8 animate-in">
            {/* Add/Edit Trade Form */}
            <Card className={editingId ? "ring-2 ring-primary/20 border-primary/30" : ""}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                            {editingId ? <RefreshCw className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                            <CardTitle>{editingId ? "Edit Trade" : "Add New Trade"}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {editingId ? "Update the details of your trade entry" : "Record a new trade in your journal"}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addTrade} className="space-y-6">
                        {saveError && (
                            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/20 shrink-0">
                                            <TrendingDown className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Error saving trade</p>
                                            <p className="text-destructive/80 text-xs mt-0.5">Full error details below</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button type="button" onClick={copyErrorToClipboard} className="text-xs underline underline-offset-2 hover:text-destructive/80">Copy</button>
                                        <button type="button" onClick={() => setSaveError("")} className="text-xs underline underline-offset-2 hover:text-destructive/80">Dismiss</button>
                                    </div>
                                </div>
                                <textarea readOnly value={saveError} className="w-full min-h-[150px] rounded-lg border border-destructive/30 bg-background p-3 text-xs font-mono text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-destructive/30" />
                            </div>
                        )}

                        {/* Trade Dates Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1 border-b">
                                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
                                    <RefreshCw className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Trade Dates</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="entryDate">Entry Date</Label>
                                    <Input ref={firstFieldRef} id="entryDate" type="date" value={form.entryDate || ""} onChange={(e) => handleChange("entryDate", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="exitDate">Exit Date</Label>
                                    <Input id="exitDate" type="date" value={form.exitDate || ""} onChange={(e) => handleChange("exitDate", e.target.value)} disabled={submitting} />
                                </div>
                            </div>
                        </div>

                        {/* Options Metrics Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1 border-b">
                                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30">
                                    <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Options Metrics</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="optionsTradingAmount">Options Amount (INR)</Label>
                                    <Input id="optionsTradingAmount" type="text" placeholder="Enter amount" value={displayValues.optionsTradingAmount} onChange={(e) => handleInputChange("optionsTradingAmount", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="requiredProfit">Required Profit (16% annual)</Label>
                                    <Input id="requiredProfit" type="number" value={form.requiredProfit || ""} readOnly className="bg-muted/50 border-dashed font-mono-data" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interest">Interest Earned</Label>
                                    <Input id="interest" type="text" placeholder="Interest amount" value={displayValues.interest} onChange={(e) => handleInputChange("interest", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="actualProfit">Actual P&L</Label>
                                    <Input id="actualProfit" type="text" placeholder="Profit or loss amount" value={displayValues.actualProfit} onChange={(e) => handleInputChange("actualProfit", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalProfit">Total Profit</Label>
                                    <Input id="totalProfit" type="number" value={form.totalProfit || ""} readOnly className="bg-muted/50 border-dashed font-mono-data" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="percent">Annualized Return (%)</Label>
                                    <Input id="percent" type="number" value={form.percent || ""} readOnly className="bg-muted/50 border-dashed font-mono-data" />
                                </div>
                            </div>
                        </div>

                        {/* Mutual Fund Metrics Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1 border-b">
                                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/30">
                                    <TrendingUp className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Mutual Fund Metrics</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mfTradingAmount">MF Investment Amount</Label>
                                    <Input id="mfTradingAmount" type="text" placeholder="Investment amount" value={displayValues.mfTradingAmount} onChange={(e) => handleInputChange("mfTradingAmount", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pnl">P&L Amount</Label>
                                    <Input id="pnl" type="text" placeholder="Profit or loss" value={displayValues.pnl} onChange={(e) => handleInputChange("pnl", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mfProfit">MF Annualized Return (%)</Label>
                                    <Input id="mfProfit" type="number" value={form.mfProfit || ""} readOnly className="bg-muted/50 border-dashed font-mono-data" />
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button type="submit" variant="accent" size="lg" className="sm:flex-1" disabled={!isFormValid || submitting}>
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>{editingId ? 'Update Trade' : 'Add Trade'}</>
                                )}
                            </Button>
                            {editingId && <Button type="button" variant="outline" onClick={() => cancelEdit && cancelEdit()} disabled={submitting}>Cancel Edit</Button>}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Trade History */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                                <RefreshCw className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Trade History</CardTitle>
                                <p className="text-sm text-muted-foreground mt-0.5">{trades.length} trade{trades.length !== 1 ? 's' : ''} recorded</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial">
                                <select
                                    className="w-full px-3 py-2.5 text-sm border border-input bg-background rounded-xl pr-8 appearance-none cursor-pointer hover:border-border/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                                    onChange={(e) => setFilter(e.target.value)}
                                    value={filter}
                                >
                                    <option value="all">All Trades</option>
                                    <option value="winning">Winning</option>
                                    <option value="losing">Losing</option>
                                </select>
                                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                            <div className="relative flex-1 sm:flex-initial">
                                <select
                                    className="w-full px-3 py-2.5 text-sm border border-input bg-background rounded-xl pr-8 appearance-none cursor-pointer hover:border-border/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                                    onChange={(e) => setSortField(e.target.value)}
                                    value={sortField}
                                >
                                    <option value="exitDate">Sort: Date</option>
                                    <option value="totalProfit">Sort: Profit</option>
                                    <option value="percent">Sort: % Return</option>
                                </select>
                                <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3" title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={trades.length === 0} title="Export to CSV">
                                <Download className="h-4 w-4 mr-1" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Mobile Card Layout */}
                    <div className="md:hidden space-y-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {sortedTrades.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                <RefreshCw className="h-12 w-12 text-muted-foreground/20" />
                                <p className="text-muted-foreground italic">No trades to display</p>
                            </div>
                        ) : (
                            sortedTrades.map((t) => {
                                const isExpanded = expandedCards[t.id];
                                const totalProfit = parseFloat(t.totalProfit);
                                return (
                                    <div key={t.id} className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold">{formatDate(t.entryDate)}</span>
                                                <span className="text-muted-foreground text-xs">→</span>
                                                <span className="text-sm font-semibold">{formatDate(t.exitDate)}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => startEdit(t)} disabled={submitting} className="h-8 w-8 p-0">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <ProfitBadge value={totalProfit} />
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${parseFloat(t.percent) >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                                                {t.percent}%
                                            </span>
                                        </div>
                                        <button type="button" onClick={() => toggleCard(t.id)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] w-full">
                                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                            {isExpanded ? 'Less details' : 'More details'}
                                        </button>
                                        {isExpanded && (
                                            <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t animate-in">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-muted-foreground font-medium">Options Amt</p>
                                                    <p className="font-mono-data font-medium">{formatIndianNumber(t.optionsTradingAmount)}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-muted-foreground font-medium">Req Profit</p>
                                                    <p className="font-mono-data font-medium">{formatIndianNumber(t.requiredProfit)}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-muted-foreground font-medium">Interest</p>
                                                    <p className="font-mono-data font-medium">{formatIndianNumber(t.interest)}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-muted-foreground font-medium">Actual P&L</p>
                                                    <p className="font-mono-data font-medium">{formatIndianNumber(t.actualProfit)}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-muted-foreground font-medium">MF Amount</p>
                                                    <p className="font-mono-data font-medium">{formatIndianNumber(t.mfTradingAmount)}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-muted-foreground font-medium">MF P&L</p>
                                                    <p className="font-mono-data font-medium">{formatIndianNumber(t.pnl)}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-muted-foreground font-medium">MF Return</p>
                                                    <p className="font-mono-data font-medium">{t.mfProfit}%</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">Entry</th>
                                    <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">Exit</th>
                                    <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">Options Amt</th>
                                    <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">Req Profit</th>
                                    <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">Interest</th>
                                    <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">Actual P&L</th>
                                    <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">Total P&L</th>
                                    <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">Return %</th>
                                    <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">MF Amt</th>
                                    <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">MF P&L</th>
                                    <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10">MF Return</th>
                                    <th className="text-center p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted/90 backdrop-blur z-10" style={{minWidth: '80px'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTrades.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="p-12 text-center text-muted-foreground italic">No trades yet — add your first trade to start tracking!</td>
                                    </tr>
                                ) : (
                                    sortedTrades.map((t, idx) => (
                                        <tr key={t.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                                            <td className="p-3 font-medium text-sm">{formatDate(t.entryDate)}</td>
                                            <td className="p-3 text-sm">{formatDate(t.exitDate)}</td>
                                            <td className="p-3 text-right font-mono-data text-sm">{formatIndianNumber(t.optionsTradingAmount)}</td>
                                            <td className="p-3 text-right font-mono-data text-sm text-muted-foreground">{formatIndianNumber(t.requiredProfit)}</td>
                                            <td className="p-3 text-right font-mono-data text-sm">{formatIndianNumber(t.interest)}</td>
                                            <td className="p-3 text-right font-mono-data text-sm">{formatIndianNumber(t.actualProfit)}</td>
                                            <td className="p-3 text-right">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                    parseFloat(t.totalProfit) >= 0
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                }`}>
                                                    {parseFloat(t.totalProfit) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                    {formatIndianNumber(Math.abs(t.totalProfit))}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-mono-data text-sm">{t.percent}%</td>
                                            <td className="p-3 text-right font-mono-data text-sm">{formatIndianNumber(t.mfTradingAmount)}</td>
                                            <td className="p-3 text-right font-mono-data text-sm">{formatIndianNumber(t.pnl)}</td>
                                            <td className="p-3 text-right font-mono-data text-sm">{t.mfProfit}</td>
                                            <td className="p-3 text-center">
                                                <Button variant="ghost" size="sm" onClick={() => startEdit(t)} disabled={submitting} className="h-8 px-2">
                                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <footer className="text-center py-6 text-muted-foreground">
                <p className="text-xs">© 2026 Trading Journal · Track your trades with confidence</p>
            </footer>
        </div>
    );
}
