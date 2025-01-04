"use strict";
// POST /service-requests: Create a service request (request a skill from another user).
// GET /service-requests: Get all service requests for the authenticated user.
// GET /service-requests/:id: Fetch a specific service request by ID.
// PUT /service-requests/:id: Update a service request (e.g., change status from PENDING to COMPLETED).
// DELETE /service-requests/:id: Cancel or delete a service request.
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
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const serviceRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
serviceRouter.post('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.z.object({
        skillId: zod_1.z.number(),
        status: zod_1.z.enum(['PENDING', 'COMPLETED', 'CANCELLED'])
    });
    // @ts-ignore
    const userId = req.id;
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { skillId, status } = parsedBody;
        try {
            const newRequest = yield prisma.serviceRequest.create({
                data: {
                    requesterId: userId,
                    skillId,
                    status
                }
            });
            res.json({
                message: "New service created",
                newRequest
            });
        }
        catch (e) {
            res.status(303).json({
                message: "Failed to create service",
                error: e
            });
            return;
        }
    }
    catch (e) {
        res.status(400).json({
            message: "Invalid input",
            error: e,
        });
    }
}));
serviceRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const serviceId = parseInt(req.params.id);
    try {
        const serviceRequest = yield prisma.serviceRequest.findFirst({
            where: {
                id: serviceId
            }
        });
        if (!serviceRequest) {
            res.status(404).json({ message: "Service request not found" });
            return;
        }
        res.json({
            serviceRequest
        });
        return;
    }
    catch (e) {
        res.status(400).json({
            message: "error " + e
        });
    }
}));
serviceRouter.get('/', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id;
    try {
        const serviceRequests = yield prisma.serviceRequest.findMany({
            where: {
                requesterId: userId
            }
        });
        res.json({
            serviceRequests
        });
        return;
    }
    catch (e) {
        res.status(400).json({
            message: "error " + e
        });
    }
}));
serviceRouter.put('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = parseInt(req.params.id);
    const requiredBody = zod_1.z.object({
        skillId: zod_1.z.number(),
        status: zod_1.z.enum(['PENDING', 'COMPLETED', 'CANCELLED'])
    });
    // @ts-ignore
    const userId = req.id;
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { skillId, status } = parsedBody;
        try {
            const requestFound = yield prisma.serviceRequest.update({
                where: {
                    id: serviceId,
                    requesterId: userId
                },
                data: {
                    skillId,
                    status
                }
            });
            res.json({
                message: "Updated service",
                requestFound
            });
            return;
        }
        catch (e) {
            res.json({
                message: "Failed to update service",
                error: e
            });
            return;
        }
    }
    catch (e) {
        res.status(400).json({
            e,
            message: "Invalid input"
        });
    }
}));
serviceRouter.delete('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = parseInt(req.params.id);
    // @ts-ignore
    const userId = req.id;
    try {
        const deletedService = yield prisma.serviceRequest.delete({
            where: {
                id: serviceId,
                requesterId: userId
            }
        });
        res.json({
            message: "Deleted service",
            deletedService
        });
        return;
    }
    catch (e) {
        res.json({
            message: "Failed to delete service",
            error: e
        });
        return;
    }
}));
