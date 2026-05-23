import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  PieChart,
  Sparkles,
  RefreshCw
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

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'all', label: 'All Time' },
  ];

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
          <Sparkles className="h-10 w-10 text-primary/60" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Welcome to Your Dashboard</h2>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            Your trading performance metrics will appear here once you start adding trades to your journal.
          </p>
        </div>
        <Button asChild variant="accent" size="lg">
          <Link to="/">
            <BarChart3 className="h-4 w-4 mr-2" />
            Add Your First Trade
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
        <p className="text-muted-foreground">Professional overview of your trading performance</p>
      </div>

      {/* Time Period + Trade Count */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="inline-flex rounded-xl border bg-card p-1 shadow-sm">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={timePeriod === period.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimePeriod(period.value)}
              className="capitalize"
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground -mt-4">
        {totalTrades} trade{totalTrades !== 1 ? 's' : ''} · {
          timePeriod === 'all' ? 'All time' :
          timePeriod === 'daily' ? 'Last 24 hours' :
          timePeriod === 'weekly' ? 'Last 7 days' : 'Last 30 days'
        }
      </p>

      {/* Total Portfolio P&L - Hero KPI */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-accent/[0.03]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/[0.06] to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="text-center pb-3 relative">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Portfolio P&L</CardTitle>
        </CardHeader>
        <CardContent className="text-center relative pb-8">
          <div className={`text-5xl font-bold tracking-tight ${totalPortfolioPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center justify-center gap-3`}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${totalPortfolioPL >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {totalPortfolioPL >= 0
                ? <TrendingUp className="h-6 w-6" />
                : <TrendingDown className="h-6 w-6" />
              }
            </div>
            <span className="font-mono-data">{formatCurrency(totalPortfolioPL)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Combined Options + Mutual Funds</p>
        </CardContent>
      </Card>

      {/* Options & MF Breakdown */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-l-[3px] border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Options P&L</CardTitle>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono-data ${totalOptionsPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center gap-2`}>
              {totalOptionsPL >= 0 ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
              {formatCurrency(totalOptionsPL)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-[3px] border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mutual Funds P&L</CardTitle>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono-data ${totalMFPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center gap-2`}>
              {totalMFPL >= 0 ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
              {formatCurrency(totalMFPL)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono-data text-green-600 dark:text-green-400">{winRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{winningTrades.length} winning of {totalTrades}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
              <Award className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono-data text-amber-600 dark:text-amber-400">{profitFactor}</div>
            <p className="text-xs text-muted-foreground mt-1">Gross profit / loss ratio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Risk/Reward</CardTitle>
              <PieChart className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono-data text-indigo-600 dark:text-indigo-400">{riskRewardRatio}:1</div>
            <p className="text-xs text-muted-foreground mt-1">Avg win vs avg loss</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              <Activity className="h-4 w-4 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono-data text-cyan-600 dark:text-cyan-400">{sharpeRatio}</div>
            <p className="text-xs text-muted-foreground mt-1">Risk-adjusted return</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Volatility</CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono-data text-orange-600 dark:text-orange-400">{stdDev}%</div>
            <p className="text-xs text-muted-foreground mt-1">Standard deviation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <RefreshCw className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono-data">{totalTrades}</div>
            <p className="text-xs text-muted-foreground mt-1">Closed positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg Win</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono-data text-green-600 dark:text-green-400">{formatCurrency(avgWin)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per winning trade</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono-data text-red-600 dark:text-red-400">{formatCurrency(avgLoss)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per losing trade</p>
          </CardContent>
        </Card>
      </div>

      {/* Best & Worst Trades */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden border-green-200/50 dark:border-green-900/50 bg-gradient-to-br from-green-50/80 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
          <div className="flex items-start gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 shrink-0">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Best Trade</p>
              <p className="text-3xl font-bold font-mono-data text-green-700 dark:text-green-300">
                {formatCurrency(bestTrade)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="relative overflow-hidden border-red-200/50 dark:border-red-900/50 bg-gradient-to-br from-red-50/80 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20">
          <div className="flex items-start gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 shrink-0">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Worst Trade</p>
              <p className="text-3xl font-bold font-mono-data text-red-700 dark:text-red-300">
                {formatCurrency(worstTrade)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="flex justify-center gap-3 pt-2">
        <Button variant="outline" asChild>
          <Link to="/">
            <BarChart3 className="h-4 w-4 mr-2" />
            Go to Journal
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/performance">
            <Activity className="h-4 w-4 mr-2" />
            View Performance
          </Link>
        </Button>
      </div>
    </div>
  );
}
