import { Router } from 'express';
import { userMiddleware } from '../middleware/userMiddleware';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
export const ratingRouter = Router();

const prisma = new PrismaClient();

ratingRouter.post('/',userMiddleware,async (req,res)=>{
    //@ts-ignore
    const userId = req.id;
    const requiredBody = z.object({
        receiverId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string(),
    });
    try{
        const parsedBody = requiredBody.parse(req.body);
        const {
            receiverId,
            rating,
            comment
        } = parsedBody;

        try{
            const newRating = await prisma.userRating.create({
                data:{
                    receiverId,
                    raterId:userId,
                    rating,
                    comment
                }
            })
            res.json({
                newRating
            });
            return;
        }catch(e){
            res.status(303).json({
                message:"Problem with creating the rating"
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
ratingRouter.get('/',userMiddleware,async (req,res)=>{
    //@ts-ignore
    const userId = req.id;
    try{
        const userRatings = await prisma.userRating.findMany({
            where:{
                receiverId:userId
            }
        })
        res.json({
            userRatings
        });
        return;
    }catch(e){
        res.status(303).json({
            message:"Problem with finding the rating for the user"
        });
        return;
    }
});
ratingRouter.get('/:id',userMiddleware,async (req,res)=>{
    //@ts-ignore
    const userId = req.id;
    const ratingId = parseInt(req.params.id);
    try{
        const userRatings = await prisma.userRating.findMany({
            where:{
                id:ratingId,
                receiverId:userId
            }
        })
        res.json({
            userRatings
        });
        return;
    }catch(e){
        res.status(303).json({
            message:"Problem with finding the rating with the id "+ratingId
        });
        return;
    }

});