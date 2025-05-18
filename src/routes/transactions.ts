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
    console.log("REACHING TRANSACTION ROUTER");
    const requiredBody = z.object({
        type : z.enum(["TEACH_REQUEST","TRADE_REQUEST"]),
        recieverId : z.number(),
        senderSkillId : z.optional(z.number()),
        recieverSkillId : z.optional(z.number()),
        senderAmount : z.number(),
        recieverAmount : z.number(),
        requestId:z.number(),
        serviceId:z.number()
    })
    try{
        const parsedBody = requiredBody.parse(req.body);
        const {
            type,
            recieverId,
            senderSkillId,
            recieverSkillId,
            senderAmount,
            recieverAmount,
            requestId,
            serviceId
        } = parsedBody;

        try{
            if(type == "TEACH_REQUEST"){
                const newTransaction = await prisma.transactions.create({
                    data:{
                        type,
                        senderId:userId,
                        recieverId,
                        recieverSkillId,
                        senderAmount,
                        recieverAmount,
                        requestId,
                        serviceId
                    }
                }) 
                res.json({
                    message:"Teach Transaction Created",
                    newTransaction
                });
                return;
            }
            const newTransaction = await prisma.transactions.create({
                data:{
                    type,
                    senderId:userId,
                    recieverId,
                    senderSkillId,
                    recieverSkillId,
                    senderAmount,
                    recieverAmount,
                    requestId
                }
            }) 
            res.json({
                message:"Trade Transaction Created",
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
transactionRouter.post('/pending',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const {user2Id} = req.body;
    console.log(userId);
    console.log(user2Id);
    try{
        const transaction = await prisma.transactions.findFirst({
            where:{
                status:"PENDING",
                OR:[
                    { senderId:user2Id, recieverId:userId },
                    { senderId:userId , recieverId:user2Id }
                ],
            }
        })
        if(transaction){
            console.log(transaction)
            res.status(200).json({
                transaction
            });
        }else{
            console.log("NONE")
            res.status(205).json({
                message:"No pending transactions"
            })
        }
    }catch(e){
        res.status(304).json({
            error:e
        });
    }
});
transactionRouter.post("/complete", userMiddleware, async (req, res) => {
    const { id, senderId, recieverId, amount } = req.body;

    try {
        // Update transaction status to COMPLETED
        const transaction = await prisma.transactions.update({
            where: { id },
            data: { status: "COMPLETED" },
        });

        console.log("Transaction Updated:", transaction);

        if (transaction.type === "TEACH_REQUEST") {
            const teachRequests = await prisma.teachRequest.findMany({
                where: { serviceId: transaction.serviceId }
            });

            await prisma.teachRequest.update({
                where: { id: transaction.requestId },
                data: { status: "COMPLETED" }
            });

            if (teachRequests.length > 0) {
                await prisma.teachRequest.deleteMany({
                    where: { serviceId: transaction.serviceId }
                });
            }

            await prisma.user.update({
                where: { id: senderId },
                data: { tokens: { decrement: amount } }
            });

            await prisma.user.update({
                where: { id: recieverId },
                data: { tokens: { increment: amount } }
            });

            await prisma.transactions.deleteMany({
                where: { serviceId: transaction.serviceId }
            });
            const deletedService = await prisma.serviceRequest.delete({
                where: { id: transaction.serviceId }
            });

            console.log("Deleted service:", deletedService);
            console.log("Teach request transaction completed.");
            res.json({ message: "Transaction complete" });
            return;
        } 
        
        else if (transaction.type === "TRADE_REQUEST") {
            const netAmount = transaction.senderAmount - transaction.recieverAmount;

            await prisma.user.update({
                where: { id: senderId },
                data: { tokens: { increment: netAmount } }
            });

            await prisma.user.update({
                where: { id: recieverId },
                data: { tokens: { decrement: netAmount } }
            });

            await prisma.teachRequest.deleteMany({
                where: { serviceId: transaction.serviceId }
            });

            await prisma.tradeRequest.deleteMany({
                where: { serviceId: transaction.serviceId }
            });

            await prisma.transactions.deleteMany({
                where: { serviceId: transaction.serviceId }
            });

            const deletedService = await prisma.serviceRequest.delete({
                where: { id: transaction.serviceId }
            });

            console.log("Deleted service:", deletedService);
            res.json({ message: "Transaction complete" });
            return;
        } 
        
        else {
            res.status(400).json({ error: "Unknown transaction type" });
            return 
        }

    } catch (e) {
        console.error("Error in completing transaction:", e);
        res.status(500).json({ e });
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