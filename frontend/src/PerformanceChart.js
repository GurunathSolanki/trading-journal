import { Line } from 'react-chartjs-2';
import { useState } from 'react';
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

export default function PerformanceChart({ trades }) {
  const [showAbsolute, setShowAbsolute] = useState(false);

  const getPLColor = (amount) => amount >= 0 ? 'text-green-600' : 'text-red-600';
  const getPLIcon = (amount) => amount >= 0 ? <ArrowUpIcon className="h-4 w-4 text-green-600" /> : <ArrowDownIcon className="h-4 w-4 text-red-600" />;

  let cumulativeOptions = 0;
  let cumulativeMF = 0;
  let cumulativeGrowthPct = 0;

  const cumulativeOptionsData = trades.map(t => cumulativeOptions += parseFloat(t.totalProfit || 0));
  const cumulativeMFData = trades.map(t => cumulativeMF += parseFloat(t.pnl || 0));
  const cumulativeGrowthPctData = trades.map(t => {
      const dailySum = (parseFloat(t.percent || 0) + parseFloat(t.mfProfit || 0));
      return cumulativeGrowthPct += dailySum;
  });

  const data = {
    labels: trades.map(t => {
      const date = new Date(t.exitDate);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }),
    datasets: [
      {
        label: showAbsolute ? "Options Cumulative" : "Options %",
        data: showAbsolute ? cumulativeOptionsData : trades.map(t => t.percent),
        borderColor: "hsl(18, 72%, 35%)",
        backgroundColor: "hsla(18, 72%, 35%, 0.08)",
        pointBackgroundColor: "hsl(18, 72%, 35%)",
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: showAbsolute,
        borderWidth: 2,
      },
      {
        label: showAbsolute ? "MF Cumulative" : "MF %",
        data: showAbsolute ? cumulativeMFData : trades.map(t => t.mfProfit),
        borderColor: "hsl(42, 87%, 50%)",
        backgroundColor: "hsla(42, 87%, 50%, 0.08)",
        pointBackgroundColor: "hsl(42, 87%, 50%)",
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: showAbsolute,
        borderWidth: 2,
      },
      {
        label: "Combined Growth",
        data: showAbsolute
          ? cumulativeOptionsData.map((v, i) => v + (cumulativeMFData[i] || 0))
          : cumulativeGrowthPctData,
        borderColor: "hsl(270, 60%, 55%)",
        backgroundColor: "hsla(270, 60%, 55%, 0.03)",
        pointBackgroundColor: "hsl(270, 60%, 55%)",
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.35,
        fill: false,
        borderDash: [6, 3],
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Inter, sans-serif', size: 12 },
        }
      },
      title: {
        display: true,
        text: showAbsolute ? 'Options vs Mutual Funds (Cumulative)' : 'Options vs Mutual Funds (Annualized %)',
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
          label: function (context) {
            return showAbsolute ? `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}` : `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Inter, sans-serif', size: 11 },
          maxTicksLimit: 10,
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'hsla(30, 15%, 88%, 0.5)',
        },
        ticks: {
          font: { family: 'JetBrains Mono, monospace', size: 11 },
          callback: function (value) {
            return showAbsolute ? '₹' + value.toLocaleString('en-IN') : value + '%';
          }
        }
      }
    }
  };

  const avgOptionsPercent = trades.length > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.percent || 0), 0) / trades.length).toFixed(2) : "0.00";
  const avgMFPercent = trades.length > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.mfProfit || 0), 0) / trades.length).toFixed(2) : "0.00";
  const totalGrowthPercent = (parseFloat(avgOptionsPercent) + parseFloat(avgMFPercent)).toFixed(2);

  return (
    <div className="space-y-6">
      {trades.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Options Return</CardTitle>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono-data ${getPLColor(avgOptionsPercent)}`}>
                {getPLIcon(avgOptionsPercent)}
                <span className="ml-1">{avgOptionsPercent}%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg MF Return</CardTitle>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono-data ${getPLColor(avgMFPercent)}`}>
                {getPLIcon(avgMFPercent)}
                <span className="ml-1">{avgMFPercent}%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-indigo-200/50 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Combined Growth</CardTitle>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono-data ${getPLColor(totalGrowthPercent)}`}>
                {getPLIcon(totalGrowthPercent)}
                <span className="ml-1">{totalGrowthPercent}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setShowAbsolute(!showAbsolute)}>
          {showAbsolute ? 'Show Percentages' : 'Show Absolute Values'}
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
