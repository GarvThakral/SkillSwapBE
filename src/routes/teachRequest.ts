import { Router } from 'express';
import { userMiddleware } from '../middleware/userMiddleware';
import { PrismaClient } from '@prisma/client';

export const teachRequestRouter = Router();
const prisma = new PrismaClient();

teachRequestRouter.get('/get',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    try{
        console.log("Reached");
        const teachRequests = await prisma.teachRequest.findMany({
            where:{
                receiverId:userId
            },
            include:{
                sender:{
                    select:{
                        id:true,
                        profilePicture:true,
                        username:true,
                        availabilitySchedule:true,
                    }
                },
                receiver:{
                    select:{
                        id:true,
                        profilePicture:true,
                        username:true,
                        availabilitySchedule:true,
                    }
                },
                skill:{
                    select:{
                        id:true,
                        title:true,
                        description:true,
                        proficiencyLevel:true
                    }
                }
            }
        });
        res.json({
            message:"Here are all teaching requests",
            teachRequests
        })
    }catch(e){
        console.log("Eror happened");
        res.json({
            error:e
        })
    }
});

teachRequestRouter.post('/',userMiddleware,async (req,res)=>{
    const { receiverId , skillId , description , workingDays , recieverToken , serviceId} = req.body;
    // @ts-ignore
    const userId = req.id;

    try{
        const teachReq = await prisma.teachRequest.create({
            data:{
                senderId:userId,
                receiverId,
                skillId,
                description,
                workingDays,
                recieverToken,
                status:"PENDING",
                type: "TEACH",
                serviceId
            }
        })
        res.json({
            message:"Teach Request Created",
            teachReq
        })
    }catch(e){
        res.status(303).json({
            error:e
        })
    }
});

teachRequestRouter.post('/accept' , userMiddleware , async (req,res)=>{
    
    //@ts-ignore
    const userId = req.id;
    const {requestId} = req.body; 

    try{
        const teachReq = await prisma.teachRequest.update({
            where:{
                id:requestId,
            },
            data:{
                status:"ACCEPTED"
            }
        })
        res.json({
            message : teachReq
        });
    }catch(e){
        res.status(303).json({
            error:e
        });
    }
});

teachRequestRouter.post('/pending', userMiddleware ,async(req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const { receiverId , skillId } = req.body;
    try{
        const sentRequest = await prisma.teachRequest.findFirst({
            where:{
                senderId:userId,
                receiverId,
                skillId,
                status:"PENDING",
            }
        });
        if(sentRequest){
            res.status(200).json({
                message:"Request for this skill already sent"
            });
        }else{
            res.status(204).json({
                message:"Request for this skill already sent"
            });

        }
    }catch(e){
        res.status(304).json({
            error:e
        });
    }
});

teachRequestRouter.post('/deny' , userMiddleware , async (req,res)=>{
    console.log("Reached")
    //@ts-ignore
    const userId = req.id;
    const {requestId} = req.body;

    try{
        const teachReq = await prisma.teachRequest.delete({
            where:{
                id:requestId,
            }
        })
        res.json({
            message : teachReq
        });
    }catch(e){
        res.status(303).json({
            error:e
        });
    }
});

teachRequestRouter.delete('/',async (req,res)=>{
    const {teachRequestId} = req.body;
    try{
        const deletedRequest = await prisma.teachRequest.delete({
            where:{
                id:teachRequestId
            }
        })
        res.json({
            deletedRequest
        });
    }catch(e){
        res.status(304).json({
            error:e
        });
    }
});