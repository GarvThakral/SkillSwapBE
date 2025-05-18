import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { z } from 'zod';
import { sign } from "jsonwebtoken";
import {userMiddleware} from '../middleware/userMiddleware'
import multer from "multer";
import {v2 as cloudinary} from 'cloudinary';

const JWT_SECRET = process.env.VITE_USER_TOKEN;
export const userRouter = Router();
const prisma = new PrismaClient();

const Storage = multer.memoryStorage();
const upload = multer({storage:Storage})

cloudinary.config({ 
    cloud_name: 'dxbih92ua', 
    api_key: '615982824794157', 
    api_secret: '-HxRiJj8VPiYS94xCmPRrylng1A'
});




// @ts-ignore
userRouter.post('/signup', upload.single('profilePicture'), async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const requiredBody = z.object({
      username: z.string().min(3).max(20),
      email: z.string().email(),
      password: z.string().min(3).max(20),
      bio: z.string(),
      skillsSought: z.optional(z.array(z.number())),
      skillsOffered:  z.optional(z.array(z.number())),
      availabilitySchedule: z.string(),
    });
    
    try {
      // Parse the form body excluding profilePicture
      const parsedBody = requiredBody.parse(req.body);
      const { username, email, password, bio, skillsSought, skillsOffered, availabilitySchedule } = parsedBody;
  
      // Get the uploaded file from Multer
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Profile picture is required." });
      }
  
      const cloudinaryResponse = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'profile_pictures' },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            if (!result?.secure_url) {
              return reject(new Error("Image upload failed or result is invalid."));
            }
            resolve(result.secure_url);
          }
        );
  
        uploadStream.end(file.buffer);
      });
  
      const profilePicture = cloudinaryResponse;
  
      // Check if user exists
      const userExists = await prisma.user.findFirst({
        where: { username },
      });
  
      if (!userExists) {
        const emailExists = await prisma.user.findFirst({
          where: { email },
        });
  
        if (!emailExists) {
          const hashedPassword = await hash(password, 5);
          // Save user with profile picture URL
          const user = await prisma.user.create({
            data: {
              username,
              email,
              password: hashedPassword,
              profilePicture,
              tokens: 100,
              bio,
              skillsSought: {
                connect: skillsSought?.map((id) => ({ id })),
              },
              skillsOffered: {
                connect: skillsOffered?.map((id) => ({ id })),
              },
              availabilitySchedule,
            },
          });
  
          res.status(200).json({ user });
          return;
        } else {
          res.status(409).json({ message: 'The Email already exists' });
          return;
        }
      } else {
        res.status(409).json({ message: 'The username already exists' });
        return;
      }
    } catch (e) {
      res.status(400).json({ error: 'Invalid request body', details: e });
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
                    token,
                    userId
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
        res.status(403).json({
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

userRouter.post('/tokens' , async (req,res)=>{
    // @ts-ignore
    const {userId}= req.body;
    try{
        const UsersTokens = await prisma.user.findFirst({
            where:{
                id:userId
            },
            select:{
                tokens:true
            }
        })
        res.json({
            UsersTokens
        })
    }catch(e){
        res.status(405).json({
            error:e
        })
    }
})