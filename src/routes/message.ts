import { Router } from 'express';
import { userMiddleware } from '../middleware/userMiddleware';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
export const messageRouter = Router();

const prisma = new PrismaClient();

messageRouter.post('/',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const requiredBody = z.object({
        receiverId: z.number(),
        content:z.string(),
    })
    try{
        const parsedBody = requiredBody.parse(req.body);
        const {
            receiverId,
            content
        } = parsedBody;
        try{
            const newMessage = await prisma.message.create({
                data:{
                    senderId: userId,
                    receiverId,
                    content
                }
            });
            res.json({
                newMessage
            })
        }catch(e){
            res.status(303).json({
                message:"Error with creating a new message",
                error:e
            });
            return;
        }
    }catch(e){
        res.status(303).json({
            message:"Error with the input",
            error:e
        });
        return;
    }
});
messageRouter.get('/',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const requiredBody = z.object({
        receiverId: z.number(),
    })
    try{
        const parsedBody = requiredBody.parse(req.body);
        const {
            receiverId
        } = parsedBody;
        try{
            const allMessages = await prisma.message.findMany({
                where:{
                    senderId:userId,
                    receiverId
                }
            });
            res.json({
                allMessages
            });
            return;
        }catch(e){
            res.status(303).json({
                message:"Error with fetching messages",
                error:e
            });
            return;
        }
    }catch(e){
        res.status(303).json({
            message:"Error with input",
            error:e
        });
        return;
    }
});
messageRouter.get('/:id',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const messageId = parseInt(req.params.id);
    try{
        const idMessage = await prisma.message.findFirst({
            where:{
                id:messageId,
                senderId:userId
            }
        });
        res.json({
            idMessage
        });
        return;
    }catch(e){
        res.status(303).json({
            message:"Error with fetching message",
            error:e
        });
        return;
    }
});
messageRouter.delete('/:id',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    const messageId = parseInt(req.params.id);
    try{
        const deletedMessage = await prisma.message.delete({
            where:{
                id:messageId,
                senderId:userId
            }
        })
        res.json({
            deletedMessage
        });
        return;
    }catch(e){
        res.status(303).json({
            message:"Error with fetching message",
            error:e
        });
        return;
    }
});