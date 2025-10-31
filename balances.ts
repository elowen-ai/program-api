import { Router } from "express";
import {
    Currency,
    getUserSolBalance,
    getUserElwBalance,
    getUserUsdcBalance,
    getUserWsolBalance,
    VaultAccount,
    getEdaVaultBalances,
    getLiquidityVaultBalances,
    getPlatformVaultElwBalance,
    getPresaleVaultElwBalance,
    getRewardVaultElwBalance,
    getTeamVaultElwBalance,
    getTreasuryVaultBalances,
} from "@elowen-ai/program";

const router = Router();

router.get("/user/:address/:currency", async (req, res) => {
    try {
        const address = req.params.address as string;
        const currency = req.params.currency as any;

        if (!address || !currency) {
            res.status(400).json({
                error: "Address and currency are required",
            });
            return;
        }

        switch (currency) {
            case Currency.SOL:
                res.json({
                    balance: await getUserSolBalance(address),
                });
                break;
            case Currency.ELW:
                res.json({
                    balance: await getUserElwBalance(address),
                });
                break;
            case Currency.USDC:
                res.json({
                    balance: await getUserUsdcBalance(address),
                });
                break;
            case Currency.WSOL:
                res.json({
                    balance: await getUserWsolBalance(address),
                });
                break;
            default:
                res.status(400).json({ error: "Unsupported currency" });
                return;
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get("/vault/:vault", async (req, res) => {
    try {
        const vault = req.params.vault as any;

        if (!vault) {
            res.status(400).json({ error: "Vault is required" });
            return;
        }

        switch (vault) {
            case VaultAccount.Eda:
                res.json({
                    balance: await getEdaVaultBalances(),
                });
                break;
            case VaultAccount.Liquidity:
                res.json({
                    balance: await getLiquidityVaultBalances(),
                });
                break;
            case VaultAccount.Platform:
                res.json({
                    balance: await getPlatformVaultElwBalance(),
                });
                break;
            case VaultAccount.Presale:
                res.json({
                    balance: await getPresaleVaultElwBalance(),
                });
                break;
            case VaultAccount.Reward:
                res.json({
                    balance: await getRewardVaultElwBalance(),
                });
                break;
            case VaultAccount.Team:
                res.json({
                    balance: await getTeamVaultElwBalance(),
                });
                break;
            case VaultAccount.Treasury:
                res.json({
                    balance: await getTreasuryVaultBalances(),
                });
            default:
                res.status(400).json({ error: "Unsupported vault" });
                return;
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
