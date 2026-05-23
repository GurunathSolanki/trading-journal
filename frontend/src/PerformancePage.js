import PerformanceChart from "./PerformanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { BarChart3 } from "lucide-react";

export default function PerformancePage({ trades }) {
  return (
    <div className="space-y-8 animate-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Performance Analysis</h1>
        <p className="text-muted-foreground">Compare Options vs Mutual Fund performance — Growth of ₹100</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Performance Comparison</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Track and compare returns across your portfolio</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PerformanceChart trades={trades} />
        </CardContent>
      </Card>
    </div>
  );
}
