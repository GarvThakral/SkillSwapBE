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
exports.teachRequestRouter = void 0;
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
const client_1 = require("@prisma/client");
exports.teachRequestRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.teachRequestRouter.post('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("AAHAAH");
    const { receiverId, skillId, description, workingDays } = req.body;
    // @ts-ignore
    const userId = req.id;
    try {
        const teachReq = yield prisma.teachRequest.create({
            data: {
                senderId: userId,
                receiverId,
                skillId,
                description,
                workingDays,
                status: "PENDING",
                type: "TEACH"
            }
        });
        res.json({
            message: "Teach Request Created",
            teachReq
        });
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
    }
}));
exports.teachRequestRouter.post('/accept', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.id;
    const { requestId } = req.body;
    try {
        const teachReq = yield prisma.teachRequest.update({
            where: {
                id: requestId,
            },
            data: {
                status: "COMPLETED"
            }
        });
        res.json({
            message: teachReq
        });
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
    }
}));
exports.teachRequestRouter.post('/deny', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Reached");
    //@ts-ignore
    const userId = req.id;
    const { requestId } = req.body;
    try {
        const teachReq = yield prisma.teachRequest.delete({
            where: {
                id: requestId,
            }
        });
        res.json({
            message: teachReq
        });
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
    }
}));
exports.teachRequestRouter.get('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id;
    try {
        console.log("Reached");
        const teachRequests = yield prisma.teachRequest.findMany({
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
                skill: {
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
            message: "Here are all teaching requests",
            teachRequests
        });
    }
    catch (e) {
        console.log("Eror happened");
        res.json({
            error: e
        });
    }
}));
