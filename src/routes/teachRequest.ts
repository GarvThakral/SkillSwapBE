import { Router } from 'express';
import { userMiddleware } from '../middleware/userMiddleware';
import { PrismaClient } from '@prisma/client';

export const teachRequestRouter = Router();
const prisma = new PrismaClient();


teachRequestRouter.post('/',userMiddleware,async (req,res)=>{
    const { receiverId , skillId } = req.body;
    // @ts-ignore
    const userId = req.id;

    try{
        const teachReq = await prisma.teachRequest.create({
            data:{
                senderId:userId,
                receiverId,
                skillId,
                status:"PENDING"
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
})