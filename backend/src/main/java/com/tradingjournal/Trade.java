package com.tradingjournal;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "trading", schema = "public")
public class Trade extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "entry_date", nullable = false)
    public LocalDate entryDate;

    @Column(name = "exit_date")
    public LocalDate exitDate;

    @Column(name = "options_trading_amount")
    public Long optionsTradingAmount;

    @Column(name = "required_profit")
    public Long requiredProfit;

    public Long interest;

    @Column(name = "actual_profit")
    public Long actualProfit;

    @Column(name = "total_profit")
    public Long totalProfit;

    public Float percent;

    @Column(name = "mf_trading_amount")
    public Long mfTradingAmount;

    public Long pnl;

    @Column(name = "mf_profit")
    public Float mfProfit;
}
