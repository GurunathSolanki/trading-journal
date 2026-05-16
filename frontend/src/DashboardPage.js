import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Activity,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { formatIndianNumber } from "./lib/utils";
import { calculateVolatility, calculateSharpeRatio } from "./lib/tradingUtils";

export default function DashboardPage({ trades = [] }) {
  const [timePeriod, setTimePeriod] = useState('all');

  const getFilteredTrades = () => {
    if (timePeriod === 'all') return trades;
    const now = new Date();
    const filterDate = new Date();
    switch (timePeriod) {
      case 'daily': filterDate.setDate(now.getDate() - 1); break;
      case 'weekly': filterDate.setDate(now.getDate() - 7); break;
      case 'monthly': filterDate.setDate(now.getDate() - 30); break;
      default: return trades;
    }
    return trades.filter(trade => {
      const exitDate = trade.exitDate || trade.exit_date;
      if (!exitDate) return false;
      const tradeDate = new Date(exitDate);
      return tradeDate >= filterDate;
    });
  };

  const filteredTrades = getFilteredTrades();
  const totalTrades = filteredTrades.length;

  const totalOptionsPL = filteredTrades.reduce((sum, t) => sum + parseFloat(t.totalProfit || t.total_profit || 0), 0);
  const totalMFPL = filteredTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  const totalPortfolioPL = totalOptionsPL + totalMFPL;

  const winningTrades = filteredTrades.filter(t => parseFloat(t.totalProfit || t.total_profit || 0) > 0);
  const losingTrades = filteredTrades.filter(t => parseFloat(t.totalProfit || t.total_profit || 0) <= 0);
  const winRate = totalTrades > 0 ? ((winningTrades.length / totalTrades) * 100).toFixed(1) : 0;

  const grossProfit = winningTrades.reduce((sum, t) => sum + parseFloat(t.totalProfit || t.total_profit || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.totalProfit || t.total_profit || 0), 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : 0;

  const avgWin = winningTrades.length > 0 ? (grossProfit / winningTrades.length).toFixed(0) : 0;
  const avgLoss = losingTrades.length > 0 ? (grossLoss / losingTrades.length).toFixed(0) : 0;
  const riskRewardRatio = avgLoss > 0 ? (parseFloat(avgWin) / parseFloat(avgLoss)).toFixed(2) : 0;

  const bestTrade = totalTrades > 0 ? Math.max(...filteredTrades.map(t => parseFloat(t.totalProfit || t.total_profit || 0))) : 0;
  const worstTrade = totalTrades > 0 ? Math.min(...filteredTrades.map(t => parseFloat(t.totalProfit || t.total_profit || 0))) : 0;

  const allPercents = filteredTrades.map(t => (parseFloat(t.percent || 0) + parseFloat(t.mfProfit || t.mf_profit || 0)));
  const avgPercent = allPercents.length > 0 ? allPercents.reduce((a, b) => a + b, 0) / allPercents.length : 0;
  const stdDev = calculateVolatility(allPercents).toFixed(2);
  const sharpeRatio = calculateSharpeRatio(avgPercent, parseFloat(stdDev));

  const formatCurrency = (amount) => `₹${formatIndianNumber(amount)}`;
  const getPLColor = (amount) => amount >= 0 ? 'text-green-600' : 'text-red-600';
  const getPLIcon = (amount) => amount >= 0 ? <ArrowUpIcon className="h-4 w-4 text-green-600" /> : <ArrowDownIcon className="h-4 w-4 text-red-600" />;

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center animate-in fade-in-0 duration-500">
        <Activity className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-semibold tracking-tight">No trades tracked yet</h2>
        <p className="text-muted-foreground max-w-md">Your dashboard will come alive once you start adding trades to your journal.</p>
        <Button asChild className="mt-4"><Link to="/">Add Your First Trade</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
        <p className="text-muted-foreground mt-2">Professional trading performance overview</p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border bg-card p-1">
          {['daily', 'weekly', 'monthly', 'all'].map((period) => (
            <Button key={period} variant={timePeriod === period ? "default" : "ghost"} size="sm" onClick={() => setTimePeriod(period)} className="capitalize">{period === 'all' ? 'All Time' : period}</Button>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Showing {totalTrades} trade{totalTrades !== 1 ? 's' : ''} {timePeriod === 'all' ? 'from all time' : `from the last ${timePeriod === 'daily' ? '24 hours' : timePeriod === 'weekly' ? '7 days' : '30 days'}`}
      </div>

      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700">
        <CardHeader className="text-center pb-4"><CardTitle className="text-lg font-medium text-muted-foreground">Total Portfolio P&L</CardTitle></CardHeader>
        <CardContent className="text-center">
          <div className={`text-4xl font-bold ${getPLColor(totalPortfolioPL)} flex items-center justify-center gap-2`}>{getPLIcon(totalPortfolioPL)}{formatCurrency(totalPortfolioPL)}</div>
          <p className="text-sm text-muted-foreground mt-2">Combined Options + Mutual Funds performance</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Options P&L</CardTitle><BarChart3 className="h-4 w-4 text-blue-600" /></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${getPLColor(totalOptionsPL)} flex items-center gap-2`}>{getPLIcon(totalOptionsPL)}{formatCurrency(totalOptionsPL)}</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total MF P&L</CardTitle><Activity className="h-4 w-4 text-purple-600" /></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${getPLColor(totalMFPL)} flex items-center gap-2`}>{getPLIcon(totalMFPL)}{formatCurrency(totalMFPL)}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Win Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{winRate}%</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Profit Factor</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{profitFactor}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Risk/Reward</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{riskRewardRatio}:1</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg Win</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(avgWin)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg Loss</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(avgLoss)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-indigo-600">{sharpeRatio}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Volatility (StdDev)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{stdDev}%</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Trades</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalTrades}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Best Trade</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(bestTrade)}</div></CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Worst Trade</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(worstTrade)}</div></CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        <Button asChild><Link to="/">Go to Journal</Link></Button>
        <Button variant="outline" asChild><Link to="/performance">View Performance</Link></Button>
      </div>
    </div>
  );
}
