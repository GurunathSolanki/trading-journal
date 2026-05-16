package com.tradingjournal;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/trades")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TradeResource {

    @GET
    public List<Trade> getAll() {
        return Trade.listAll();
    }

    @GET
    @Path("/{id}")
    public Trade getSingle(@PathParam("id") Long id) {
        Trade entity = Trade.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Trade with id of " + id + " does not exist.", 404);
        }
        return entity;
    }

    @POST
    @Transactional
    public Response create(Trade trade) {
        if (trade.id != null) {
            throw new WebApplicationException("Id was invalidly set on request.", 422);
        }
        trade.persist();
        return Response.ok(trade).status(201).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Trade update(@PathParam("id") Long id, Trade trade) {
        Trade entity = Trade.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Trade with id of " + id + " does not exist.", 404);
        }

        entity.entryDate = trade.entryDate;
        entity.exitDate = trade.exitDate;
        entity.optionsTradingAmount = trade.optionsTradingAmount;
        entity.requiredProfit = trade.requiredProfit;
        entity.interest = trade.interest;
        entity.actualProfit = trade.actualProfit;
        entity.totalProfit = trade.totalProfit;
        entity.percent = trade.percent;
        entity.mfTradingAmount = trade.mfTradingAmount;
        entity.pnl = trade.pnl;
        entity.mfProfit = trade.mfProfit;

        return entity;
    }
/*
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        Trade entity = Trade.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Trade with id of " + id + " does not exist.", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }
*/
    // }
}
