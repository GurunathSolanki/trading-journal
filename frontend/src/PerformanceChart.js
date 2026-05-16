import { Line } from 'react-chartjs-2';
import { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
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
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
        label: showAbsolute ? "Options Cumulative Profit" : "Options %",
        data: showAbsolute ? cumulativeOptionsData : trades.map(t => t.percent),
        borderColor: "hsl(15 100% 23%)",
        backgroundColor: "rgba(117, 31, 0, 0.1)",
        pointBackgroundColor: "hsl(15 100% 23%)",
        tension: 0.3,
        fill: showAbsolute,
      },
      {
        label: showAbsolute ? "MF Cumulative PnL" : "MF %",
        data: showAbsolute ? cumulativeMFData : trades.map(t => t.mfProfit),
        borderColor: "hsl(45 93% 47%)",
        backgroundColor: "rgba(232, 174, 8, 0.1)",
        pointBackgroundColor: "hsl(45 93% 47%)",
        tension: 0.3,
        fill: showAbsolute,
      },
      {
        label: "Cumulative Growth Trend",
        data: showAbsolute
          ? cumulativeOptionsData.map((v, i) => v + (cumulativeMFData[i] || 0))
          : cumulativeGrowthPctData,
        borderColor: "#6d28d9",
        backgroundColor: "rgba(109, 40, 217, 0.05)",
        pointBackgroundColor: "#6d28d9",
        tension: 0.3,
        fill: false,
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: showAbsolute ? 'Options vs Mutual Fund Performance (Absolute)' : 'Options vs Mutual Fund Performance (%)' },
      tooltip: {
        callbacks: {
          label: function (context) {
            return showAbsolute ? `${context.dataset.label}: ₹${context.parsed.y}` : `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value) {
            return showAbsolute ? '₹' + value : value + '%';
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg Options %</CardTitle>{getPLIcon(avgOptionsPercent)}</CardHeader>
          <CardContent><div className={`text-2xl font-bold ${getPLColor(avgOptionsPercent)}`}>{avgOptionsPercent}%</div></CardContent>
        </Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg MF %</CardTitle>{getPLIcon(avgMFPercent)}</CardHeader>
          <CardContent><div className={`text-2xl font-bold ${getPLColor(avgMFPercent)}`}>{avgMFPercent}%</div></CardContent>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/10"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Combined Growth %</CardTitle>{getPLIcon(totalGrowthPercent)}</CardHeader>
          <CardContent><div className={`text-2xl font-bold ${getPLColor(totalGrowthPercent)}`}>{totalGrowthPercent}%</div></CardContent>
        </Card>
      </div>
      <div className="flex justify-center"><Button variant="outline" onClick={() => setShowAbsolute(!showAbsolute)}>Toggle to {showAbsolute ? 'Percentage' : 'Absolute Values'}</Button></div>
      <Card><CardContent className="pt-6"><div className="min-h-[300px] sm:min-h-[400px] md:min-h-[500px] w-full">
            <Line data={data} options={{...options, maintainAspectRatio: false, responsive: true}} />
      </div></CardContent></Card>
    </div>
  );
}
