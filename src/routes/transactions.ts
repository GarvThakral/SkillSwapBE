import { Router } from 'express'
import { userMiddleware } from '../middleware/userMiddleware'
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
export const transactionRouter = Router();

const prisma = new PrismaClient();

transactionRouter.post('/',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    console.log(userId);

    const requiredBody = z.object({
        type : z.enum(["TOKEN_TRANSFER","SERVICE_PAYMENT"]),
        recieverId : z.number(),
        skillId : z.optional(z.number()),
        amount : z.number()
    })
    try{
        const parsedBody = requiredBody.parse(req.body);
        const {
            type,
            recieverId,
            skillId,
            amount
        } = parsedBody;

        try{
            const newTransaction = await prisma.transactions.create({
                data:{
                    type,
                    senderId:userId,
                    recieverId,
                    skillId,
                    amount
                }
            }) 
            res.json({
                message:"Transaction Successful",
                newTransaction
            });
            return;
        }catch(e){
            res.status(303).json({
                message:"Problem with the input"
            });
            return;
        }
    }catch(e){
        res.status(303).json({
            message:"Problem with the input"
        });
        return;
    }
});
transactionRouter.get('/',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    console.log(userId);
    try{
        const userTransactions = await prisma.transactions.findMany({
            where:{
                OR:[
                    {senderId:userId},
                    {recieverId:userId}
                ]
            }
        });
        res.json({
            userTransactions
        });
        return;

    }catch(e){
        res.status(303).json({
            message:"Error finding transactions",
            error:e
        });
        return;
    }
});
transactionRouter.get('/:id',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const transactionId = parseInt(req.params.id);
    try{
        const transactionDetails = await prisma.transactions.findFirst({
            where:{
                id:transactionId,
                OR:[
                    {senderId:userId},
                    {recieverId:userId}
                ]
            }
        })
        res.json({
            transactionDetails
        });
        return;
    }catch(e){
        res.status(303).json({
            message:"Error finding the transaction you were looking for"
        });
        return;
    }
});