import { Router } from "express";
import {
    fillTransactionRequirements,
    createProposalCreateTransaction,
    createBurnPlatformElwTransaction,
    signAndSendTransaction,
    createWithdrawPlatformElwTransaction,
    getVaultAccountWithElwAta,
    VaultAccount,
} from "@elowen-ai/program";

const router = Router();

router.post("/burn", async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            res.status(400).json({
                error: "Amount is required",
            });
            return;
        }

        let transaction = await createBurnPlatformElwTransaction(amount);

        transaction = await fillTransactionRequirements(transaction);

        res.json({
            signature: await signAndSendTransaction(transaction),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post("/withdraw", async (req, res) => {
    try {
        const { amount, member, receiver } = req.body;

        if (!amount || !member || !receiver) {
            res.status(400).json({
                error: "Amount, member, and receiver are required",
            });
            return;
        }

        const { transaction, transactionIndex } =
            await createProposalCreateTransaction(
                "Platform ELW withdraw",
                member,
                await createWithdrawPlatformElwTransaction(receiver, amount),
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

router.get("/vaults", async (req, res) => {
    const edaVault = await getVaultAccountWithElwAta(VaultAccount.Eda);
    const teamVault = await getVaultAccountWithElwAta(VaultAccount.Team);
    const platformVault = await getVaultAccountWithElwAta(
        VaultAccount.Platform,
    );
    const rewardVault = await getVaultAccountWithElwAta(VaultAccount.Reward);
    const presaleVault = await getVaultAccountWithElwAta(VaultAccount.Presale);
    const treasuryVault = await getVaultAccountWithElwAta(
        VaultAccount.Treasury,
    );
    const liquidityVault = await getVaultAccountWithElwAta(
        VaultAccount.Liquidity,
    );
    res.json({
        edaVault,
        teamVault,
        platformVault,
        rewardVault,
        presaleVault,
        treasuryVault,
        liquidityVault,
    });
});

export default router;
