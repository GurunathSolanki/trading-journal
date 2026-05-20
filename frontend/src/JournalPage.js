import React from "react";
import { useState, useEffect, useRef } from "react";
import { Edit, ArrowUpDown, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { formatIndianNumber } from "./lib/utils";

export default function JournalPage({ trades = [], form = {}, handleChange, addTrade, startEdit, cancelEdit, submitting = false, editingId, saveError = "", setSaveError }) {
    const [sortField, setSortField] = useState('entryDate');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filter, setFilter] = useState('all'); // 'all', 'winning', 'losing'
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
        const newDisplayValues = {};
        fieldsToFormat.forEach(field => {
            const value = form[field];
            newDisplayValues[field] = value !== undefined && value !== null && value !== ''
                ? formatIndianNumber(value)
                : '';
        });
        setDisplayValues(newDisplayValues);
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

    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500">
            <Card>
                <CardHeader><CardTitle>{editingId ? "Edit Trade" : "Add New Trade"}</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={addTrade} className="space-y-6">
                        {saveError && (
                            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div className="font-semibold">Save error - Full details below</div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={copyErrorToClipboard} className="text-xs underline underline-offset-2">Copy error</button>
                                        <button type="button" onClick={() => setSaveError("")} className="text-xs underline underline-offset-2">Dismiss</button>
                                    </div>
                                </div>
                                <textarea readOnly value={saveError} className="w-full min-h-[200px] rounded-md border border-destructive/50 bg-background p-2 text-xs font-mono text-foreground resize-y" />
                            </div>
                        )}
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold">Trade Dates</legend>
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
                        </fieldset>

                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold">Options Metrics</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="optionsTradingAmount">Options Amount</Label>
                                    <Input id="optionsTradingAmount" type="text" placeholder="Enter amount in INR" value={displayValues.optionsTradingAmount} onChange={(e) => handleInputChange("optionsTradingAmount", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="requiredProfit">Required Profit</Label>
                                    <Input id="requiredProfit" type="number" value={form.requiredProfit || ""} readOnly className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interest">Interest</Label>
                                    <Input id="interest" type="text" placeholder="Interest earned" value={displayValues.interest} onChange={(e) => handleInputChange("interest", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="actualProfit">Actual Profit</Label>
                                    <Input id="actualProfit" type="text" placeholder="Actual profit/loss" value={displayValues.actualProfit} onChange={(e) => handleInputChange("actualProfit", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalProfit">Total Profit</Label>
                                    <Input id="totalProfit" type="number" value={form.totalProfit || ""} readOnly className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="percent">Percent</Label>
                                    <Input id="percent" type="number" value={form.percent || ""} readOnly className="bg-muted" />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold">Mutual Fund Metrics</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mfTradingAmount">MF Trading Amount</Label>
                                    <Input id="mfTradingAmount" type="text" placeholder="MF investment amount" value={displayValues.mfTradingAmount} onChange={(e) => handleInputChange("mfTradingAmount", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pnl">PnL</Label>
                                    <Input id="pnl" type="text" placeholder="Profit/Loss" value={displayValues.pnl} onChange={(e) => handleInputChange("pnl", e.target.value)} disabled={submitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mfProfit">MF Profit Percent</Label>
                                    <Input id="mfProfit" type="number" value={form.mfProfit || ""} readOnly className="bg-muted" />
                                </div>
                            </div>
                        </fieldset>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Button type="submit" className="sm:col-span-2" disabled={!isFormValid || submitting}>
                                {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" /> : (editingId ? 'Update Trade' : 'Add Trade')}
                            </Button>
                            {editingId && <Button type="button" variant="secondary" onClick={() => cancelEdit && cancelEdit()} disabled={submitting}>Cancel</Button>}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Trade History</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <select className="px-3 py-2 text-base md:text-sm border border-input bg-background rounded-md h-11" onChange={(e) => setFilter(e.target.value)} value={filter}>
                                <option value="all">All Trades</option>
                                <option value="winning">Winning Only</option>
                                <option value="losing">Losing Only</option>
                            </select>
                            <select className="px-3 py-2 text-base md:text-sm border border-input bg-background rounded-md h-11" onChange={(e) => setSortField(e.target.value)} value={sortField}>
                                <option value="exitDate">Sort by Date</option>
                                <option value="totalProfit">Sort by Profit</option>
                                <option value="percent">Sort by %</option>
                            </select>
                            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}><ArrowUpDown className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={trades.length === 0} title="Export to CSV"><Download className="h-4 w-4 mr-1" />Export</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Mobile Card Layout */}
                    <div className="md:hidden space-y-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {sortedTrades.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic">No trades yet — add your first trade to start tracking!</div>
                        ) : (
                            sortedTrades.map((t) => {
                                const isExpanded = expandedCards[t.id];
                                return (
                                    <div key={t.id} className="border rounded-lg p-3 bg-card space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{formatDate(t.entryDate)}</span>
                                                <span className="text-muted-foreground text-sm">→</span>
                                                <span className="text-sm font-medium">{formatDate(t.exitDate)}</span>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => startEdit(t)} disabled={submitting}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${parseFloat(t.totalProfit) >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                {formatIndianNumber(t.totalProfit)}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${parseFloat(t.percent) >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                {t.percent}%
                                            </span>
                                        </div>
                                        <button type="button" onClick={() => toggleCard(t.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                            {isExpanded ? 'Show less' : 'Show more'}
                                        </button>
                                        {isExpanded && (
                                            <div className="grid grid-cols-2 gap-2 text-sm pt-1 border-t">
                                                <div><span className="text-muted-foreground">Options:</span> {formatIndianNumber(t.optionsTradingAmount)}</div>
                                                <div><span className="text-muted-foreground">Req Profit:</span> {formatIndianNumber(t.requiredProfit)}</div>
                                                <div><span className="text-muted-foreground">Interest:</span> {formatIndianNumber(t.interest)}</div>
                                                <div><span className="text-muted-foreground">Actual:</span> {formatIndianNumber(t.actualProfit)}</div>
                                                <div><span className="text-muted-foreground">MF Amount:</span> {formatIndianNumber(t.mfTradingAmount)}</div>
                                                <div><span className="text-muted-foreground">PnL:</span> {formatIndianNumber(t.pnl)}</div>
                                                <div><span className="text-muted-foreground">MF Profit:</span> {t.mfProfit}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden md:block overflow-x-auto" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Entry Date</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Exit Date</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Options Amount</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Required Profit</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Interest</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Actual Profit</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Total Profit</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Percent</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">MF Amount</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">PnL</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">MF Profit</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTrades.length === 0 ? (
                                    <tr><td colSpan="12" className="p-12 text-center text-muted-foreground italic">No trades yet — add your first trade to start tracking!</td></tr>
                                ) : (
                                    sortedTrades.map((t) => (
                                        <tr key={t.id} className="border-b hover:bg-muted/50 transition-colors duration-150">
                                            <td className="p-2">{formatDate(t.entryDate)}</td>
                                            <td className="p-2">{formatDate(t.exitDate)}</td>
                                            <td className="p-2">{formatIndianNumber(t.optionsTradingAmount)}</td>
                                            <td className="p-2">{formatIndianNumber(t.requiredProfit)}</td>
                                            <td className="p-2">{formatIndianNumber(t.interest)}</td>
                                            <td className="p-2">{formatIndianNumber(t.actualProfit)}</td>
                                            <td className="p-2"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${parseFloat(t.totalProfit) >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{formatIndianNumber(t.totalProfit)}</span></td>
                                            <td className="p-2"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${parseFloat(t.percent) >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{t.percent}%</span></td>
                                            <td className="p-2">{formatIndianNumber(t.mfTradingAmount)}</td>
                                            <td className="p-2"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${t.pnl >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{formatIndianNumber(t.pnl)}</span></td>
                                            <td className="p-2"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${t.mfProfit >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{t.mfProfit}</span></td>
                                            <td className="p-2"><Button variant="outline" size="sm" onClick={() => startEdit(t)} disabled={submitting}><Edit className="h-4 w-4 mr-1" />Edit</Button></td>
                                        </tr>
                                    )))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <footer className="text-center py-8 text-muted-foreground"><p className="text-sm">© 2026 Trading Log App</p></footer>
        </div>
    );
}
