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
exports.userRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = require("bcrypt");
const zod_1 = require("zod");
const jsonwebtoken_1 = require("jsonwebtoken");
const userMiddleware_1 = require("../middleware/userMiddleware");
const JWT_SECRET = process.env.VITE_USER_TOKEN;
exports.userRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.userRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.z.object({
        username: zod_1.z.string().min(3).max(10),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(3).max(10),
        profilePicture: zod_1.z.string(),
        bio: zod_1.z.string(),
        skillsSought: zod_1.z.array(zod_1.z.number()),
        skillsOffered: zod_1.z.array(zod_1.z.number()),
        availabilitySchedule: zod_1.z.string(),
        serviceDuration: zod_1.z.number(),
    });
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { username, email, password, profilePicture, bio, skillsSought, skillsOffered, availabilitySchedule, serviceDuration } = parsedBody;
        const userExists = yield prisma.user.findFirst({
            where: {
                username
            }
        });
        try {
            if (!userExists) {
                const emailExists = yield prisma.user.findFirst({
                    where: {
                        email
                    }
                });
                if (!emailExists) {
                    const hashedPassword = yield (0, bcrypt_1.hash)(password, 5);
                    const user = yield prisma.user.create({
                        data: {
                            username,
                            email,
                            password: hashedPassword,
                            profilePicture,
                            tokens: 100,
                            bio,
                            skillsSought: {
                                connect: skillsSought.map((id) => ({ id })),
                            },
                            skillsOffered: {
                                connect: skillsOffered.map((id) => ({ id })),
                            },
                            availabilitySchedule,
                            serviceDuration,
                        },
                    });
                    res.status(200).json({
                        user
                    });
                    return;
                }
                else {
                    res.status(205).json({
                        message: "The Email already exists"
                    });
                    return;
                }
            }
            else {
                res.status(204).json({
                    message: "The username already exists"
                });
                return;
            }
        }
        catch (e) {
            res.status(303).json({
                error: e
            });
        }
    }
    catch (e) {
        res.status(400).json({ error: "Invalid request body", details: e });
        return;
    }
}));
exports.userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const userExists = yield prisma.user.findFirst({
            where: {
                username
            }
        });
        if (userExists) {
            const userId = userExists.id;
            const correctPassword = yield (0, bcrypt_1.compare)(password, userExists.password);
            if (correctPassword && JWT_SECRET) {
                const token = (0, jsonwebtoken_1.sign)({ userId }, JWT_SECRET);
                res.json({
                    token
                });
                return;
            }
            else {
                res.status(304).json({
                    message: "Check your credentials"
                });
                return;
            }
        }
        else {
            res.status(303).json({
                message: "The user does not exist"
            });
            return;
        }
    }
    catch (e) {
        res.json({
            error: e
        });
    }
}));
exports.userRouter.get('/me', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id;
    try {
        const user = yield prisma.user.findFirst({
            where: {
                id: userId
            }
        });
        if (user) {
            res.json({
                user
            });
            return;
        }
        else {
            res.json({
                message: "The user may have been deleted"
            });
            return;
        }
    }
    catch (e) {
        res.json({
            error: e
        });
        return;
    }
}));
exports.userRouter.delete('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id;
    try {
        const deletedUser = yield prisma.user.delete({
            where: {
                id: userId
            }
        });
        res.json({
            deletedUser
        });
        return;
    }
    catch (e) {
        res.json({
            error: e
        });
        return;
    }
}));
exports.userRouter.get('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id);
    try {
        const user = yield prisma.user.findFirst({
            where: {
                id: userId
            },
            select: {
                username: true,
                profilePicture: true,
                bio: true,
                availabilitySchedule: true,
                serviceDuration: true,
            },
        });
        res.json({
            user
        });
        return;
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
        return;
    }
}));
exports.userRouter.put('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id);
    const requiredBody = zod_1.z.object({
        email: zod_1.z.string().email(),
        profilePicture: zod_1.z.string(),
        bio: zod_1.z.string(),
        skillsSought: zod_1.z.array(zod_1.z.number()),
        skillsOffered: zod_1.z.array(zod_1.z.number()),
        availabilitySchedule: zod_1.z.string(),
        serviceDuration: zod_1.z.number(),
    });
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { email, profilePicture, bio, skillsSought, skillsOffered, availabilitySchedule, serviceDuration, } = parsedBody;
        try {
            const user = yield prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    email,
                    profilePicture,
                    bio,
                    skillsSought: {
                        connect: skillsSought.map((id) => ({ id })),
                    },
                    skillsOffered: {
                        connect: skillsOffered.map((id) => ({ id })),
                    },
                    availabilitySchedule,
                    serviceDuration,
                }
            });
            res.json({
                user
            });
            return;
        }
        catch (e) {
            res.status(303).json({
                error: e
            });
            return;
        }
    }
    catch (e) {
        res.status(304).json({
            error: e
        });
    }
}));
