import React, { useState, useEffect } from "react";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { formatIndianNumber } from "./lib/utils";

// Configurable values - can be changed based on exchange requirements
export const LOT_SIZE = 65; // Quantity per lot
export const ORDER_SIZE = 1755; // Quantity per order (1755 / 65 = 27 lots)

// Export calculation function for testing
export function calculateMarginResults(marginForOneOrder, totalMarginAvailable, totalPoints) {
  if (!marginForOneOrder || !totalMarginAvailable || !totalPoints) {
    return null;
  }

  // Step 1: Calculate number of lots
  // Formula: |ORDER_SIZE / marginForOneOrder * totalMarginAvailable| / LOT_SIZE
  const rawLots = Math.abs(ORDER_SIZE / marginForOneOrder * totalMarginAvailable) / LOT_SIZE;
  
  // Round to whole number
  const totalLots = Math.round(rawLots);

  // Calculate lots per order (ORDER_SIZE / LOT_SIZE = 27)
  const lotsPerOrder = ORDER_SIZE / LOT_SIZE;
  const fullOrders = Math.floor(totalLots / lotsPerOrder);
  
  // Remainder: use fractional part of totalLots / lotsPerOrder
  const fractionalPart = (totalLots / lotsPerOrder) - fullOrders;
  const remainingLots = Math.round(fractionalPart * lotsPerOrder);
  
  // Calculate qty for remaining lots
  const remainingQty = remainingLots * LOT_SIZE;

  // Step 2: Calculate total profit using distributed lots
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

    // For margin fields, handle Indian number formatting
    const rawValue = value.replace(/,/g, ''); // remove existing commas
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) { // allow numbers and optional decimal
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
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calculator className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Margin Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Input Parameters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="marginForOneOrder">Margin for One Order</Label>
              <Input
                id="marginForOneOrder"
                type="text"
                placeholder="e.g. 35,02,000"
                value={displayValues.marginForOneOrder}
                onChange={(e) => handleInputChange('marginForOneOrder', e.target.value)}
              />
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
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Calculation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Order Distribution</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total Lots: {formatIndianNumber(results.totalLots)}
                  </p>
                  <div className="space-y-1">
                    {Array.from({ length: results.fullOrders }, (_, i) => (
                      <p key={i} className="text-sm">
                        Order {i + 1}: {ORDER_SIZE / LOT_SIZE} lots ({ORDER_SIZE} qty)
                      </p>
                    ))}
                    {results.remainingLots > 0 && (
                      <p className="text-sm">
                        Order {results.fullOrders + 1}: {results.remainingLots} lots ({formatIndianNumber(results.remainingQty)} qty)
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Total Profit</h3>
                  <p className="text-2xl font-bold text-primary">
                    ₹{formatIndianNumber(results.totalProfit)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on {formatIndianNumber(results.totalLots)} lots × {LOT_SIZE} × {inputs.totalPoints} points
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter all parameters to see calculations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}