"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillManagementRouter = void 0;
// POST /user/:id/skills/sought: Add a skill to skillsSought for a user.
// POST /user/:id/skills/offered: Add a skill to skillsOffered for a user.
// DELETE /user/:id/skills/sought: Remove a skill from skillsSought for a user.
// DELETE /user/:id/skills/offered: Remove a skill from skillsOffered for a user.
const client_1 = require("@prisma/client");
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
exports.skillManagementRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.skillManagementRouter.post('/:id/skills/sought', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const skillId = parseInt(req.params.id);
    try {
        let skill = await prisma.skill.findUnique({
            where: {
                id: skillId
            }
        });
        if (!skill) {
            res.status(400).json({
                message: "This skill does not exist"
            });
            return;
        }
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                skillsSought: {
                    connect: { id: skill.id },
                },
            },
        });
        res.status(200).json({
            message: "Skill added successfully",
            updatedUser
        });
    }
    catch (e) {
        res.status(303).json({
            message: "Problem with the input"
        });
        return;
    }
});
exports.skillManagementRouter.post('/:id/skills/offered', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const skillId = parseInt(req.params.id);
    try {
        let skill = await prisma.skill.findUnique({
            where: {
                id: skillId
            }
        });
        if (!skill) {
            res.status(400).json({
                message: "The skill does not exist"
            });
            return;
        }
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                skillsOffered: {
                    connect: { id: skill.id },
                },
            },
        });
        res.status(200).json({
            message: "Skill added successfully",
            updatedUser
        });
    }
    catch (e) {
        res.status(303).json({
            message: "Problem with the input"
        });
        return;
    }
});
exports.skillManagementRouter.delete('/:id/skills/sought', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const skillId = parseInt(req.params.id);
    try {
        let skill = await prisma.skill.findUnique({
            where: {
                id: skillId
            }
        });
        if (skill) {
            const updatedUser = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    skillsSought: {
                        disconnect: { id: skill.id }
                    },
                },
            });
            res.status(200).json({
                message: "Skill disconnected successfully",
                updatedUser,
            });
            return;
        }
        res.status(200).json({
            message: "Skill does not exist",
        });
    }
    catch (e) {
        res.status(303).json({
            message: "Problem with the input"
        });
        return;
    }
});
exports.skillManagementRouter.delete('/:id/skills/offered', userMiddleware_1.userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const skillId = parseInt(req.params.id);
    try {
        let skill = await prisma.skill.findUnique({
            where: {
                id: skillId
            }
        });
        if (skill) {
            const updatedUser = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    skillsOffered: {
                        disconnect: { id: skill.id }
                    },
                },
            });
            res.status(200).json({
                message: "Skill disconnected successfully",
                updatedUser,
            });
            return;
        }
        res.status(200).json({
            message: "Skill does not exist",
        });
    }
    catch (e) {
        res.status(303).json({
            message: "Problem with the input"
        });
        return;
    }
});
