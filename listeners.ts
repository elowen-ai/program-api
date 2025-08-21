import {
    listenBuyPremiumEvent,
    listenBuyPresaleTokenEvent,
    listenClaimRewardEvent,
    listenElwBurnEvent,
    listenTransactions,
} from "@elowen-ai/program";

export default function () {
    listenTransactions(transaction => {
        console.log(transaction);
    });

    listenElwBurnEvent(event => {
        console.log(event);
    });

    listenClaimRewardEvent(event => {
        console.log(event);
    });

    listenBuyPremiumEvent(event => {
        console.log(event);
    });

    listenBuyPresaleTokenEvent(event => {
        console.log(event);
    });
}
