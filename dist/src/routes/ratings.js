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
exports.ratingRouter = void 0;
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.ratingRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.ratingRouter.post('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.id;
    const requiredBody = zod_1.z.object({
        receiverId: zod_1.z.number(),
        rating: zod_1.z.number().min(1).max(5),
        comment: zod_1.z.string(),
    });
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { receiverId, rating, comment } = parsedBody;
        try {
            const newRating = yield prisma.userRating.create({
                data: {
                    receiverId,
                    raterId: userId,
                    rating,
                    comment
                }
            });
            res.json({
                newRating
            });
            return;
        }
        catch (e) {
            res.status(303).json({
                message: "Problem with creating the rating"
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
exports.ratingRouter.get('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.id;
    try {
        const userRatings = yield prisma.userRating.findMany({
            where: {
                receiverId: userId
            }
        });
        res.json({
            userRatings
        });
        return;
    }
    catch (e) {
        res.status(303).json({
            message: "Problem with finding the rating for the user"
        });
        return;
    }
}));
exports.ratingRouter.get('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.id;
    const ratingId = parseInt(req.params.id);
    try {
        const userRatings = yield prisma.userRating.findMany({
            where: {
                id: ratingId,
                receiverId: userId
            }
        });
        res.json({
            userRatings
        });
        return;
    }
    catch (e) {
        res.status(303).json({
            message: "Problem with finding the rating with the id " + ratingId
        });
        return;
    }
}));
