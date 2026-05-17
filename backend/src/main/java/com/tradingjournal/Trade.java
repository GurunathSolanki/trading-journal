package com.tradingjournal;

import java.time.LocalDate;

public class Trade {
    public Long id;
    public LocalDate entryDate;
    public LocalDate exitDate;
    public Long optionsTradingAmount;
    public Long requiredProfit;
    public Long interest;
    public Long actualProfit;
    public Long totalProfit;
    public Float percent;
    public Long mfTradingAmount;
    public Long pnl;
    public Float mfProfit;
}
