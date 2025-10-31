import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
    getRewardAccountData,
    fillTransactionRequirements,
    createClaimElwRewardTransaction,
} from "@elowen-ai/program";

const router = Router();

router.post("/claim", async (req, res) => {
    try {
        const { user, claimableRewards } = req.body;

        if (!user || !claimableRewards) {
            res.status(400).json({
                error: "User address and claimable rewards are required",
            });
            return;
        }

        let { transaction, signerWallet } =
            await createClaimElwRewardTransaction(user, claimableRewards);

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

router.get("/account", async (req, res) => {
    const user = req.query.user as string;

    if (!user) {
        res.status(400).json({ error: "User address is required" });
        return;
    }

    res.json({
        account: await getRewardAccountData(user),
    });
});

export default router;
