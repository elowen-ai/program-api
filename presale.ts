import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
    PresaleType,
    signAndSendTransaction,
    fillTransactionRequirements,
    createBuyPresaleElwTransaction,
    createClaimPresaleElwTransaction,
    createBurnUnsoldElwTransaction,
    getPresalePurchaseAccountData,
    getPresaleSummaryAccountData,
} from "@elowen-ai/program";

const router = Router();

router.post("/buy", async (req, res) => {
    try {
        const { user, amount, presaleType, currency } = req.body;

        if (!user || !amount || !presaleType || !currency) {
            res.status(400).json({
                error: "User address, amount, presale type, and currency are required",
            });
            return;
        }

        if (!Object.values(PresaleType).includes(presaleType)) {
            throw new Error("Invalid presaleType");
        }

        if (!["SOL", "USDC"].includes(currency)) {
            throw new Error("Invalid currency");
        }

        let transaction = await createBuyPresaleElwTransaction(
            user,
            amount,
            currency,
            presaleType,
        );

        transaction = await fillTransactionRequirements(
            transaction,
            new PublicKey(user),
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

router.post("/claim", async (req, res) => {
    try {
        const { user, presaleType } = req.body;

        if (!user || !presaleType) {
            res.status(400).json({
                error: "User address and presale type are required",
            });
            return;
        }

        if (!Object.values(PresaleType).includes(presaleType)) {
            throw new Error("Invalid presaleType");
        }

        let transaction = await createClaimPresaleElwTransaction(
            user,
            presaleType,
        );

        transaction = await fillTransactionRequirements(
            transaction,
            new PublicKey(user),
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

router.post("/burn", async (req, res) => {
    try {
        res.json({
            signature: await signAndSendTransaction(
                await createBurnUnsoldElwTransaction(),
            ),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get("/account", async (req, res) => {
    try {
        const user = req.query.user as string;
        const presaleType = req.query.presaleType as PresaleType;

        if (!user || !presaleType) {
            res.status(400).json({
                error: "User address and presale type are required",
            });
            return;
        }

        if (!Object.values(PresaleType).includes(presaleType)) {
            throw new Error("Invalid presaleType");
        }

        res.json({
            account: await getPresalePurchaseAccountData(user, presaleType),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get("/summary", async (req, res) => {
    res.json({
        summary: await getPresaleSummaryAccountData(),
    });
});

export default router;
