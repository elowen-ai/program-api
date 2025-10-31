import {
    listenBuyPremiumEvent,
    listenBuyPresaleTokenEvent,
    listenClaimRewardEvent,
    listenElwBurnEvent,
    listenTransactions,
} from "@elowen-ai/program";
import models from "../../db";
import type { Namespace, Server } from "socket.io";
import Transactions from "../../db/models/Transactions";

export default function (io: Server | Namespace) {
    listenTransactions(transaction => {
        // Check every key for transaction object
        const keys = Object.keys(Transactions.fields);
        for (const key of keys) {
            if (!(key in transaction) && key !== "details") {
                return;
            }
        }

        io.emit("transaction", transaction);
        new models.instance.transactions({
            ...transaction,
            details: JSON.stringify(transaction?.details || {}),
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
