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
        senderId: z.optional(z.number()),
        receiverId: z.number(),
        content:z.string(),
        type:z.optional(z.enum(["REGULAR","MEETING"])),
        meetingId:z.optional(z.string())
    })
    try{
        const parsedBody = requiredBody.parse(req.body);
        const {
            senderId,
            receiverId,
            content,
            type,
            meetingId
        } = parsedBody;
        try{
            if(senderId){
                const newMessage = await prisma.message.create({
                    data:{
                        senderId,
                        receiverId,
                        content,
                        type,
                        meetingId
                    }
                });
                res.json({
                    newMessage
                })
            }else{
                const newMessage = await prisma.message.create({
                    data:{
                        senderId: userId,
                        receiverId,
                        content,
                        type,
                        meetingId
                    }
                });
                res.json({
                    newMessage
                })
            }
            
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
messageRouter.post('/fetchMessages',userMiddleware,async (req,res)=>{
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
                    OR:[
                        {senderId:userId,
                        receiverId},
                        {senderId:receiverId,
                        receiverId:userId},

                    ]
                },
                select:{
                    type:true,
                    content:true,
                    sender:{
                        select:{
                            id:true,
                            profilePicture:true
                        }
                    },
                    receiver:{
                        select:{
                            id:true,
                            profilePicture:true
                        }
                    }
                }
            });
            res.json({
                allMessages,
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
messageRouter.get('/users' , userMiddleware , async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    try{
        const users = await prisma.message.findMany({
            where:{
                OR:[
                    {senderId:userId},
                    {receiverId:userId}
                ]
            },
            select:{
                senderId:true,
                receiverId:true
            }
        })
        let uniqueUserArray:number[] = []
        users.forEach((item) => {
            if (item.receiverId !== userId && !uniqueUserArray.includes(item.receiverId)) {
                uniqueUserArray.push(item.receiverId);
            }
            if (item.senderId !== userId && !uniqueUserArray.includes(item.senderId)) {
                uniqueUserArray.push(item.senderId);
            }
        });

        const userDetails = await prisma.user.findMany({
            where:{
                id:{in:uniqueUserArray}
            },
            select:{
                id:true,
                profilePicture:true,
                username:true
            }
        })

        res.json({
            userDetails
        })
    }catch(e){
        res.status(304).json({
            message:e
        })
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