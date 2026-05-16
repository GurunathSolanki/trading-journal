import PerformanceChart from "./PerformanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

export default function PerformancePage({ trades }) {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart trades={trades} />
        </CardContent>
      </Card>
    </div>
  );
}