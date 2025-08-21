import { Router } from "express";
import {
    Currency,
    createProposalCreateTransaction,
    createWithdrawEdaFundTransactionByCurrency,
} from "@elowen-ai/program";

const router = Router();

router.post("/withdraw", async (req, res) => {
    try {
        const { amount, member, currency, receiver } = req.body;

        if (!amount || !member || !currency || !receiver) {
            res.status(400).json({
                error: "Amount, member, currency, and receiver are required",
            });
            return;
        }

        if (!Object.values(Currency).includes(currency)) {
            throw new Error("Invalid currency");
        }

        const { transaction, transactionIndex } =
            await createProposalCreateTransaction(
                "Treasury ELW withdraw",
                member,
                await createWithdrawEdaFundTransactionByCurrency(
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
