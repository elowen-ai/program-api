import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
    fillTransactionRequirements,
    createBuyPremiumTransaction,
    createProposalCreateTransaction,
    createWithdrawTreasuryFundTransactionByCurrency,
} from "@elowen-ai/program";

const router = Router();

router.post("/buy", async (req, res) => {
    try {
        const { user, amount, currency } = req.body;

        if (!user || !amount || !currency) {
            res.status(400).json({
                error: "User address, amount, and currency are required",
            });
            return;
        }

        if (!["ELW", "USDC"].includes(currency)) {
            throw new Error("Invalid currency");
        }

        let { transaction, signerWallet } = await createBuyPremiumTransaction(
            user,
            amount,
            currency,
        );

        transaction = await fillTransactionRequirements(
            transaction,
            new PublicKey(user),
        );

        transaction.partialSign(signerWallet);

        res.json({
            transaction: transaction
                .serialize({ requireAllSignatures: false })
                .toString("base64"),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post("/withdraw", async (req, res) => {
    try {
        const { amount, member, currency, receiver } = req.body;

        if (!amount || !member || !currency || !receiver) {
            res.status(400).json({
                error: "Amount, member, currency, and receiver are required",
            });
            return;
        }

        if (!["ELW", "USDC"].includes(currency)) {
            throw new Error("Invalid currency");
        }

        const { transaction, transactionIndex } =
            await createProposalCreateTransaction(
                "Treasury ELW withdraw",
                member,
                await createWithdrawTreasuryFundTransactionByCurrency(
                    receiver,
                    amount,
                    currency,
                ),
            );

        res.json({
            transactionIndex,
            transaction: Buffer.from(transaction.serialize()).toString(
                "base64",
            ),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
