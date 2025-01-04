import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.VITE_USER_TOKEN

export function userMiddleware( req:any , res:any , next:any ){
    const token = req.headers['token'];    
    if(token && JWT_SECRET){
        try{
            const validToken = verify(token, JWT_SECRET);
            if(validToken){
                // @ts-ignore
                const userId = validToken.userId;
                req.id = userId;
                next();
            }
        }catch(e){
            res.json({
                error:e
            })
            return;
        }
    }else{
        res.status(300).json({
            message:"No token provided"
        })
        return;
    }
}