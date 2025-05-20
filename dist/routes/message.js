"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.messageRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.messageRouter.post('/', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const requiredBody = zod_1.z.object({
        senderId: zod_1.z.optional(zod_1.z.number()),
        receiverId: zod_1.z.number(),
        content: zod_1.z.string(),
        type: zod_1.z.optional(zod_1.z.enum(["REGULAR", "MEETING"])),
        meetingId: zod_1.z.optional(zod_1.z.string())
    });
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { senderId, receiverId, content, type, meetingId } = parsedBody;
        try {
            if (senderId) {
                const newMessage = await prisma.message.create({
                    data: {
                        senderId,
                        receiverId,
                        content,
                        type,
                        meetingId
                    }
                });
                res.json({
                    newMessage
                });
            }
            else {
                const newMessage = await prisma.message.create({
                    data: {
                        senderId: userId,
                        receiverId,
                        content,
                        type,
                        meetingId
                    }
                });
                res.json({
                    newMessage
                });
            }
        }
        catch (e) {
            res.status(303).json({
                message: "Error with creating a new message",
                error: e
            });
            return;
        }
    }
    catch (e) {
        res.status(303).json({
            message: "Error with the input",
            error: e
        });
        return;
    }
});
exports.messageRouter.post('/fetchMessages', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const requiredBody = zod_1.z.object({
        receiverId: zod_1.z.number(),
    });
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { receiverId } = parsedBody;
        try {
            const allMessages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: userId,
                            receiverId },
                        { senderId: receiverId,
                            receiverId: userId },
                    ]
                },
                select: {
                    type: true,
                    content: true,
                    meetingId: true,
                    sender: {
                        select: {
                            id: true,
                            profilePicture: true
                        }
                    },
                    receiver: {
                        select: {
                            id: true,
                            profilePicture: true
                        }
                    }
                }
            });
            res.json({
                allMessages,
            });
            return;
        }
        catch (e) {
            res.status(303).json({
                message: "Error with fetching messages",
                error: e
            });
            return;
        }
    }
    catch (e) {
        res.status(303).json({
            message: "Error with input",
            error: e
        });
        return;
    }
});
exports.messageRouter.get('/users', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    try {
        const users = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            select: {
                senderId: true,
                receiverId: true
            }
        });
        let uniqueUserArray = [];
        users.forEach((item) => {
            if (item.receiverId !== userId && !uniqueUserArray.includes(item.receiverId)) {
                uniqueUserArray.push(item.receiverId);
            }
            if (item.senderId !== userId && !uniqueUserArray.includes(item.senderId)) {
                uniqueUserArray.push(item.senderId);
            }
        });
        const userDetails = await prisma.user.findMany({
            where: {
                id: { in: uniqueUserArray }
            },
            select: {
                id: true,
                profilePicture: true,
                username: true
            }
        });
        res.json({
            userDetails
        });
    }
    catch (e) {
        res.status(304).json({
            message: e
        });
    }
});
exports.messageRouter.get('/:id', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const messageId = parseInt(req.params.id);
    try {
        const idMessage = await prisma.message.findFirst({
            where: {
                id: messageId,
                senderId: userId
            }
        });
        res.json({
            idMessage
        });
        return;
    }
    catch (e) {
        res.status(303).json({
            message: "Error with fetching message",
            error: e
        });
        return;
    }
});
exports.messageRouter.delete('/:id', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const messageId = parseInt(req.params.id);
    try {
        const deletedMessage = await prisma.message.delete({
            where: {
                id: messageId,
                senderId: userId
            }
        });
        res.json({
            deletedMessage
        });
        return;
    }
    catch (e) {
        res.status(303).json({
            message: "Error with fetching message",
            error: e
        });
        return;
    }
});
