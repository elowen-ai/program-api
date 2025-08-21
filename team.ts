import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
    fillTransactionRequirements,
    createClaimTeamMemberElwTransaction,
    getTeamMemberClaimAccountData,
} from "@elowen-ai/program";

const router = Router();

router.post("/claim", async (req, res) => {
    try {
        const { member } = req.body;

        if (!member) {
            res.status(400).json({ error: "Member address is required" });
            return;
        }

        const transaction = await fillTransactionRequirements(
            await createClaimTeamMemberElwTransaction(member),
            new PublicKey(member),
        );

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
    const member = req.query.member as string;

    if (!member) {
        res.status(400).json({ error: "Member address is required" });
        return;
    }

    res.json({
        account: await getTeamMemberClaimAccountData(member),
    });
});

export default router;
