// POST /service-requests: Create a service request (request a skill from another user).
// GET /service-requests: Get all service requests for the authenticated user.
// GET /service-requests/:id: Fetch a specific service request by ID.
// PUT /service-requests/:id: Update a service request (e.g., change status from PENDING to COMPLETED).
// DELETE /service-requests/:id: Cancel or delete a service request.

import { Router } from 'express';
import { userMiddleware } from '../middleware/userMiddleware';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const serviceRouter = Router();
const prisma = new PrismaClient();

serviceRouter.post('/',userMiddleware,async (req,res)=>{
    const requiredBody = z.object({
        skillId:z.number(),
        status:z.enum(['PENDING', 'COMPLETED', 'CANCELLED'])
    });
    // @ts-ignore
    const userId = req.id;
    try{
        const parsedBody = requiredBody.parse(req.body);
        const {
            skillId,
            status
        } = parsedBody;

        try{
            const newRequest = await prisma.serviceRequest.create({
                data:{
                    requesterId:userId,
                    skillId,
                    status
                }
            })
            res.json({
                message:"New service created",
                newRequest
            })
        }catch(e){
            res.status(303).json({
                message:"Failed to create service",
                error:e
            });
            return;
        }
    }catch (e) {
        res.status(400).json({
            message: "Invalid input",
            error: e,
        });
    }

});

serviceRouter.get('/:id',async (req,res)=>{
    // @ts-ignore
    const serviceId = parseInt(req.params.id);
    try{
        const serviceRequest = await prisma.serviceRequest.findFirst({
            where:{
                id:serviceId
            }
        })
        if (!serviceRequest) {
            res.status(404).json({ message: "Service request not found" });
            return
        }
        res.json({ 
            serviceRequest
        });
        return;
    }catch(e){
        res.status(400).json({
            message:"error " +e
        })
    }
});

serviceRouter.get('/',userMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.id;
    try{
        const serviceRequests = await prisma.serviceRequest.findMany({
            where:{
                requesterId:userId
            }
        })
        res.json({
            serviceRequests
        })
        return;
    }catch(e){
        res.status(400).json({
            message:"error " +e
        })
    }
});

serviceRouter.put('/:id',userMiddleware,async (req,res)=>{
    const serviceId = parseInt(req.params.id);

    const requiredBody = z.object({
        skillId:z.number(),
        status:z.enum(['PENDING', 'COMPLETED', 'CANCELLED'])
    });

    // @ts-ignore
    const userId = req.id;

    try{
        const parsedBody = requiredBody.parse(req.body);
        const {
            skillId,
            status
        } = parsedBody;

        try{
            const requestFound = await prisma.serviceRequest.update({
                where:{
                    id:serviceId,
                    requesterId:userId
                },
                data:{
                    skillId,
                    status
                }
            })
            res.json({
                message:"Updated service",
                requestFound
            });
            return;
        }catch(e){
            res.json({
                message:"Failed to update service",
                error:e
            });
            return;
        }
    }catch(e){
        res.status(400).json({
            e,
            message:"Invalid input"
        })
    }

});

serviceRouter.delete('/:id',userMiddleware,async (req,res)=>{
    const serviceId = parseInt(req.params.id);

    // @ts-ignore
    const userId = req.id;


    try{
        const deletedService = await prisma.serviceRequest.delete({
            where:{
                id:serviceId,
                requesterId:userId
            }
        })
        res.json({
            message:"Deleted service",
            deletedService
        });
        return;
    }catch(e){
        res.json({
            message:"Failed to delete service",
            error:e
        });
        return;
    }


});