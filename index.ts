import fs from "fs";
import os from "os";
import path from "path";
import { Router } from "express";
import { Connection, Keypair } from "@solana/web3.js";
import { getTransactions, initializeProgram, Wallet } from "@elowen-ai/program";

import eda from "./eda";
import elw from "./elw";
import alt from "./alt";
import team from "./team";
import reward from "./reward";
import squads from "./squads";
import presale from "./presale";
import premium from "./premium";
import platform from "./platform";
import balances from "./balances";
import liquidity from "./liquidity";

export function initProgram() {
    const connection = new Connection(process.env.RPC_URL as string, {
        commitment: "confirmed",
        wsEndpoint: process.env.RPC_WS_URL,
    });

    const walletPath = process.env.WALLET_PATH?.split("/");
    const solanaKeypairPath = path.join(os.homedir(), ...walletPath!);
    const keypairJson = JSON.parse(fs.readFileSync(solanaKeypairPath, "utf-8"));
    const adminWallet = new Wallet(
        Keypair.fromSecretKey(Buffer.from(keypairJson)),
    );

    initializeProgram(
        connection,
        adminWallet,
        process.env.ENV === "development" ? "devnet" : "mainnet-beta",
    );
}

const router = Router();

router.use("/eta", eda);
router.use("/elw", elw);
router.use("/alt", alt);
router.use("/team", team);
router.use("/reward", reward);
router.use("/squads", squads);
router.use("/presale", presale);
router.use("/premium", premium);
router.use("/platform", platform);
router.use("/balances", balances);
router.use("/liquidity", liquidity);

router.get("/transactions", async (req, res) => {
    const limit = req.query.limit as any as number;
    const viaWait = req.query.viaWait as any as boolean;
    const lastSignature = req.query.lastSignature as string;

    res.json({
        transactions: await getTransactions({
            limit: limit || 10,
            viaWait,
            lastSignature,
        }),
    });
});

export default router;
