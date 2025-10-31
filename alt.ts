import { Router } from "express";
import {
    signAndSendTransaction,
    createAddressLookupTableTransaction,
} from "@elowen-ai/program";

const router = Router();

router.post("/initialize", async (req, res) => {
    try {
        const signature = await signAndSendTransaction(
            await createAddressLookupTableTransaction(),
        );
        res.json({ signature });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
