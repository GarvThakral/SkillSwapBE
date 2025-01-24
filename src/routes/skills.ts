import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { userMiddleware } from '../middleware/userMiddleware';
import { z } from 'zod';

export const skillRouter = Router();
const prisma = new PrismaClient();

skillRouter.post("/",userMiddleware,async (req,res)=>{
    const requiredBody = z.object({
        title:z.string().min(3),
        description:z.string().min(10),
        proficiencyLevel:z.enum(["BEGINNER","INTERMEDIATE","ADVANCED"])
    });

    const parsedBody = requiredBody.parse(req.body);
    
    const {
        title,
        description,
        proficiencyLevel
    } = parsedBody;
    
    // @ts-ignore
    const userId = req.id;
    
    try{
        const newskill = await prisma.skill.create({
            data:{
                userId,
                title,
                description,
                proficiencyLevel
            }
        })
        console.log(newskill);
        res.json({
            newskill
        });
        return; 
    }catch(e){
        res.json({
            error:e
        });
        return;
    }
});

skillRouter.get('/',async (req,res)=>{
    try{
        const skills = await prisma.skill.findMany({
            where:{
                userId:1
            }
        })
        res.json({
            skills
        })
    }catch(e){
        res.status(303).json({
            error:e
        })
    }
});

skillRouter.get("/:id", async (req, res) => {
    const skillId = parseInt(req.params.id);

    try {
        const skill = await prisma.skill.findUnique({ where: { id: skillId } });
        if (!skill) {
            res.status(404).json({ message: "Skill not found" });
            return;
        }
        res.json(skill);
        return;
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch skill" });
        return;
    }
});

skillRouter.put("/:id", async (req, res) => {
    const skillId = parseInt(req.params.id);
    const { title, description, proficiencyLevel } = req.body;

    try {
        const updatedSkill = await prisma.skill.update({
            where: { id: skillId },
            data: { title, description, proficiencyLevel },
        });
        res.json(updatedSkill);
    } catch (e) {
        res.status(404).json({ message: "Skill not found or failed to update" });
    }
});

skillRouter.delete("/:id", async (req, res) => {
    const skillId = parseInt(req.params.id);

    try {
        const deletedSkill = await prisma.skill.delete({ where: { id: skillId } });
        res.json({ message: "Skill deleted", deletedSkill });
    } catch (e) {
        res.status(404).json({ message: "Skill not found or failed to delete" });
    }
});