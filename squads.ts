import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
    getProposal,
    createMultisigWalletTransaction,
    createProposalRejectTransaction,
    createProposalCancelTransaction,
    createProposalApproveTransaction,
    createTransactionExecuteTransaction,
} from "@elowen-ai/program";

const router = Router();

router.post("/create", async (req, res) => {
    try {
        const { creator } = req.body;

        if (!creator) {
            res.status(400).json({
                error: "Creator address is required",
            });
            return;
        }

        const { createKey, transaction, multisigPda, multisigVaultPda } =
            await createMultisigWalletTransaction(creator);

        transaction.sign([createKey]);

        res.json({
            multisigPda: multisigPda.toBase58(),
            multisigVaultPda: multisigVaultPda.toBase58(),
            transaction: Buffer.from(transaction.serialize()).toString(
                "base64",
            ),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post("/approve", async (req, res) => {
    try {
        const { member, transactionIndex } = req.body;
        const executeTransaction = req.body.executeTransaction || false;

        if (!member || !transactionIndex) {
            res.status(400).json({
                error: "Member address and transaction index are required",
            });
            return;
        }

        const proposal = await getProposal(transactionIndex);

        if (proposal.approved.find(p => p.equals(new PublicKey(member)))) {
            res.status(400).json({
                error: "Member has already approved this proposal",
            });
            return;
        }

        const transaction = await createProposalApproveTransaction(
            member,
            transactionIndex,
            executeTransaction,
        );

        res.json({
            transaction: Buffer.from(transaction.serialize()).toString(
                "base64",
            ),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post("/reject", async (req, res) => {
    try {
        const { member, transactionIndex } = req.body;

        if (!member || !transactionIndex) {
            res.status(400).json({
                error: "Member address and transaction index are required",
            });
            return;
        }

        const proposal = await getProposal(transactionIndex);

        if (proposal.rejected.find(p => p.equals(new PublicKey(member)))) {
            res.status(400).json({
                error: "Member has already rejected this proposal",
            });
            return;
        }

        const transaction = await createProposalRejectTransaction(
            member,
            transactionIndex,
        );

        res.json({
            transaction: Buffer.from(transaction.serialize()).toString(
                "base64",
            ),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post("/cancel", async (req, res) => {
    try {
        const { member, transactionIndex } = req.body;

        if (!member || !transactionIndex) {
            res.status(400).json({
                error: "Member address and transaction index are required",
            });
            return;
        }

        const proposal = await getProposal(transactionIndex);

        if (proposal.cancelled.find(p => p.equals(new PublicKey(member)))) {
            res.status(400).json({
                error: "Member has already cancelled this proposal",
            });
            return;
        }

        const transaction = await createProposalCancelTransaction(
            member,
            transactionIndex,
        );

        res.json({
            transaction: Buffer.from(transaction.serialize()).toString(
                "base64",
            ),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post("/execute", async (req, res) => {
    try {
        const { member, transactionIndex } = req.body;

        if (!member || !transactionIndex) {
            res.status(400).json({
                error: "Member address and transaction index are required",
            });
            return;
        }

        const proposal = await getProposal(transactionIndex);

        if (proposal.status.__kind === "Executed") {
            res.status(400).json({
                error: "Proposal has already been executed",
            });
            return;
        }

        const transaction = await createTransactionExecuteTransaction(
            member,
            transactionIndex,
        );

        res.json({
            transaction: Buffer.from(transaction.serialize()).toString(
                "base64",
            ),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get("/proposal", async (req, res) => {
    try {
        const transactionIndex = req.query.transactionIndex as any as number;

        if (!transactionIndex) {
            res.status(400).json({ error: "Transaction index is required" });
            return;
        }

        res.json({
            proposal: await getProposal(transactionIndex),
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
