"use strict";
// POST /transactions: Create a transaction (for token transfers, service payments, etc.).
// GET /transactions: Get all transactions of a user (sender or receiver).
// GET /transactions/:id: Fetch details of a specific transaction by ID.
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
    const requiredBody = zod_1.z.object({
        type: zod_1.z.enum(["TOKEN_TRANSFER", "SERVICE_PAYMENT"]),
        recieverId: zod_1.z.number(),
        skillId: zod_1.z.optional(zod_1.z.number()),
        amount: zod_1.z.number()
    });
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { type, recieverId, skillId, amount } = parsedBody;
        try {
            const newTransaction = yield prisma.transactions.create({
                data: {
                    type,
                    senderId: userId,
                    recieverId,
                    skillId,
                    amount
                }
            });
            res.json({
                message: "Transaction Successful",
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
