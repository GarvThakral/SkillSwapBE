import { Router } from 'express';
import RazorPay from 'razorpay'
import  crypto from  'crypto';
import { Prisma, PrismaClient } from '@prisma/client';

const key_id = process.env.RAZOR_KEY_ID ?? ""
const key_secret = process.env.RAZOR_KEY_SECRET ?? ""
var instance  = new RazorPay({
    key_id,
    key_secret
})
const prisma = new PrismaClient()

export const paymentRouter = Router();

paymentRouter.post("/create-order", async (req, res) => {
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt#1",
    };
  
    try {
      const order = await instance.orders.create(options);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

paymentRouter.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature , userId } = req.body;
  const intId = parseInt(userId)
  const hmac = crypto.createHmac("sha256", key_secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === razorpay_signature) {
    res.json({ success: true, message: "Payment verified" });
    const paymentDetails = await instance.orders.fetch(razorpay_order_id);
    console.log(paymentDetails)
    let tokensInc;
    if(Number(paymentDetails.amount)/100 == 1999){
      tokensInc = 500

    }else{
      tokensInc = Number(paymentDetails.amount)/500
    }
    const updatedUser = await prisma.user.update({
        where:{
            id:intId
        },
        data:{
            tokens:{
                increment:tokensInc
            }
        }
    })
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});
