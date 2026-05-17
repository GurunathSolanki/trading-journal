package com.tradingjournal;

import jakarta.enterprise.context.ApplicationScoped;
import javax.sql.DataSource;
import jakarta.inject.Inject;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class TradeRepository {

    @Inject
    DataSource dataSource;

    public List<Trade> listAll() {
        List<Trade> trades = new ArrayList<>();
        String sql = "SELECT * FROM trading ORDER BY id";
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                trades.add(mapTrade(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return trades;
    }

    public Trade findById(Long id) {
        String sql = "SELECT * FROM trading WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapTrade(rs);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public Trade save(Trade trade) {
        String sql = """
            INSERT INTO trading (entry_date, exit_date, options_trading_amount, required_profit,
                                 interest, actual_profit, total_profit, percent,
                                 mf_trading_amount, pnl, mf_profit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id
            """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            setTradeParams(stmt, trade);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    trade.id = rs.getLong("id");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return trade;
    }

    public void update(Trade trade) {
        String sql = """
            UPDATE trading SET entry_date = ?, exit_date = ?, options_trading_amount = ?,
                               required_profit = ?, interest = ?, actual_profit = ?,
                               total_profit = ?, percent = ?, mf_trading_amount = ?,
                               pnl = ?, mf_profit = ?
            WHERE id = ?
            """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            setTradeParams(stmt, trade);
            stmt.setLong(12, trade.id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void delete(Long id) {
        String sql = "DELETE FROM trading WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private Trade mapTrade(ResultSet rs) throws SQLException {
        Trade t = new Trade();
        t.id = rs.getLong("id");
        t.entryDate = rs.getObject("entry_date", LocalDate.class);
        t.exitDate = rs.getObject("exit_date", LocalDate.class);
        t.optionsTradingAmount = getLong(rs, "options_trading_amount");
        t.requiredProfit = getLong(rs, "required_profit");
        t.interest = getLong(rs, "interest");
        t.actualProfit = getLong(rs, "actual_profit");
        t.totalProfit = getLong(rs, "total_profit");
        t.percent = getFloat(rs, "percent");
        t.mfTradingAmount = getLong(rs, "mf_trading_amount");
        t.pnl = getLong(rs, "pnl");
        t.mfProfit = getFloat(rs, "mf_profit");
        return t;
    }

    private void setTradeParams(PreparedStatement stmt, Trade t) throws SQLException {
        stmt.setObject(1, t.entryDate);
        stmt.setObject(2, t.exitDate);
        stmt.setObject(3, t.optionsTradingAmount);
        stmt.setObject(4, t.requiredProfit);
        stmt.setObject(5, t.interest);
        stmt.setObject(6, t.actualProfit);
        stmt.setObject(7, t.totalProfit);
        stmt.setObject(8, t.percent);
        stmt.setObject(9, t.mfTradingAmount);
        stmt.setObject(10, t.pnl);
        stmt.setObject(11, t.mfProfit);
    }

    private Long getLong(ResultSet rs, String column) throws SQLException {
        long val = rs.getLong(column);
        return rs.wasNull() ? null : val;
    }

    private Float getFloat(ResultSet rs, String column) throws SQLException {
        float val = rs.getFloat(column);
        return rs.wasNull() ? null : val;
    }
}
