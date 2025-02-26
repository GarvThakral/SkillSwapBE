"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRouter = void 0;
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.transactionRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.transactionRouter.post('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id;
    console.log(userId);
    console.log("REACHING TRANSACTION ROUTER");
    const requiredBody = zod_1.z.object({
        type: zod_1.z.enum(["TEACH_REQUEST", "TRADE_REQUEST"]),
        recieverId: zod_1.z.number(),
        senderSkillId: zod_1.z.optional(zod_1.z.number()),
        recieverSkillId: zod_1.z.optional(zod_1.z.number()),
        senderAmount: zod_1.z.number(),
        recieverAmount: zod_1.z.number(),
        requestId: zod_1.z.number(),
        serviceId: zod_1.z.number()
    });
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { type, recieverId, senderSkillId, recieverSkillId, senderAmount, recieverAmount, requestId, serviceId } = parsedBody;
        try {
            if (type == "TEACH_REQUEST") {
                const newTransaction = yield prisma.transactions.create({
                    data: {
                        type,
                        senderId: userId,
                        recieverId,
                        recieverSkillId,
                        senderAmount,
                        recieverAmount,
                        requestId,
                        serviceId
                    }
                });
                res.json({
                    message: "Teach Transaction Created",
                    newTransaction
                });
                return;
            }
            const newTransaction = yield prisma.transactions.create({
                data: {
                    type,
                    senderId: userId,
                    recieverId,
                    senderSkillId,
                    recieverSkillId,
                    senderAmount,
                    recieverAmount,
                    requestId
                }
            });
            res.json({
                message: "Trade Transaction Created",
                newTransaction
            });
            return;
        }
        catch (e) {
            res.status(303).json({
                message: "Problem with the input"
            });
            return;
        }
    }
    catch (e) {
        res.status(303).json({
            message: "Problem with the input"
        });
        return;
    }
}));
exports.transactionRouter.get('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id;
    console.log(userId);
    try {
        const userTransactions = yield prisma.transactions.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recieverId: userId }
                ]
            }
        });
        res.json({
            userTransactions
        });
        return;
    }
    catch (e) {
        res.status(303).json({
            message: "Error finding transactions",
            error: e
        });
        return;
    }
}));
exports.transactionRouter.post('/pending', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id;
    const { user2Id } = req.body;
    console.log(userId);
    console.log(user2Id);
    try {
        const transaction = yield prisma.transactions.findFirst({
            where: {
                status: "PENDING",
                OR: [
                    { senderId: user2Id, recieverId: userId },
                    { senderId: userId, recieverId: user2Id }
                ],
            }
        });
        if (transaction) {
            console.log(transaction);
            res.status(200).json({
                transaction
            });
        }
        else {
            console.log("NONE");
            res.status(205).json({
                message: "No pending transactions"
            });
        }
    }
    catch (e) {
        res.status(304).json({
            error: e
        });
    }
}));
exports.transactionRouter.post("/complete", userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, senderId, recieverId, amount } = req.body;
    try {
        // Update transaction status to COMPLETED
        const transaction = yield prisma.transactions.update({
            where: { id },
            data: { status: "COMPLETED" },
        });
        console.log("Transaction Updated:", transaction);
        if (transaction.type === "TEACH_REQUEST") {
            // Find all teach requests linked to this service
            const teachRequests = yield prisma.teachRequest.findMany({
                where: { serviceId: transaction.serviceId }
            });
            // Update teach request status
            yield prisma.teachRequest.update({
                where: { id: transaction.requestId },
                data: { status: "COMPLETED" }
            });
            // Delete all teach requests linked to the service
            if (teachRequests.length > 0) {
                yield prisma.teachRequest.deleteMany({
                    where: { serviceId: transaction.serviceId }
                });
            }
            // Handle token transfer
            yield prisma.user.update({
                where: { id: senderId },
                data: { tokens: { decrement: amount } }
            });
            yield prisma.user.update({
                where: { id: recieverId },
                data: { tokens: { increment: amount } }
            });
            // **Delete transactions referencing serviceId first**
            yield prisma.transactions.deleteMany({
                where: { serviceId: transaction.serviceId }
            });
            // **Now delete the service request**
            const deletedService = yield prisma.serviceRequest.delete({
                where: { id: transaction.serviceId }
            });
            console.log("Deleted service:", deletedService);
            console.log("Teach request transaction completed.");
            return res.json({ message: "Transaction complete" });
        }
        else if (transaction.type === "TRADE_REQUEST") {
            const netAmount = transaction.senderAmount - transaction.recieverAmount;
            // Handle trade request token transfer
            yield prisma.user.update({
                where: { id: senderId },
                data: { tokens: { increment: netAmount } }
            });
            yield prisma.user.update({
                where: { id: recieverId },
                data: { tokens: { decrement: netAmount } }
            });
            // Delete related teachRequests
            yield prisma.teachRequest.deleteMany({
                where: { serviceId: transaction.serviceId }
            });
            // Delete related tradeRequests
            yield prisma.tradeRequest.deleteMany({
                where: { serviceId: transaction.serviceId }
            });
            // **Delete transactions referencing serviceId first**
            yield prisma.transactions.deleteMany({
                where: { serviceId: transaction.serviceId }
            });
            // **Now delete the service request**
            const deletedService = yield prisma.serviceRequest.delete({
                where: { id: transaction.serviceId }
            });
            console.log("Deleted service:", deletedService);
            return res.json({ message: "Transaction complete" });
        }
        else {
            return res.status(400).json({ error: "Unknown transaction type" });
        }
    }
    catch (e) {
        console.error("Error in completing transaction:", e);
        return res.status(500).json({ error: e.message || "An error occurred" });
    }
}));
exports.transactionRouter.get('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id;
    const transactionId = parseInt(req.params.id);
    try {
        const transactionDetails = yield prisma.transactions.findFirst({
            where: {
                id: transactionId,
                OR: [
                    { senderId: userId },
                    { recieverId: userId }
                ]
            }
        });
        res.json({
            transactionDetails
        });
        return;
    }
    catch (e) {
        res.status(303).json({
            message: "Error finding the transaction you were looking for"
        });
        return;
    }
}));
