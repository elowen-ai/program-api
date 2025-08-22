import models from "../../db";
import type { Server } from "socket.io";
import {
    listenBuyPremiumEvent,
    listenBuyPresaleTokenEvent,
    listenClaimRewardEvent,
    listenElwBurnEvent,
    listenTransactions,
} from "@elowen-ai/program";

export default function (io: Server) {
    listenTransactions(transaction => {
        io.emit("transaction", transaction);
        new models.instance.transactions({
            ...transaction,
            details: JSON.stringify(transaction.details),
        }).saveAsync();
    });

    listenElwBurnEvent(event => {
        io.emit("elwBurn", event);
        new models.instance.events({
            date: new Date(),
            type: "elwBurn",
            event: JSON.stringify(event),
        }).saveAsync();
    });

    listenClaimRewardEvent(event => {
        io.emit("claimReward", event);
        new models.instance.events({
            date: new Date(),
            type: "claimReward",
            event: JSON.stringify(event),
        }).saveAsync();
    });

    listenBuyPremiumEvent(event => {
        io.emit("buyPremium", event);
        new models.instance.events({
            date: new Date(),
            type: "buyPremium",
            event: JSON.stringify(event),
        }).saveAsync();
    });

    listenBuyPresaleTokenEvent(event => {
        io.emit("buyPresaleToken", event);
        new models.instance.events({
            date: new Date(),
            type: "buyPresaleToken",
            event: JSON.stringify(event),
        }).saveAsync();
    });
}
