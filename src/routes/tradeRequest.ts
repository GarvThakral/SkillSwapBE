import { Router } from 'express';
import { userMiddleware } from '../middleware/userMiddleware';
import { PrismaClient } from '@prisma/client';

export const tradeRequestRouter = Router();
const prisma = new PrismaClient();


tradeRequestRouter.post('/',userMiddleware,async (req,res)=>{
    const { receiverId , skillId } = req.body;
    // @ts-ignore
    const userId = req.id;

    try{
        const tradeReq = await prisma.tradeRequest.create({
            data:{
                senderId:userId,
                receiverId,
                skillId,
                status:"PENDING"
            }
        })
        res.json({
            message:"Teach Request Created",
            tradeReq
        })
    }catch(e){
        res.status(303).json({
            error:e
        })
    }
})