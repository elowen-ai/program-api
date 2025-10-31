import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
    createClaimMiningRewardsTransaction,
    createDepositMiningLiquidityTransaction,
    createWithdrawMiningLiquidityTransaction,
    fillTransactionRequirements,
    getMinerLpVaultAddress,
    getMinerLpVaultTokenAmountByCurrency,
    getMinerLpVaultTokenAtaByCurrency,
    getMinerStateAccountData,
    getMiningStateAccountData,
    getPriceByQuoteCurrency,
    QuoteCurrency,
} from "@elowen-ai/program";

const router = Router();

router.post("/deposit", async (req, res) => {
    try {
        const { user, currency, elwAmount } = req.body;
        const slippageBps = req.body.slippageBps || 0;

        if (!user || !currency || !elwAmount) {
            res.status(400).json({
                error: "User, currency and ELW amount are required",
            });
            return;
        }

        if (!["SOL", "USDC"].includes(currency)) {
            throw new Error("Invalid currency");
        }

        const prices = await getPriceByQuoteCurrency(currency);
        let transaction = await createDepositMiningLiquidityTransaction(
            user,
            elwAmount,
            elwAmount * prices.elwToQuote,
            currency,
            slippageBps,
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

router.post("/withdraw", async (req, res) => {
    try {
        const { user, currency, elwAmount } = req.body;
        const slippageBps = req.body.slippageBps || 0;

        if (!user || !currency || !elwAmount) {
            res.status(400).json({
                error: "User, currency and ELW amount are required",
            });
            return;
        }

        if (!["SOL", "USDC"].includes(currency)) {
            throw new Error("Invalid currency");
        }

        const prices = await getPriceByQuoteCurrency(currency);
        let transaction = await createWithdrawMiningLiquidityTransaction(
            user,
            elwAmount,
            elwAmount * prices.elwToQuote,
            currency,
            slippageBps,
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
        const { user, currency } = req.body;

        if (!user || !currency) {
            res.status(400).json({
                error: "User and currency are required",
            });
            return;
        }

        if (!["SOL", "USDC"].includes(currency)) {
            throw new Error("Invalid currency");
        }

        let transaction = await createClaimMiningRewardsTransaction(
            user,
            currency,
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

router.get("/miner-info", async (req, res) => {
    const miner = req.query.miner as string;
    const currency = req.query.currency as any as QuoteCurrency;

    if (!miner || !currency) {
        res.status(400).json({
            error: "Miner address and currency are required",
        });
        return;
    }

    const lpVaultAddress = getMinerLpVaultAddress(new PublicKey(miner));
    const lpTokenAta = await getMinerLpVaultTokenAtaByCurrency(
        new PublicKey(miner),
        currency,
    );
    const lpTokenAmount = await getMinerLpVaultTokenAmountByCurrency(
        new PublicKey(miner),
        currency,
    );

    res.json({
        info: {
            lpVaultAddress,
            lpTokenAta,
            lpTokenAmount,
        },
    });
});

router.get("/mining-state", async (req, res) => {
    const currency = req.query.currency as any as QuoteCurrency;

    if (!currency) {
        res.status(400).json({
            error: "Currency are required",
        });
        return;
    }

    res.json({
        state: await getMiningStateAccountData(currency),
    });
});

router.get("/miner-state", async (req, res) => {
    const miner = req.query.miner as string;
    const currency = req.query.currency as any as QuoteCurrency;

    if (!miner || !currency) {
        res.status(400).json({
            error: "Miner address and currency are required",
        });
        return;
    }

    res.json({
        state: await getMinerStateAccountData(new PublicKey(miner), currency),
    });
});

export default router;
