/**
 * Calculate required profit for options trading
 * Formula: (optionsAmount * 16 * days) / (100 * 365)
 * @param {string} entryDate - Entry date in YYYY-MM-DD format
 * @param {string} exitDate - Exit date in YYYY-MM-DD format
 * @param {number} optionsTradingAmount - Amount invested in options
 * @returns {number} Required profit rounded to integer
 */
export function calculateRequiredProfit(entryDate, exitDate, optionsTradingAmount) {
  if (!entryDate || !exitDate || !optionsTradingAmount) return "";

  const start = new Date(entryDate);
  const end = new Date(exitDate);

  // Difference in days
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const result = (optionsTradingAmount * 16 * diffDays) / (100 * 365);

  return Math.round(result); // integer
}

/**
 * Calculate annualized percentage return
 * Formula: (profit * 365 * 100) / (days * amount)
 * @param {number} profit - Total profit
 * @param {string} entryDate - Entry date
 * @param {string} exitDate - Exit date
 * @param {number} amount - Trading amount
 * @returns {string} Percentage with 2 decimal places
 */
export function calculateAnnualizedPercent(profit, entryDate, exitDate, amount) {
  if (!entryDate || !exitDate || !amount || amount === 0) return "0.00";

  const start = new Date(entryDate);
  const end = new Date(exitDate);
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 0) return "0.00";

  const result = (profit * 365 * 100) / (diffDays * amount);
  return result.toFixed(2);
}

/**
 * Get complete trades (trades with all required data populated)
 * Supports both snake_case (legacy) and camelCase (backend/java)
 * @param {Array} trades - Array of trade objects
 * @returns {Array} Filtered array of complete trades
 */
export function getCompleteTrades(trades) {
  if (!trades || !Array.isArray(trades)) return [];
  
  return trades.filter(trade => {
    // Normalizing access to support both formats
    const entryDate = trade.entryDate || trade.entry_date;
    const exitDate = trade.exitDate || trade.exit_date;
    const optionsAmount = trade.optionsTradingAmount !== undefined ? trade.optionsTradingAmount : trade.options_trading_amount;
    const requiredProfit = trade.requiredProfit !== undefined ? trade.requiredProfit : trade.required_profit;
    const interest = trade.interest;
    const actualProfit = trade.actualProfit !== undefined ? trade.actualProfit : trade.actual_profit;
    const totalProfit = trade.totalProfit !== undefined ? trade.totalProfit : trade.total_profit;
    const percent = trade.percent;
    const mfAmount = trade.mfTradingAmount !== undefined ? trade.mfTradingAmount : trade.mf_trading_amount;
    const pnl = trade.pnl;
    const mfProfit = trade.mfProfit !== undefined ? trade.mfProfit : trade.mf_profit;

    const hasTradeDates = entryDate && exitDate;

    const numericValues = [
      optionsAmount,
      requiredProfit,
      interest,
      actualProfit,
      totalProfit,
      percent,
      mfAmount,
      pnl,
      mfProfit
    ];

    const allFieldsPopulated = numericValues.every(
      (value) => value !== null && value !== undefined && value !== ""
    );

    // Note: Removed the allFieldsNonZero check as a profit or PnL could validly be 0
    return hasTradeDates && allFieldsPopulated;
  });
}

/**
 * Calculate volatility (standard deviation of daily returns)
 * @param {Array} returns - Array of percentage returns
 * @returns {number} Standard deviation
 */
export function calculateVolatility(returns) {
  if (!returns || returns.length <= 1) return 0;

  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / (returns.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculate Sharpe Ratio
 * @param {number} avgReturn - Average return
 * @param {number} stdDev - Standard deviation
 * @param {number} riskFreeRate - Risk-free rate (default 7%)
 * @returns {string} Sharpe Ratio with 2 decimal places
 */
export function calculateSharpeRatio(avgReturn, stdDev, riskFreeRate = 7) {
  if (!stdDev || stdDev === 0) return "0.00";
  const result = (avgReturn - riskFreeRate) / stdDev;
  return result.toFixed(2);
}
