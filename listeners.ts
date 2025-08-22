import {
    listenBuyPremiumEvent,
    listenBuyPresaleTokenEvent,
    listenClaimRewardEvent,
    listenElwBurnEvent,
    listenTransactions,
} from "@elowen-ai/program";
import type { Server } from "socket.io";

export default function (io: Server) {
    listenTransactions(transaction => {
        console.log(transaction);
        io.emit("transaction", transaction);
    });

    listenElwBurnEvent(event => {
        console.log(event);
        io.emit("elwBurn", event);
    });

    listenClaimRewardEvent(event => {
        console.log(event);
        io.emit("claimReward", event);
    });

    listenBuyPremiumEvent(event => {
        console.log(event);
        io.emit("buyPremium", event);
    });

    listenBuyPresaleTokenEvent(event => {
        console.log(event);
        io.emit("buyPresaleToken", event);
    });
}
