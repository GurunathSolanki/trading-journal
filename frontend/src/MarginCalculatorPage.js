import React, { useState, useEffect } from "react";
import { Calculator, DollarSign, TrendingUp, PieChart, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { formatIndianNumber } from "./lib/utils";

export const LOT_SIZE = 65;
export const ORDER_SIZE = 1755;

export function calculateMarginResults(marginForOneOrder, totalMarginAvailable, totalPoints) {
  if (!marginForOneOrder || !totalMarginAvailable || !totalPoints) {
    return null;
  }

  const rawLots = Math.abs(ORDER_SIZE / marginForOneOrder * totalMarginAvailable) / LOT_SIZE;

  const totalLots = Math.round(rawLots);

  const lotsPerOrder = ORDER_SIZE / LOT_SIZE;
  const fullOrders = Math.floor(totalLots / lotsPerOrder);

  const fractionalPart = (totalLots / lotsPerOrder) - fullOrders;
  const remainingLots = Math.round(fractionalPart * lotsPerOrder);

  const remainingQty = remainingLots * LOT_SIZE;

  const distributedLots = (fullOrders * lotsPerOrder) + remainingLots;
  const totalProfit = distributedLots * LOT_SIZE * totalPoints;

  return {
    totalLots,
    fullOrders,
    remainingLots,
    remainingQty,
    totalProfit: totalProfit.toFixed(2)
  };
}

export default function MarginCalculatorPage() {
  const [inputs, setInputs] = useState({
    marginForOneOrder: '',
    totalMarginAvailable: '',
    totalPoints: ''
  });

  const [displayValues, setDisplayValues] = useState({
    marginForOneOrder: '',
    totalMarginAvailable: ''
  });

  const [results, setResults] = useState(null);

  const handleInputChange = (field, value) => {
    if (field === 'totalPoints') {
      setInputs(prev => ({
        ...prev,
        [field]: value
      }));
      return;
    }

    const rawValue = value.replace(/,/g, '');
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      const numValue = rawValue === '' ? '' : parseFloat(rawValue);
      setInputs(prev => ({
        ...prev,
        [field]: numValue
      }));
      const formatted = rawValue === '' ? '' : formatIndianNumber(numValue);
      setDisplayValues(prev => ({
        ...prev,
        [field]: formatted
      }));
    }
  };

  useEffect(() => {
    const marginForOneOrder = parseFloat(inputs.marginForOneOrder);
    const totalMarginAvailable = parseFloat(inputs.totalMarginAvailable);
    const totalPoints = parseFloat(inputs.totalPoints);

    const results = calculateMarginResults(marginForOneOrder, totalMarginAvailable, totalPoints);
    setResults(results);
  }, [inputs]);

  return (
    <div className="space-y-8 animate-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Margin Calculator</h1>
        <p className="text-muted-foreground">Calculate order distribution and profit based on available margin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Input Parameters</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Enter your margin details to calculate</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="marginForOneOrder">Margin for One Order</Label>
              <Input
                id="marginForOneOrder"
                type="text"
                placeholder="e.g. 35,02,000"
                value={displayValues.marginForOneOrder}
                onChange={(e) => handleInputChange('marginForOneOrder', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter the margin required per order</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalMarginAvailable">Total Margin Available</Label>
              <Input
                id="totalMarginAvailable"
                type="text"
                placeholder="e.g. 1,20,36,000"
                value={displayValues.totalMarginAvailable}
                onChange={(e) => handleInputChange('totalMarginAvailable', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter your total available margin</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPoints">Total Points</Label>
              <Input
                id="totalPoints"
                type="number"
                placeholder="e.g. 6"
                value={inputs.totalPoints}
                onChange={(e) => handleInputChange('totalPoints', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter the expected points per lot</p>
            </div>

            <Button
              className="w-full"
              variant="accent"
              onClick={() => {
                setInputs({ marginForOneOrder: '3502000', totalMarginAvailable: '12036000', totalPoints: '6' });
                setDisplayValues({ marginForOneOrder: '35,02,000', totalMarginAvailable: '1,20,36,000' });
              }}
            >
              <Layers className="h-4 w-4 mr-2" />
              Try Example Values
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Calculation Results</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Your order distribution and total profit</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                {/* Order Distribution */}
                <div className="rounded-xl bg-muted/50 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Order Distribution</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono-data">{formatIndianNumber(results.totalLots)}</span>
                    <span className="text-sm text-muted-foreground">total lots</span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: results.fullOrders }, (_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-background/80 text-sm">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                          {i + 1}
                        </div>
                        <span className="font-medium">Order {i + 1}</span>
                        <span className="ml-auto font-mono-data text-muted-foreground">
                          {ORDER_SIZE / LOT_SIZE} lots · {formatIndianNumber(ORDER_SIZE)} qty
                        </span>
                      </div>
                    ))}
                    {results.remainingLots > 0 && (
                      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-background/80 text-sm border border-dashed border-border">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 text-accent font-semibold text-xs">
                          {results.fullOrders + 1}
                        </div>
                        <span className="font-medium">Order {results.fullOrders + 1} (partial)</span>
                        <span className="ml-auto font-mono-data text-muted-foreground">
                          {results.remainingLots} lots · {formatIndianNumber(results.remainingQty)} qty
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Profit */}
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">Total Profit</h3>
                  </div>
                  <p className="text-3xl font-bold font-mono-data text-primary">
                    ₹{formatIndianNumber(results.totalProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatIndianNumber(results.totalLots)} lots × {LOT_SIZE} × {inputs.totalPoints} points
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <Calculator className="h-14 w-14 text-muted-foreground/20" />
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">No results yet</p>
                  <p className="text-sm text-muted-foreground/70">Enter all parameters to see margin calculations</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
