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
exports.tradeRequestRouter = void 0;
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
const client_1 = require("@prisma/client");
exports.tradeRequestRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.tradeRequestRouter.post('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, senderSkillId, receiverSkillId, description, workingDays } = req.body;
    // @ts-ignore
    const userId = req.id;
    try {
        const tradeReq = yield prisma.tradeRequest.create({
            data: {
                senderId: userId,
                receiverId,
                senderSkillId: senderSkillId,
                receiverSkillId: receiverSkillId,
                workingDays: "",
                description: "",
                type: "TRADE",
                status: "PENDING"
            }
        });
        res.json({
            message: "Teach Request Created",
            tradeReq
        });
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
    }
}));
exports.tradeRequestRouter.get('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore;
    const userId = req.id;
    try {
        const response = yield prisma.tradeRequest.findMany({
            where: {
                receiverId: userId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        profilePicture: true,
                        username: true,
                        availabilitySchedule: true,
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        profilePicture: true,
                        username: true,
                        availabilitySchedule: true,
                    }
                },
                senderSkill: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        proficiencyLevel: true
                    }
                },
                receiverSkill: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        proficiencyLevel: true
                    }
                }
            }
        });
        res.json({
            message: "Here are all the tradeRequests",
            tradeRequests: response
        });
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
    }
}));
exports.tradeRequestRouter.post('/accept', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.id;
    const { requestId } = req.body;
    try {
        const tradeReq = yield prisma.tradeRequest.update({
            where: {
                id: requestId,
            },
            data: {
                status: "COMPLETED"
            }
        });
        res.json({
            message: tradeReq
        });
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
    }
}));
exports.tradeRequestRouter.post('/deny', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Reached");
    //@ts-ignore
    const userId = req.id;
    const { requestId } = req.body;
    try {
        const tradeReq = yield prisma.tradeRequest.delete({
            where: {
                id: requestId,
            }
        });
        res.json({
            message: tradeReq
        });
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
    }
}));
