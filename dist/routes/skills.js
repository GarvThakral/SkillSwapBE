"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
const zod_1 = require("zod");
exports.skillRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.skillRouter.post("/", userMiddleware_1.userMiddleware, async (req, res) => {
    const requiredBody = zod_1.z.object({
        title: zod_1.z.string().min(3),
        description: zod_1.z.string().min(10),
        proficiencyLevel: zod_1.z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
    });
    const parsedBody = requiredBody.parse(req.body);
    const { title, description, proficiencyLevel } = parsedBody;
    // @ts-ignore
    const userId = req.id;
    try {
        const newskill = await prisma.skill.create({
            data: {
                userId,
                title,
                description,
                proficiencyLevel
            }
        });
        console.log(newskill);
        res.json({
            newskill
        });
        return;
    }
    catch (e) {
        res.json({
            error: e
        });
        return;
    }
});
exports.skillRouter.get('/', async (req, res) => {
    try {
        const skills = await prisma.skill.findMany({
            where: {
                userId: 1
            }
        });
        res.json({
            skills
        });
    }
    catch (e) {
        res.status(303).json({
            error: e
        });
    }
});
exports.skillRouter.get("/:id", async (req, res) => {
    const skillId = parseInt(req.params.id);
    try {
        const skill = await prisma.skill.findUnique({ where: { id: skillId } });
        if (!skill) {
            res.status(404).json({ message: "Skill not found" });
            return;
        }
        res.json(skill);
        return;
    }
    catch (e) {
        res.status(500).json({ error: "Failed to fetch skill" });
        return;
    }
});
exports.skillRouter.put("/:id", async (req, res) => {
    const skillId = parseInt(req.params.id);
    const { title, description, proficiencyLevel } = req.body;
    try {
        const updatedSkill = await prisma.skill.update({
            where: { id: skillId },
            data: { title, description, proficiencyLevel },
        });
        res.json(updatedSkill);
    }
    catch (e) {
        res.status(404).json({ message: "Skill not found or failed to update" });
    }
});
exports.skillRouter.delete("/:id", async (req, res) => {
    const skillId = parseInt(req.params.id);
    try {
        const deletedSkill = await prisma.skill.delete({ where: { id: skillId } });
        res.json({ message: "Skill deleted", deletedSkill });
    }
    catch (e) {
        res.status(404).json({ message: "Skill not found or failed to delete" });
    }
});
