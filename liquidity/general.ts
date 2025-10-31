import { Router } from "express";
import {
    createCollectLockedLiquidityFeesTransaction,
    createDepositCpmmLiquidityTransaction,
    createInitializeCpmmLiquidityTransaction,
    createSwapCpmmTransaction,
    createVaultSwapCpmmTransaction,
    fillTransactionRequirements,
    getLiquidityVaultRaydiumKeyNfts,
    getLockedLiquidityInfoByFeeNftMint,
    getLpStateByCurrency,
    getPoolInfoByCurrency,
    getPoolInfoFeesByCurrency,
    getPoolVaultAmountByCurrency,
    getPriceByQuoteCurrency,
    QuoteCurrency,
    signAndSendTransaction,
} from "@elowen-ai/program";
import { PublicKey } from "@solana/web3.js";

const router = Router();

router.post("/initialize", async (req, res) => {
    try {
        const { currency, elwAmount, quoteAmount } = req.body;

        if (!currency || !elwAmount || !quoteAmount) {
            res.status(400).json({
                error: "Currency, ELW amount, and quote amount are required",
            });
            return;
        }

        if (!["SOL", "USDC"].includes(currency)) {
            throw new Error("Invalid currency");
        }

        const { transactionV0, feeNftMint } =
            await createInitializeCpmmLiquidityTransaction(
                elwAmount,
                quoteAmount,
                currency,
                Math.floor(Date.now() / 1000),
            );

        res.json({
            signature: await signAndSendTransaction(transactionV0, [
                feeNftMint,
            ]),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post("/deposit", async (req, res) => {
    try {
        const { currency, elwAmount } = req.body;

        if (!currency || !elwAmount) {
            res.status(400).json({
                error: "Currency and ELW amount are required",
            });
            return;
        }

        if (!["SOL", "USDC"].includes(currency)) {
            throw new Error("Invalid currency");
        }

        const prices = await getPriceByQuoteCurrency(currency);
        const { transactionV0, feeNftMint } =
            await createDepositCpmmLiquidityTransaction(
                elwAmount,
                elwAmount * prices.elwToQuote,
                currency,
            );

        res.json({
            signature: await signAndSendTransaction(transactionV0, [
                feeNftMint,
            ]),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post("/collect", async (req, res) => {
    try {
        const { currency } = req.body;

        if (!currency) {
            res.status(400).json({
                error: "Currency is required",
            });
            return;
        }

        if (!["SOL", "USDC"].includes(currency)) {
            throw new Error("Invalid currency");
        }

        const signatures = [];

        const nfts = await getLiquidityVaultRaydiumKeyNfts(true, currency);

        for (const nft of nfts) {
            signatures.push(
                await signAndSendTransaction(
                    await createCollectLockedLiquidityFeesTransaction(nft),
                ),
            );
        }

        res.json({ signatures });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post("/swap", async (req, res) => {
    try {
        const slippageBps = req.body.slippageBps || 0.5;
        const { user, inputCurrency, outputCurrency, amount, swapDirection } =
            req.body;

        if (!user || !inputCurrency || !outputCurrency) {
            res.status(400).json({
                error: "User, input currency, and output currency are required",
            });
            return;
        }

        let transaction = await createSwapCpmmTransaction(
            user,
            inputCurrency,
            outputCurrency,
            amount,
            swapDirection,
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

router.post("/vault-swap", async (req, res) => {
    try {
        const slippageBps = req.body.slippageBps || 0.5;
        const { vault, inputCurrency, outputCurrency, amount, swapDirection } =
            req.body;

        if (!vault || !inputCurrency || !outputCurrency) {
            res.status(400).json({
                error: "Vault, input currency, and output currency are required",
            });
            return;
        }

        const transaction = await createVaultSwapCpmmTransaction(
            vault,
            inputCurrency,
            outputCurrency,
            amount,
            swapDirection,
            slippageBps,
        );

        res.json({
            signature: await signAndSendTransaction(transaction),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get("/nfts", async (req, res) => {
    const currency = req.query.currency as any as QuoteCurrency;
    const withLpState = (req.query.withLpState || false) as boolean;

    if (currency && !["SOL", "USDC"].includes(currency)) {
        throw new Error("Invalid currency");
    }

    res.json({
        nfts: !withLpState
            ? await getLiquidityVaultRaydiumKeyNfts()
            : await getLiquidityVaultRaydiumKeyNfts(withLpState, currency),
    });
});

router.get("/locked-lp-info", async (req, res) => {
    const nftMint = req.query.nftMint as string;

    res.json({
        info: await getLockedLiquidityInfoByFeeNftMint(new PublicKey(nftMint)),
    });
});

router.get("/price", async (req, res) => {
    const currency = req.query.currency as any as QuoteCurrency;

    if (!currency) {
        res.status(400).json({ error: "Currency is required" });
        return;
    }

    if (!["SOL", "USDC"].includes(currency)) {
        throw new Error("Invalid currency");
    }

    res.json({
        price: await getPriceByQuoteCurrency(currency),
    });
});

router.get("/fees", async (req, res) => {
    const currency = req.query.currency as any as QuoteCurrency;

    if (!currency) {
        res.status(400).json({ error: "Currency is required" });
        return;
    }

    if (!["SOL", "USDC"].includes(currency)) {
        throw new Error("Invalid currency");
    }

    res.json({
        price: await getPoolInfoFeesByCurrency(currency),
    });
});

router.get("/amounts", async (req, res) => {
    const currency = req.query.currency as any as QuoteCurrency;

    if (!currency) {
        res.status(400).json({ error: "Currency is required" });
        return;
    }

    if (!["SOL", "USDC"].includes(currency)) {
        throw new Error("Invalid currency");
    }

    res.json({
        price: await getPoolVaultAmountByCurrency(currency),
    });
});

router.get("/pool-info", async (req, res) => {
    const currency = req.query.currency as any as QuoteCurrency;

    if (!currency) {
        res.status(400).json({ error: "Currency is required" });
        return;
    }

    if (!["SOL", "USDC"].includes(currency)) {
        throw new Error("Invalid currency");
    }

    res.json({
        info: await getPoolInfoByCurrency(currency),
    });
});

router.get("/lp-state", async (req, res) => {
    const currency = req.query.currency as any as QuoteCurrency;

    if (!currency) {
        res.status(400).json({ error: "Currency is required" });
        return;
    }

    if (!["SOL", "USDC"].includes(currency)) {
        throw new Error("Invalid currency");
    }

    res.json({
        state: await getLpStateByCurrency(currency),
    });
});

export default router;
