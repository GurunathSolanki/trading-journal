import { Line } from 'react-chartjs-2';
import { useState, useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const formatCurrency = (v) => '₹' + Math.round(v).toLocaleString('en-IN');

const getPLColor = (amount) => (amount >= 0 ? 'text-green-600' : 'text-red-600');
const getPLIcon = (amount) =>
  amount >= 0 ? <ArrowUpIcon className="h-4 w-4 text-green-600" /> : <ArrowDownIcon className="h-4 w-4 text-red-600" />;

export default function PerformanceChart({ trades }) {
  const [showAbsolute, setShowAbsolute] = useState(false);

  const sortedTrades = useMemo(
    () => [...trades].sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate)),
    [trades],
  );

  const computed = useMemo(() => {
    let optIdx = 100;
    let mfIdx = 100;
    let cumOpt = 0;
    let cumMf = 0;
    let sumOptAnn = 0;
    let sumMfAnn = 0;
    let optCount = 0;
    let mfCount = 0;
    const oGrowth = [];
    const mGrowth = [];
    const oCum = [];
    const mCum = [];
    const labs = [];

    for (const t of sortedTrades) {
      const date = new Date(t.exitDate);
      labs.push(date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }));

      const optAmt = parseFloat(t.optionsTradingAmount) || 0;
      const mfAmt = parseFloat(t.mfTradingAmount) || 0;
      const optProfit = parseFloat(t.totalProfit) || 0;
      const mfPnl = parseFloat(t.pnl) || 0;

      const optActualPct = optAmt > 0 ? (optProfit / optAmt) * 100 : 0;
      const mfActualPct = mfAmt > 0 ? (mfPnl / mfAmt) * 100 : 0;

      optIdx *= 1 + optActualPct / 100;
      mfIdx *= 1 + mfActualPct / 100;
      cumOpt += optProfit;
      cumMf += mfPnl;

      const optAnn = parseFloat(t.percent || 0);
      const mfAnn = parseFloat(t.mfProfit || 0);
      if (optAnn !== 0) { sumOptAnn += optAnn; optCount++; }
      if (mfAnn !== 0) { sumMfAnn += mfAnn; mfCount++; }

      oGrowth.push(Math.round(optIdx * 100) / 100);
      mGrowth.push(Math.round(mfIdx * 100) / 100);
      oCum.push(cumOpt);
      mCum.push(cumMf);
    }

    const lastOptGrowth = oGrowth.length > 0 ? oGrowth[oGrowth.length - 1] : 100;
    const lastMfGrowth = mGrowth.length > 0 ? mGrowth[mGrowth.length - 1] : 100;

    return {
      labels: labs,
      optionsGrowth: oGrowth,
      mfGrowth: mGrowth,
      optionsCum: oCum,
      mfCum: mCum,
      optionsReturnPct: (lastOptGrowth / 100 - 1) * 100,
      mfReturnPct: (lastMfGrowth / 100 - 1) * 100,
      optionsTotalPnl: oCum.length > 0 ? oCum[oCum.length - 1] : 0,
      mfTotalPnl: mCum.length > 0 ? mCum[mCum.length - 1] : 0,
      avgOptAnn: optCount > 0 ? sumOptAnn / optCount : 0,
      avgMfAnn: mfCount > 0 ? sumMfAnn / mfCount : 0,
    };
  }, [sortedTrades]);

  const data = {
    labels: computed.labels,
    datasets: [
      {
        label: showAbsolute ? 'Options P&L' : 'Options (Growth of ₹100)',
        data: showAbsolute ? computed.optionsCum : computed.optionsGrowth,
        borderColor: 'hsl(18, 72%, 35%)',
        backgroundColor: 'hsla(18, 72%, 35%, 0.06)',
        pointBackgroundColor: 'hsl(18, 72%, 35%)',
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false,
        borderWidth: 2.5,
      },
      {
        label: showAbsolute ? 'MF P&L' : 'MF (Growth of ₹100)',
        data: showAbsolute ? computed.mfCum : computed.mfGrowth,
        borderColor: 'hsl(42, 87%, 50%)',
        backgroundColor: 'hsla(42, 87%, 50%, 0.06)',
        pointBackgroundColor: 'hsl(42, 87%, 50%)',
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false,
        borderWidth: 2.5,
      },
    ],
  };

  const isGrowthMode = !showAbsolute;
  const winner = computed.avgOptAnn > computed.avgMfAnn ? 'Options' : computed.avgMfAnn > computed.avgOptAnn ? 'MF' : 'Tied';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 20, font: { family: 'Inter, sans-serif', size: 12 } },
      },
      title: {
        display: true,
        text: isGrowthMode
          ? 'Options vs Mutual Funds — Growth of ₹100'
          : 'Options vs Mutual Funds — Cumulative P&L',
        font: { family: 'Inter, sans-serif', size: 14, weight: '600' },
        padding: { bottom: 20 },
        color: 'hsl(24, 10%, 10%)',
      },
      tooltip: {
        backgroundColor: 'hsla(220, 20%, 6%, 0.9)',
        titleFont: { family: 'Inter, sans-serif', size: 12 },
        bodyFont: { family: 'JetBrains Mono, monospace', size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label(context) {
            const val = context.parsed.y;
            if (isGrowthMode) {
              return `${context.dataset.label}: ₹${val.toFixed(2)}`;
            }
            return `${context.dataset.label}: ${formatCurrency(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter, sans-serif', size: 11 }, maxTicksLimit: 12 },
      },
      y: {
        beginAtZero: false,
        grid: { color: 'hsla(30, 15%, 88%, 0.5)' },
        ticks: {
          font: { family: 'JetBrains Mono, monospace', size: 11 },
          callback(value) {
            if (isGrowthMode) return '₹' + value.toFixed(1);
            return formatCurrency(value);
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {trades.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Options Annualized</CardTitle>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono-data ${getPLColor(computed.avgOptAnn)}`}>
                {getPLIcon(computed.avgOptAnn)}
                <span className="ml-1">{computed.avgOptAnn.toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg MF Annualized</CardTitle>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono-data ${getPLColor(computed.avgMfAnn)}`}>
                {getPLIcon(computed.avgMfAnn)}
                <span className="ml-1">{computed.avgMfAnn.toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200/50 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20 dark:to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leader</CardTitle>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{winner}</span>
                <span className={`text-sm font-medium ${getPLColor(computed.avgOptAnn - computed.avgMfAnn)}`}>
                  {` ${Math.abs(computed.avgOptAnn - computed.avgMfAnn).toFixed(2)}% ahead`}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setShowAbsolute(!showAbsolute)}>
          {showAbsolute ? 'Growth of ₹100' : 'Absolute P&L'}
        </Button>
      </div>

      {trades.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="min-h-[300px] sm:min-h-[400px] md:min-h-[450px] w-full">
              <Line data={data} options={options} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <TrendingUp className="h-12 w-12 text-muted-foreground/20" />
          <p className="text-muted-foreground">Add trades to see your performance chart</p>
        </div>
      )}
    </div>
  );
}
