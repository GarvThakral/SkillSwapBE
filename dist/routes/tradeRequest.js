"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeRequestRouter = void 0;
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
const client_1 = require("@prisma/client");
exports.tradeRequestRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.tradeRequestRouter.post('/', userMiddleware_1.userMiddleware, async (req, res) => {
    const { receiverId, senderSkillId, receiverSkillId, description, workingDays, senderToken, recieverToken, serviceId } = req.body;
    // @ts-ignore
    const userId = req.id;
    try {
        const tradeReq = await prisma.tradeRequest.create({
            data: {
                senderId: userId,
                receiverId,
                senderSkillId: senderSkillId,
                receiverSkillId: receiverSkillId,
                workingDays: "",
                description: "",
                senderToken,
                recieverToken,
                type: "TRADE",
                status: "PENDING",
                serviceId
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
});
exports.tradeRequestRouter.get('/', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore;
    const userId = req.id;
    try {
        const response = await prisma.tradeRequest.findMany({
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
                },
                serviceRel: {
                    select: {
                        id: true
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
});
exports.tradeRequestRouter.post('/accept', userMiddleware_1.userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.id;
    const { requestId } = req.body;
    try {
        const tradeReq = await prisma.tradeRequest.update({
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
});
exports.tradeRequestRouter.post('/pending', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const { receiverId, receiverSkillId, senderSkillId } = req.body;
    try {
        const pendingTrade = await prisma.tradeRequest.findFirst({
            where: {
                senderId: userId,
                receiverId,
                receiverSkillId,
                senderSkillId
            }
        });
        if (pendingTrade) {
            res.status(200).json({
                message: "Request for this skill already sent"
            });
        }
        else {
            res.status(204).json({
                message: "Request for this skill already sent"
            });
        }
    }
    catch (e) {
        res.status(304).json({
            error: e
        });
    }
});
exports.tradeRequestRouter.post('/deny', userMiddleware_1.userMiddleware, async (req, res) => {
    console.log("Reached");
    //@ts-ignore
    const userId = req.id;
    const { requestId } = req.body;
    try {
        const tradeReq = await prisma.tradeRequest.delete({
            where: {
                id: requestId,
            }
        });
        res.json({
            deleteMessage: "DELETED",
            message: tradeReq
        });
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
    }
});
exports.tradeRequestRouter.delete('/', async (req, res) => {
    const { tradeRequestId } = req.body;
    try {
        const deletedRequest = await prisma.tradeRequest.delete({
            where: {
                id: tradeRequestId
            }
        });
        res.json({
            deletedRequest
        });
    }
    catch (e) {
        res.status(304).json({
            error: e
        });
    }
});
