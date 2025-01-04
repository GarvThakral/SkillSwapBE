import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { z } from 'zod';
import { sign } from "jsonwebtoken";
import {userMiddleware} from '../middleware/userMiddleware'

const JWT_SECRET = process.env.VITE_USER_TOKEN;
export const userRouter = Router();
const prisma = new PrismaClient(); 

userRouter.post('/signup',async (req,res)=>{
    
   const requiredBody = z.object({
        username: z.string().min(3).max(10),
        email: z.string().email(),
        password: z.string().min(3).max(10),
        profilePicture: z.string(),
        bio: z.string(),
        skillsSought: z.array(z.number()),
        skillsOffered: z.array(z.number()),
        availabilitySchedule: z.string(),
        serviceDuration: z.number(),
    });
   try{

    const parsedBody = requiredBody.parse(req.body);

    const {
            username,
            email,
            password,
            profilePicture,
            bio,
            skillsSought,
            skillsOffered,
            availabilitySchedule,
            serviceDuration
        } = parsedBody; 

        const userExists = await prisma.user.findFirst({
            where:{
                username
            }
        })
        try{
            if(!userExists){
                const emailExists = await prisma.user.findFirst({
                    where:{
                        email
                    }
                })
                if(!emailExists){
                    const hashedPassword = await hash(password, 5);
                    const user = await prisma.user.create({
                        data: {
                            username,
                            email,
                            password:hashedPassword,
                            profilePicture,
                            tokens:100,
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
                }else{
                    res.status(205).json({
                        message:"The Email already exists"
                    })
                    return;
                }
            }else{
                res.status(204).json({
                    message:"The username already exists"
                })
                return;
            }
        }catch(e){
            res.status(303).json({
                error:e
            })
        }
    }catch(e){
        res.status(400).json({ error: "Invalid request body", details: e });
        return;
    }

});

userRouter.post('/signin',async (req,res)=>{
    const { username , password } = req.body;
    try{
        const userExists = await prisma.user.findFirst({
            where:{
                username
            }
        });
        if(userExists){
            const userId = userExists.id
            const correctPassword = await compare(password, userExists.password);
            if(correctPassword && JWT_SECRET){
                const token = sign({userId}, JWT_SECRET);
                res.json({
                    token
                })
                return;
            }else{
                res.status(304).json({
                    message:"Check your credentials"
                });
                return;
            }
        }else{
            res.status(303).json({
                message:"The user does not exist"
            });
            return;
        }
    }catch(e){
        res.json({
            error:e
        })
    }
});

userRouter.get('/me', userMiddleware ,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    try{
        const user = await prisma.user.findFirst({
            where:{
                id:userId
            }
        })
        if(user){
            res.json({
                user
            });
            return;
        }else{
            res.json({
                message:"The user may have been deleted"
            });
            return;
        }
    }catch(e){
        res.json({
            error:e
        });
        return;
    }
});

userRouter.delete('/' , userMiddleware , async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    try{
        const deletedUser = await prisma.user.delete({
            where:{
                id:userId
            }
        });
        res.json({
            deletedUser
        })
        return;
    }catch(e){
        res.json({
            error:e
        });
        return;
    }
});

userRouter.get('/:id' , userMiddleware , async(req,res)=>{
    const userId = parseInt(req.params.id);
    try{
        const user = await prisma.user.findFirst({
            where:{
                id:userId
            },
            select: {
                username: true,
                profilePicture: true,
                bio: true,
                availabilitySchedule: true,
                serviceDuration: true,
            },
        })
        res.json({
            user
        });
        return;
    }catch(e){
        res.status(303).json({
            error:e
        })
        return;
    }
});

userRouter.put('/:id' , userMiddleware , async(req,res)=>{
    const userId = parseInt(req.params.id);
    const requiredBody = z.object({
        email: z.string().email(),
        profilePicture: z.string(),
        bio: z.string(),
        skillsSought: z.array(z.number()),
        skillsOffered: z.array(z.number()),
        availabilitySchedule: z.string(),
        serviceDuration: z.number(),
    });
   try{

    const parsedBody = requiredBody.parse(req.body);
    const {
        email,
        profilePicture,
        bio,
        skillsSought,
        skillsOffered,
        availabilitySchedule,
        serviceDuration,
    } = parsedBody;
    try{
        const user = await prisma.user.update({
            where:{
                id:userId
            },
            data:{
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
        }catch(e){
            res.status(303).json({
                error:e
            })
            return;
        }
    }catch(e){
        res.status(304).json({
            error:e
        })
    }
});

userRouter.post('/:id/skills/sought',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const skillId = parseInt(req.params.id);
    try{

        let skill = await prisma.skill.findUnique({
            where: {
                id:skillId
            }
        });
        if(!skill){
            res.status(400).json({
                message:"This skill does not exist"
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
    }catch(e){
        res.status(303).json({
            message:"Problem with the input"
        });
        return;
    }
});

userRouter.post('/:id/skills/offered',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const skillId = parseInt(req.params.id);
    try{
        let skill = await prisma.skill.findUnique({
            where: {
                id:skillId
            }
        });
        if(!skill){
            res.status(400).json({
                message:"The skill does not exist"
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
    }catch(e){
        res.status(303).json({
            message:"Problem with the input"
        });
        return;
    }
    
});

userRouter.delete('/:id/skills/sought',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const skillId = parseInt(req.params.id);
    
    try{

        let skill = await prisma.skill.findUnique({
            where: {
                id:skillId
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

        

        
    }catch(e){
        res.status(303).json({
            message:"Problem with the input"
        });
        return;
    }
    
});

userRouter.delete('/:id/skills/offered',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const skillId = parseInt(req.params.id);
    
    try{

        let skill = await prisma.skill.findUnique({
            where: {
                id:skillId
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

        

        
    }catch(e){
        res.status(303).json({
            message:"Problem with the input"
        });
        return;
    }

});