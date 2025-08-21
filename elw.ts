import { Router } from "express";
import {
    signAndSendTransaction,
    createInitializeElwTransaction,
} from "@elowen-ai/program";

const router = Router();

router.post("/initialize", async (req, res) => {
    try {
        const { metadataUri } = req.body;

        if (!metadataUri) {
            res.status(400).json({ error: "Metadata URI is required" });
            return;
        }

        const { transaction, elwMint } =
            await createInitializeElwTransaction(metadataUri);
        const signature = await signAndSendTransaction(transaction, [elwMint]);

        res.json({ signature });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
